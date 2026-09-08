import pytest
import uuid
import io
import os
import openpyxl
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from fastapi import HTTPException

from app.db.session import Base
from app.models.organization import Organization, SourceSystem
from app.models.material import RawMaterial, NormalizedMaterial, MaterialAttribute
from app.models.ingestion import IngestionJob
from app.models.governance import AuditLog
from app.services.file_parser import (
    compute_file_hash,
    detect_file_type,
    parse_csv_stream,
    parse_excel_stream,
    suggest_canonical_column_mapping,
)
from app.services.normalization import (
    normalize_whitespace_and_casing,
    normalize_uom,
    normalize_material_text,
)
from app.services.attribute_extractor import extract_deterministic_attributes
from app.services.ingestion_engine import validate_column_mapping, execute_ingestion_job
from app.api.v1.endpoints.ingestion import MAX_SYNC_INGESTION_ROWS


def test_file_type_and_hash_computation():
    csv_bytes = b"MAT_CODE,DESC\n1001,Bolt"
    assert detect_file_type("data.csv", csv_bytes) == "CSV"
    h1 = compute_file_hash(csv_bytes)
    h2 = compute_file_hash(csv_bytes)
    assert h1 == h2
    assert len(h1) == 64


def test_xls_legacy_rejection():
    """Verify that legacy binary .xls files are explicitly rejected with a clear message."""
    dummy_xls = b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1"  # BIFF8 magic bytes
    with pytest.raises(ValueError, match="Legacy binary Excel format \\(.xls\\) is not supported"):
        detect_file_type("legacy_catalog.xls", dummy_xls)


def test_csv_and_excel_parsing():
    # 1. Test CSV Parsing
    csv_content = b"MAT_CODE,ITEM_DESC,UOM\nIOCL-01,Hex Bolt M16,NOS\nIOCL-02,Gate Valve 2in,EA"
    headers, count, sample, all_rows = parse_csv_stream(csv_content)
    assert headers == ["MAT_CODE", "ITEM_DESC", "UOM"]
    assert count == 2
    assert len(sample) == 2
    assert all_rows[0]["MAT_CODE"] == "IOCL-01"

    # 2. Test Excel Parsing (.xlsx OpenXML)
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.append(["Material_Number", "Description", "Unit"])
    ws.append(["NTPC-01", "Ball Valve", "NOS"])
    ws.append(["NTPC-02", "Induction Motor", "SET"])
    excel_buf = io.BytesIO()
    wb.save(excel_buf)
    excel_bytes = excel_buf.getvalue()

    headers_xl, count_xl, sample_xl, all_rows_xl = parse_excel_stream(excel_bytes)
    assert headers_xl == ["Material_Number", "Description", "Unit"]
    assert count_xl == 2
    assert all_rows_xl[0]["Material_Number"] == "NTPC-01"


def test_column_discovery_and_mapping_validation():
    headers = ["ITEM_CODE", "MATERIAL_DESCRIPTION", "TECHNICAL_SPECS", "UNIT_OF_MEASURE", "OEM_NAME"]
    suggested = suggest_canonical_column_mapping(headers)
    assert suggested["material_code"] == "ITEM_CODE"
    assert suggested["description"] == "MATERIAL_DESCRIPTION"
    assert suggested["unit_of_measure"] == "UNIT_OF_MEASURE"
    assert suggested["manufacturer"] == "OEM_NAME"

    # Valid mapping
    valid_map = {"material_code": "ITEM_CODE", "description": "MATERIAL_DESCRIPTION"}
    is_valid, err = validate_column_mapping(headers, valid_map)
    assert is_valid is True
    assert err is None

    # Missing required field
    invalid_map = {"material_code": "ITEM_CODE"}
    is_valid2, err2 = validate_column_mapping(headers, invalid_map)
    assert is_valid2 is False
    assert "description" in err2

    # Non-existent mapped column
    invalid_col_map = {"material_code": "NON_EXISTENT_COL", "description": "MATERIAL_DESCRIPTION"}
    is_valid3, err3 = validate_column_mapping(headers, invalid_col_map)
    assert is_valid3 is False
    assert "NON_EXISTENT_COL" in err3


