import os
import uuid
from typing import Dict, Any, List, Tuple, Optional
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.organization import Organization, SourceSystem
from app.models.material import RawMaterial, NormalizedMaterial, MaterialAttribute
from app.models.ingestion import IngestionJob
from app.models.governance import AuditLog
from app.services.file_parser import parse_csv_stream, parse_excel_stream
from app.services.normalization import normalize_material_text, normalize_uom
from app.services.attribute_extractor import extract_deterministic_attributes


def validate_column_mapping(
    available_columns: List[str],
    mapping: Dict[str, str]
) -> Tuple[bool, Optional[str]]:
    """
    Validates that:
    1. Required canonical fields ('material_code', 'description') are provided.
    2. Target columns mapped exist in available file headers.
    """
    required = ["material_code", "description"]
    for req in required:
        if req not in mapping or not mapping[req]:
            return False, f"Missing required canonical mapping for: '{req}'"

    col_set = set(available_columns)
    for canonical, source_col in mapping.items():
        if source_col and source_col not in col_set:
            return False, f"Mapped column '{source_col}' for '{canonical}' not found in file headers."

    return True, None


async def execute_ingestion_job(
    job_id: uuid.UUID,
    mapping: Dict[str, str],
    session: AsyncSession
) -> Dict[str, Any]:
    """
    Core ingestion processor.
    1. Reads uploaded file.
    2. Validates rows.
    3. Preserves Layer 1 raw data.
    4. Normalizes and extracts Layer 2 attributes.
    5. Updates job counters, status, and error log.
    """
    # 1. Fetch Job Record
    res = await session.execute(select(IngestionJob).where(IngestionJob.id == job_id))
    job = res.scalars().first()
    if not job:
        raise ValueError(f"IngestionJob with id {job_id} not found.")

    job.status = "PROCESSING"
    job.column_mapping = mapping
    await session.flush()

    if not os.path.exists(job.stored_filepath):
        job.status = "FAILED"
        job.error_summary = [{"row": 0, "reason": "Stored file not found on disk."}]
        await session.commit()
        return {"status": "FAILED", "reason": "File not found"}

    # 2. Read File Bytes
    with open(job.stored_filepath, "rb") as f:
        content_bytes = f.read()

    try:
        if job.file_type.upper() == "EXCEL":
            headers, total_count, _, all_rows = parse_excel_stream(content_bytes)
        else:
            headers, total_count, _, all_rows = parse_csv_stream(content_bytes)
    except Exception as e:
        job.status = "FAILED"
        job.error_summary = [{"row": 0, "reason": f"File parse error: {str(e)}"}]
        await session.commit()
        return {"status": "FAILED", "reason": str(e)}

    # Validate mapping against headers
    is_valid, err = validate_column_mapping(headers, mapping)
    if not is_valid:
        job.status = "FAILED"
        job.error_summary = [{"row": 0, "reason": err}]
        await session.commit()
        return {"status": "FAILED", "reason": err}

    job.total_rows = len(all_rows)
    processed_count = 0
    failed_count = 0
    errors: List[Dict[str, Any]] = []

    col_mat_code = mapping["material_code"]
    col_desc = mapping["description"]
    col_spec = mapping.get("specification")
    col_uom = mapping.get("unit_of_measure")
    col_cat = mapping.get("category")
    col_mfr = mapping.get("manufacturer")
    col_part = mapping.get("oem_part_number")

    # 3. Process Row by Row
    for idx, row in enumerate(all_rows, start=1):
        raw_code = str(row.get(col_mat_code, "")).strip()
        raw_desc = str(row.get(col_desc, "")).strip()
        raw_spec = str(row.get(col_spec, "")).strip() if col_spec else ""
        raw_uom = str(row.get(col_uom, "")).strip() if col_uom else "EA"
        raw_cat = str(row.get(col_cat, "")).strip() if col_cat else ""
        raw_mfr = str(row.get(col_mfr, "")).strip() if col_mfr else ""
        raw_part = str(row.get(col_part, "")).strip() if col_part else ""

        # Validate required fields
        if not raw_code:
            failed_count += 1
            errors.append({
                "row_number": idx,
                "column": col_mat_code,
                "reason": "Missing required material code."
            })
            continue

        if not raw_desc:
            failed_count += 1
            errors.append({
                "row_number": idx,
                "column": col_desc,
                "reason": "Missing required material description."
            })
            continue

        try:
            # Check existing raw material for duplicate protection
            existing_raw = (await session.execute(
                select(RawMaterial).where(
                    RawMaterial.organization_id == job.organization_id,
                    RawMaterial.material_code == raw_code
                )
            )).scalars().first()

            if existing_raw:
                raw_item = existing_raw
                raw_item.material_description = raw_desc
                raw_item.specification_text = raw_spec or None
                raw_item.uom = raw_uom or "EA"
                raw_item.source_payload = row  # Preserve full private payload
                raw_item.import_batch_id = str(job.id)
                raw_item.status = "NORMALIZED"
            else:
                raw_item = RawMaterial(
                    id=uuid.uuid4(),
                    organization_id=job.organization_id,
                    source_system_id=job.source_system_id,
                    material_code=raw_code,
                    material_description=raw_desc,
                    specification_text=raw_spec or None,
                    uom=raw_uom or "EA",
                    category_code=raw_cat or None,
                    manufacturer_reference=raw_mfr or None,
                    source_payload=row,  # Preserve raw record
                    import_batch_id=str(job.id),
                    status="NORMALIZED"
                )
                session.add(raw_item)
            await session.flush()

            # Normalization (Layer 2)
            normalized_desc = normalize_material_text(raw_desc, raw_spec)
            normalized_unit, _ = normalize_uom(raw_uom)

            existing_norm = (await session.execute(
                select(NormalizedMaterial).where(
                    NormalizedMaterial.raw_material_id == raw_item.id
                )
            )).scalars().first()

            if existing_norm:
                norm_item = existing_norm
                norm_item.canonical_description = normalized_desc
                norm_item.normalized_uom = normalized_unit
                norm_item.normalized_manufacturer = raw_mfr or None
                norm_item.normalized_part_number = raw_part or None
                norm_item.normalization_status = "NORMALIZED"
            else:
                norm_item = NormalizedMaterial(
                    id=uuid.uuid4(),
                    raw_material_id=raw_item.id,
                    organization_id=job.organization_id,
                    canonical_description=normalized_desc,
                    normalized_manufacturer=raw_mfr or None,
                    normalized_part_number=raw_part or None,
                    normalized_uom=normalized_unit,
                    normalization_status="NORMALIZED",
                    confidence_score=0.95
                )
                session.add(norm_item)
            await session.flush()

            # Deterministic Attribute Extraction
            extracted_attrs = extract_deterministic_attributes(raw_desc, raw_spec)
            for attr in extracted_attrs:
                session.add(MaterialAttribute(
                    id=uuid.uuid4(),
                    normalized_material_id=norm_item.id,
                    attribute_name=attr["attribute_name"],
                    original_value=attr["original_value"],
                    normalized_value=attr["normalized_value"],
                    normalized_unit=attr["normalized_unit"],
                    data_type=attr["data_type"],
                    source="RULE_EXTRACTOR",
                    confidence=attr["confidence"]
                ))

            # Audit Log
            session.add(AuditLog(
                id=uuid.uuid4(),
                entity_type="RAW_MATERIAL",
                entity_id=raw_code,
                action="BATCH_INGESTED_AND_NORMALIZED",
                actor_reference=f"ingestion_job_{job.id}",
                timestamp=datetime.now(timezone.utc),
                metadata_payload={"batch_id": str(job.id), "row": idx}
            ))

            processed_count += 1

        except Exception as row_err:
            failed_count += 1
            errors.append({
                "row_number": idx,
                "reason": f"Row processing failure: {str(row_err)}"
            })

    # 4. Finalize Job Status
    job.processed_rows = processed_count
    job.failed_rows = failed_count
    job.error_summary = errors if errors else None

    if failed_count == 0:
        job.status = "COMPLETED"
    elif processed_count > 0:
        job.status = "PARTIALLY_COMPLETED"
    else:
        job.status = "FAILED"

    await session.commit()
    return {
        "job_id": str(job.id),
        "status": job.status,
        "total_rows": job.total_rows,
        "processed_rows": job.processed_rows,
        "failed_rows": job.failed_rows,
        "error_count": len(errors)
    }
