"""
Phase 13 Comprehensive Integration Tests:
Multi-Sector CPSE Onboarding, Data Isolation, AI Pipeline, and Conflict Safety.
"""

import pytest
import uuid
from app.services.file_parser import detect_file_type, compute_file_hash, parse_csv_stream
from app.services.normalization import normalize_material_text, normalize_uom
from app.services.attribute_extractor import extract_deterministic_attributes
from app.services.matching.representation import (
    MaterialRepresentation,
    generate_ai_safe_text,
    generate_canonical_signature,
)
from app.services.matching.deterministic_matcher import evaluate_deterministic_match
from app.services.matching.text_similarity import evaluate_text_similarity
from app.services.matching.hybrid_engine import score_candidate_pair
from app.services.matching.embedding_provider import get_embedding_provider
from app.models.user import User, RoleEnum
from app.core.deps import validate_tenant_access
from fastapi import HTTPException


# ============================================================
# 1. Multi-Organization Tenant Isolation Tests
# ============================================================

def test_tenant_isolation_validation():
    org_a_id = uuid.uuid4()
    org_b_id = uuid.uuid4()

    user_a = User(
        id=uuid.uuid4(),
        email="officer_a@sih.demo",
        role=RoleEnum.CPSE_MATERIAL_MANAGER,
        organization_id=org_a_id,
        status="ACTIVE"
    )

    # Valid tenant access
    assert validate_tenant_access(org_a_id, user_a) is True

    # Cross-tenant access must raise 403 Forbidden
    with pytest.raises(HTTPException) as exc_info:
        validate_tenant_access(org_b_id, user_a)
    assert exc_info.value.status_code == 403


# ============================================================
# 2. File Format Detection & .xls Rejection Tests
# ============================================================

def test_file_format_detection_and_rejection():
    # CSV
    assert detect_file_type("catalog.csv", b"col1,col2\nv1,v2") == "CSV"

    # OpenXML XLSX
    assert detect_file_type("catalog.xlsx", b"PK\x03\x04fake_xlsx_content") == "EXCEL"

    # Legacy .xls MUST be explicitly rejected
    with pytest.raises(ValueError) as exc_info:
        detect_file_type("legacy_catalog.xls", b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1")
    assert "Legacy binary Excel format (.xls) is not supported" in str(exc_info.value)


# ============================================================
# 3. Sensitive Data Sanitization & Layer 1 Exclusion Tests
# ============================================================

def test_sensitive_data_exclusion_from_ai_text():
    raw_payload_with_sensitive_data = {
        "material_code": "MAT-VALVE-100",
        "description": "BALL VALVE 50MM CL300 WCB",
        "po_number_confidential": "PO-IOCL-998877",
        "contract_price_inr": 45000.00,
        "vendor_name": "L&T Valves Private Limited",
        "plant_storage_bin": "BIN-A4-09",
    }

    # Generate Layer 2 AI safe text
    ai_text = generate_ai_safe_text(
        category="Piping Components",
        canonical_description="BALL VALVE 50MM CL300 WCB",
        engineering_term="BALL VALVE",
        material_grade="ASTM A216 WCB",
        standard_code="ASME B16.34",
        normalized_uom="EA",
        attributes={"diameter": "50.0", "pressure_class": "300"}
    )

    # Strict privacy verification
    assert "PO-IOCL-998877" not in ai_text
    assert "45000" not in ai_text
    assert "L&T Valves" not in ai_text
    assert "BIN-A4" not in ai_text
    assert "BALL VALVE" in ai_text
    assert "300" in ai_text


# ============================================================
# 4. Cross-CPSE Material Comparison & Hybrid Matching Tests
# ============================================================

def test_cross_cpse_exact_match():
    # IOCL Fastener representation
    mat_a = MaterialRepresentation(
        material_id=uuid.uuid4(),
        organization_id=uuid.uuid4(),
        canonical_description="HEXAGON HEAD BOLT M16 x 50 MM SS304",
        normalized_uom="EA",
        category="Fasteners",
        engineering_term="HEX BOLT",
        material_grade="SS304",
        standard_code="IS 1363",
        technical_attributes={"thread_pitch": "M16", "diameter": "16.0", "length": "50.0", "material_grade": "SS304"},
        ai_safe_text="HEXAGON HEAD BOLT M16 x 50 MM SS304"
    )

    # NTPC Fastener representation
    mat_b = MaterialRepresentation(
        material_id=uuid.uuid4(),
        organization_id=uuid.uuid4(),
        canonical_description="HEXAGON HEAD BOLT M16 x 50 MM SS304",
        normalized_uom="EA",
        category="Fasteners",
        engineering_term="HEX BOLT",
        material_grade="SS304",
        standard_code="IS 1363",
        technical_attributes={"thread_pitch": "M16", "diameter": "16.0", "length": "50.0", "material_grade": "SS304"},
        ai_safe_text="HEXAGON HEAD BOLT M16 x 50 MM SS304"
    )

    score_result = score_candidate_pair(mat_a, mat_b)
    assert score_result["candidate_classification"] == "EXACT_MATCH_CANDIDATE"
    assert score_result["composite_confidence"] >= 0.95
    assert score_result["has_hard_conflict"] is False


def test_cross_cpse_hard_conflict_safety():
    # IOCL Valve (Class 150)
    valve_150 = MaterialRepresentation(
        material_id=uuid.uuid4(),
        organization_id=uuid.uuid4(),
        canonical_description="BALL VALVE 50MM CL150 WCB",
        normalized_uom="EA",
        category="Valves",
        engineering_term="BALL VALVE",
        material_grade="ASTM A216 WCB",
        standard_code="ASME B16.34",
        technical_attributes={"diameter": "50.0", "pressure_class": "150", "material_grade": "ASTM A216 WCB"},
        ai_safe_text="BALL VALVE 50MM CL150 WCB"
    )

    # NTPC Valve (Class 600 - INCOMPATIBLE PRESSURE RATING)
    valve_600 = MaterialRepresentation(
        material_id=uuid.uuid4(),
        organization_id=uuid.uuid4(),
        canonical_description="BALL VALVE 50MM CL600 WCB",
        normalized_uom="EA",
        category="Valves",
        engineering_term="BALL VALVE",
        material_grade="ASTM A216 WCB",
        standard_code="ASME B16.34",
        technical_attributes={"diameter": "50.0", "pressure_class": "600", "material_grade": "ASTM A216 WCB"},
        ai_safe_text="BALL VALVE 50MM CL600 WCB"
    )

    score_result = score_candidate_pair(valve_150, valve_600)

    # Must flag conflict and block auto-merging
    assert score_result["has_hard_conflict"] is True
    assert score_result["candidate_classification"] == "REQUIRES_DOMAIN_REVIEW"
    assert any("pressure" in r.lower() or "150" in r for r in score_result["conflict_reasons"])