def test_normalization_and_unit_conversion():
    # Whitespace and noise normalization
    raw_desc = "  HEX   BOLT    M16  X   50 MM  SS304  ;;; "
    norm_desc = normalize_material_text(raw_desc)
    assert "HEX BOLT M16 x 50 MM SS304" in norm_desc
    assert "   " not in norm_desc

    # Conservative unit normalization
    assert normalize_uom("NOS")[0] == "EA"
    assert normalize_uom("Each")[0] == "EA"
    assert normalize_uom("MILLIMETRE")[0] == "mm"
    assert normalize_uom("KGS")[0] == "kg"
    assert normalize_uom("LTR")[0] == "L"
    assert normalize_uom("SET")[0] == "SET"


def test_deterministic_attribute_extraction():
    desc = "HEX BOLT M16 X 50 MM SS304 IS 1363"
    attrs = extract_deterministic_attributes(desc)
    attr_names = {a["attribute_name"]: a for a in attrs}

    assert "thread_pitch" in attr_names
    assert attr_names["thread_pitch"]["normalized_value"] == "M16"
    assert "diameter" in attr_names
    assert attr_names["diameter"]["normalized_value"] == "16.0"
    assert attr_names["diameter"]["normalized_unit"] == "mm"
    assert "length" in attr_names
    assert attr_names["length"]["normalized_value"] == "50.0"
    assert attr_names["length"]["normalized_unit"] == "mm"
    assert "material_grade" in attr_names
    assert attr_names["material_grade"]["normalized_value"] == "SS304"
    assert "standard_code" in attr_names
    assert "IS 1363" in attr_names["standard_code"]["normalized_value"]

    # Valve specs
    valve_desc = "2 INCH BALL VALVE CL300 FLANGED ASTM A216 WCB"
    valve_attrs = {a["attribute_name"]: a for a in extract_deterministic_attributes(valve_desc)}
    assert "nominal_size" in valve_attrs
    assert valve_attrs["nominal_size"]["normalized_value"] == "50.8"  # 2 inch * 25.4mm
    assert "pressure_class" in valve_attrs
    assert valve_attrs["pressure_class"]["normalized_value"] == "300"
    assert "material_grade" in valve_attrs
    assert "ASTM A216 WCB" in valve_attrs["material_grade"]["normalized_value"]


@pytest.mark.asyncio
async def test_end_to_end_ingestion_execution_and_sensitive_isolation(tmp_path):
    """
    Tests complete ingestion job execution and verifies:
    1. Layer 1 Raw Material record preserves raw proprietary PO prices and vendor information.
    2. Layer 2 Normalized Material CANNOT contain private prices or PO numbers in canonical descriptions.
    3. Layer 2 Material Attributes contain only physical/engineering specifications.
    """
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    AsyncTestSession = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    csv_data = (
        "CODE,NAME,SPEC,UNIT,PO_NUMBER,CONFIDENTIAL_PRICE,VENDOR_SECRET\n"
        "IOCL-B-01,HEX BOLT M16 X 50 MM SS304,GRADE SS304 IS 1363,NOS,PO-99412,48.50,SECRET_SUPPLIER_XYZ\n"
        "IOCL-V-02,2 INCH BALL VALVE CL300,BODY ASTM A216 WCB,NOS,PO-11200,18500.00,VENDOR_ABC\n"
        ",INVALID ROW MISSING CODE,NO CODE,NOS,PO-0000,10.00,FAIL_VEND\n"  # Error row to test partial completion
    )
    test_file = tmp_path / "test_catalog.csv"
    test_file.write_text(csv_data, encoding="utf-8")

    async with AsyncTestSession() as session:
        org_id = uuid.uuid4()
        org = Organization(id=org_id, code="IOCL", name="Indian Oil Corp", sector="Oil & Gas")
        session.add(org)

        job_id = uuid.uuid4()
        job = IngestionJob(
            id=job_id,
            organization_id=org_id,
            original_filename="test_catalog.csv",
            stored_filepath=str(test_file),
            file_type="CSV",
            file_hash="dummy_hash_001",
            total_rows=3,
            status="QUEUED"
        )
        session.add(job)
        await session.commit()

    mapping = {
        "material_code": "CODE",
        "description": "NAME",
        "specification": "SPEC",
        "unit_of_measure": "UNIT"
    }

    async with AsyncTestSession() as session:
        result = await execute_ingestion_job(job_id, mapping, session)
        assert result["status"] == "PARTIALLY_COMPLETED"
        assert result["processed_rows"] == 2
        assert result["failed_rows"] == 1
        assert result["error_count"] == 1

        # Check Layer 1 Raw Material Record Preservation (Private data preserved here)
        raw = (await session.execute(
            select(RawMaterial).where(RawMaterial.material_code == "IOCL-B-01")
        )).scalars().first()
        assert raw is not None
        assert raw.material_description == "HEX BOLT M16 X 50 MM SS304"
        assert raw.source_payload["CONFIDENTIAL_PRICE"] == "48.50"
        assert raw.source_payload["PO_NUMBER"] == "PO-99412"
        assert raw.source_payload["VENDOR_SECRET"] == "SECRET_SUPPLIER_XYZ"

        # Check Layer 2 Normalized Material (Sensitive fields MUST NOT appear here)
        norm = (await session.execute(
            select(NormalizedMaterial).where(NormalizedMaterial.raw_material_id == raw.id)
        )).scalars().first()
        assert norm is not None
        assert norm.normalized_uom == "EA"
        # Verify complete absence of private procurement data from canonical text
        assert "48.50" not in norm.canonical_description
        assert "PO-99412" not in norm.canonical_description
        assert "SECRET_SUPPLIER_XYZ" not in norm.canonical_description

        # Check Layer 2 Extracted Attributes (Only engineering specs)
        attrs = (await session.execute(
            select(MaterialAttribute).where(MaterialAttribute.normalized_material_id == norm.id)
        )).scalars().all()
        assert len(attrs) >= 3
        for attr in attrs:
            assert attr.attribute_name in ["thread_pitch", "diameter", "length", "material_grade", "standard_code"]
            assert "48.50" not in attr.normalized_value

        # Check Ingestion Job Status & Error Summary
        updated_job = (await session.execute(
            select(IngestionJob).where(IngestionJob.id == job_id)
        )).scalars().first()
        assert updated_job.status == "PARTIALLY_COMPLETED"
        assert len(updated_job.error_summary) == 1
        assert updated_job.error_summary[0]["row_number"] == 3
        assert "Missing required material code" in updated_job.error_summary[0]["reason"]


@pytest.mark.asyncio
async def test_discover_api_endpoint():
    from httpx import AsyncClient, ASGITransport
    from app.main import app

    transport = ASGITransport(app=app)
    csv_bytes = b"MAT_CODE,ITEM_DESCRIPTION,UOM\nIOCL-01,Bolt M16,NOS\n"

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Valid CSV Discovery
        files = {"file": ("materials.csv", csv_bytes, "text/csv")}
        response = await client.post("/api/v1/ingestion/discover", files=files)
        assert response.status_code == 200
        data = response.json()
        assert data["file_type"] == "CSV"
        assert data["detected_columns"] == ["MAT_CODE", "ITEM_DESCRIPTION", "UOM"]
        assert data["estimated_row_count"] == 1
        assert data["suggested_mapping"]["material_code"] == "MAT_CODE"
        assert data["suggested_mapping"]["description"] == "ITEM_DESCRIPTION"

        # 2. Rejection of .xls file in discovery endpoint
        xls_files = {"file": ("legacy.xls", b"\xd0\xcf\x11\xe0", "application/vnd.ms-excel")}
        xls_response = await client.post("/api/v1/ingestion/discover", files=xls_files)
        assert xls_response.status_code == 422
        resp_json = xls_response.json()
        error_msg = resp_json.get("error", {}).get("message") or resp_json.get("detail", "")
        assert "Legacy binary Excel format (.xls) is not supported" in error_msg
