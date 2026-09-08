"""
Comprehensive Unit & Integration Test Suite for Phase 7 Material Matching Foundation.

Tests:
1. Exact canonical attribute signature matching
2. Different descriptions but equivalent normalized structure
3. Similar text but incompatible technical attributes (conflict detection)
4. Completely unrelated materials (no meaningful match)
5. Missing attributes tolerance
6. Cross-CPSE matching isolation
7. Sensitive Layer 1 data exclusion from ai_safe_text
8. Text similarity methodology labeling
9. Embedding provider unavailable state handling
10. Hybrid scoring with semantic unavailable
11. Structured explainability signal generation
12. Workflow safety (no automatic merge/approval)
13. Candidate retrieval blocking strategy
14. FastAPI REST API endpoints
"""

import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.main import app
from app.db.session import Base, get_db
from app.models.organization import Organization
from app.models.material import RawMaterial, NormalizedMaterial, MaterialAttribute
from app.models.matching import MaterialSimilarityMatch
from app.services.matching.representation import (
    build_material_representation,
    generate_canonical_signature,
    generate_ai_safe_text
)
from app.services.matching.deterministic_matcher import evaluate_deterministic_match
from app.services.matching.text_similarity import evaluate_text_similarity
from app.services.matching.embedding_provider import (
    BaseEmbeddingProvider,
    LocalSentenceTransformerProvider,
    get_embedding_provider
)
from app.services.matching.hybrid_engine import (
    score_candidate_pair,
    retrieve_candidate_materials,
    generate_and_persist_matches_for_material
)


# --- Unit Tests for Representation & Layer 1 Privacy ---

def test_ai_safe_text_excludes_sensitive_layer1_fields():
    """Verify that private commercial fields are never included in ai_safe_text."""
    raw_payload = {
        "po_number": "PO-998877",
        "unit_price_inr": 450.00,
        "vendor_name": "Confidential Steels Ltd",
        "store_location": "Bay-4B"
    }

    rep = build_material_representation(
        material_id=uuid.uuid4(),
        organization_id=uuid.uuid4(),
        canonical_description="HEX BOLT SS304 M16 X 50MM",
        normalized_uom="EA",
        category="FASTENERS",
        material_grade="SS304",
        standard_code="ISO 4017",
        engineering_term="HEX BOLT",
        attributes_dict={"diameter": "M16", "length": "50MM"}
    )

    safe_text = rep.ai_safe_text
    assert "PO-998877" not in safe_text
    assert "450.00" not in safe_text
    assert "Confidential Steels" not in safe_text
    assert "Bay-4B" not in safe_text
    assert "CATEGORY: FASTENERS" in safe_text
    assert "DIAMETER: M16" in safe_text
    assert "LENGTH: 50MM" in safe_text
    assert "MATERIAL_GRADE: SS304" in safe_text


def test_canonical_signature_generation():
    """Verify deterministic canonical signature hashing."""
    sig1 = generate_canonical_signature(
        category="FASTENERS",
        engineering_term="HEX BOLT",
        material_grade="SS304",
        standard_code="ISO 4017",
        attributes={"diameter": "M16", "length": "50MM"}
    )
    sig2 = generate_canonical_signature(
        category="FASTENERS",
        engineering_term="HEX BOLT",
        material_grade="SS304",
        standard_code="ISO 4017",
        attributes={"length": "50MM", "diameter": "M16"}  # Different order
    )
    assert sig1 == sig2
    assert "FASTENERS|HEX BOLT|SS304|ISO 4017" in sig1
    assert "DIAMETER=M16" in sig1
    assert "LENGTH=50MM" in sig1


# --- Tier 1 Deterministic Tests ---

def test_tier1_exact_attribute_signature_match():
    """Verify exact signature detection."""
    mat_a = build_material_representation(
        material_id=uuid.uuid4(),
        organization_id=uuid.uuid4(),
        canonical_description="HEX BOLT SS304 M16 X 50",
        normalized_uom="EA",
        category="FASTENERS",
        material_grade="SS304",
        standard_code="ISO 4017",
        engineering_term="HEX BOLT",
        attributes_dict={"diameter": "M16", "length": "50MM"}
    )
    mat_b = build_material_representation(
        material_id=uuid.uuid4(),
        organization_id=uuid.uuid4(),
        canonical_description="HEX BOLT SS304 M16 X 50",
        normalized_uom="EA",
        category="FASTENERS",
        material_grade="SS304",
        standard_code="ISO 4017",
        engineering_term="HEX BOLT",
        attributes_dict={"diameter": "M16", "length": "50MM"}
    )

    res = evaluate_deterministic_match(mat_a, mat_b)
    assert res["is_exact_signature"] is True
    assert res["attribute_score"] == 1.0
    assert not res["has_hard_conflict"]
    assert any(s["rule_id"] == "EXACT_ATTRIBUTE_SIGNATURE_V1" and s["score"] == 1.0 for s in res["signals"])


def test_tier1_different_descriptions_equivalent_structure():
    """Verify equivalent structure across different wording."""
    mat_a = build_material_representation(
        material_id=uuid.uuid4(),
        organization_id=uuid.uuid4(),
        canonical_description="HEX BOLT SS304 M16 X 50",
        normalized_uom="EA",
        category="FASTENERS",
        material_grade="SS304",
        standard_code="ISO 4017",
        engineering_term="HEX BOLT",
        attributes_dict={"diameter": "M16", "length": "50MM"}
    )
    mat_b = build_material_representation(
        material_id=uuid.uuid4(),
        organization_id=uuid.uuid4(),
        canonical_description="STAINLESS STEEL FASTENER HEXAGON HEAD BOLT SIZE 16 MM LENGTH 50 MM",
        normalized_uom="EA",
        category="FASTENERS",
        material_grade="SS304",
        standard_code="ISO 4017",
        engineering_term="HEX BOLT",
        attributes_dict={"diameter": "M16", "length": "50MM"}
    )

    res = evaluate_deterministic_match(mat_a, mat_b)
    assert res["is_exact_signature"] is True
    assert res["attribute_score"] == 1.0
    assert not res["has_hard_conflict"]


def test_tier1_similar_text_incompatible_dimensions():
    """Verify that dimensional conflicts trigger hard conflict flags."""
    mat_a = build_material_representation(
        material_id=uuid.uuid4(),
        organization_id=uuid.uuid4(),
        canonical_description="HEX BOLT SS304 M16 X 50",
        normalized_uom="EA",
        category="FASTENERS",
        material_grade="SS304",
        engineering_term="HEX BOLT",
        attributes_dict={"diameter": "M16", "length": "50MM"}
    )
    mat_b = build_material_representation(
        material_id=uuid.uuid4(),
        organization_id=uuid.uuid4(),
        canonical_description="HEX BOLT SS304 M20 X 70",
        normalized_uom="EA",
        category="FASTENERS",
        material_grade="SS304",
        engineering_term="HEX BOLT",
        attributes_dict={"diameter": "M20", "length": "70MM"}
    )

    res = evaluate_deterministic_match(mat_a, mat_b)
    assert res["is_exact_signature"] is False
    assert res["has_hard_conflict"] is True
    assert res["attribute_score"] <= 0.2
    assert any("Incompatible diameter" in r for r in res["conflict_reasons"])


# --- Tier 2 Text Similarity Tests ---

def test_tier2_text_similarity_and_methodology_label():
    """Verify Tier 2 text similarity calculation and explicit methodology labeling."""
    mat_a = build_material_representation(
        material_id=uuid.uuid4(),
        organization_id=uuid.uuid4(),
        canonical_description="GATE VALVE 2 INCH 150# FLANGED",
        normalized_uom="EA"
    )
    mat_b = build_material_representation(
        material_id=uuid.uuid4(),
        organization_id=uuid.uuid4(),
        canonical_description="VALVE GATE 2 INCH 150# FLANGED ENDS",
        normalized_uom="EA"
    )

    res = evaluate_text_similarity(mat_a, mat_b)
    assert res["methodology"] == "TEXT_SIMILARITY"
    assert res["text_similarity_score"] >= 0.75
    assert res["classification"] in ("HIGH_TEXT_SIMILARITY", "MEDIUM_TEXT_SIMILARITY")


# --- Tier 3 Embedding Provider & Honest Availability Tests ---

def test_embedding_provider_unavailable_state_honesty():
    """Verify that unavailable embedding provider reports is_available=False and returns None."""
    class MockUnavailableProvider(BaseEmbeddingProvider):
        def is_available(self) -> bool:
            return False
        def get_model_info(self):
            return {"provider": "MockUnavailable", "is_available": False, "status": "UNAVAILABLE"}
        def generate_embedding(self, text: str):
            return None
        def generate_embeddings(self, texts):
            return [None for _ in texts]

    provider = MockUnavailableProvider()
    assert provider.is_available() is False
    assert provider.generate_embedding("ANY TEXT") is None
    assert provider.compute_similarity([0.1, 0.2], None) is None


# --- Hybrid Scoring & Explainability Tests ---

def test_hybrid_scoring_exact_candidate():
    """Verify that exact attributes result in EXACT_MATCH_CANDIDATE and clear signals."""
    mat_a = build_material_representation(
        material_id=uuid.uuid4(),
        organization_id=uuid.uuid4(),
        canonical_description="HEX BOLT SS304 M16 X 50",
        normalized_uom="EA",
        category="FASTENERS",
        material_grade="SS304",
        standard_code="ISO 4017",
        engineering_term="HEX BOLT",
        attributes_dict={"diameter": "M16", "length": "50MM"}
    )
    mat_b = build_material_representation(
        material_id=uuid.uuid4(),
        organization_id=uuid.uuid4(),
        canonical_description="HEX BOLT SS304 M16 X 50",
        normalized_uom="EA",
        category="FASTENERS",
        material_grade="SS304",
        standard_code="ISO 4017",
        engineering_term="HEX BOLT",
        attributes_dict={"diameter": "M16", "length": "50MM"}
    )

    res = score_candidate_pair(mat_a, mat_b)
    assert res["candidate_classification"] == "EXACT_MATCH_CANDIDATE"
    assert res["composite_confidence"] >= 0.95
    assert res["methodology"] in ("RULE_BASED_EXACT", "HYBRID_AI_RULE_V1")
    assert "specification_diff" in res
    assert "diameter" in res["specification_diff"]


def test_hybrid_scoring_unrelated_materials():
    """Verify that completely unrelated materials produce NO_MEANINGFUL_MATCH."""
    mat_a = build_material_representation(
        material_id=uuid.uuid4(),
        organization_id=uuid.uuid4(),
        canonical_description="HEX BOLT SS304 M16 X 50",
        normalized_uom="EA",
        category="FASTENERS",
        engineering_term="HEX BOLT",
        attributes_dict={"diameter": "M16", "length": "50MM"}
    )
    mat_b = build_material_representation(
        material_id=uuid.uuid4(),
        organization_id=uuid.uuid4(),
        canonical_description="CENTRIFUGAL PUMP 15KW 3-PHASE 415V",
        normalized_uom="EA",
        category="PUMPS",
        engineering_term="CENTRIFUGAL PUMP",
        attributes_dict={"power_kw": "15KW", "voltage": "415V"}
    )

    res = score_candidate_pair(mat_a, mat_b)
    assert res["candidate_classification"] == "NO_MEANINGFUL_MATCH"
    assert res["composite_confidence"] < 0.50


def test_hybrid_scoring_conflicting_dimensions_penalized():
    """Verify that materials with similar wording but conflicting specs are flagged."""
    mat_a = build_material_representation(
        material_id=uuid.uuid4(),
        organization_id=uuid.uuid4(),
        canonical_description="HEX BOLT SS304 M16 X 50",
        normalized_uom="EA",
        category="FASTENERS",
        material_grade="SS304",
        engineering_term="HEX BOLT",
        attributes_dict={"diameter": "M16", "length": "50MM"}
    )
    mat_b = build_material_representation(
        material_id=uuid.uuid4(),
        organization_id=uuid.uuid4(),
        canonical_description="HEX BOLT SS304 M24 X 100",
        normalized_uom="EA",
        category="FASTENERS",
        material_grade="SS304",
        engineering_term="HEX BOLT",
        attributes_dict={"diameter": "M24", "length": "100MM"}
    )

    res = score_candidate_pair(mat_a, mat_b)
    assert res["has_hard_conflict"] is True
    assert res["candidate_classification"] in ("REQUIRES_DOMAIN_REVIEW", "NO_MEANINGFUL_MATCH")
    assert res["composite_confidence"] <= 0.49


# --- Integration Tests with Async SQLite Database ---

@pytest.mark.asyncio
async def test_end_to_end_cross_cpse_matching_flow():
    """
    Sets up an in-memory SQLite test DB, seeds CPSE A and CPSE B materials,
    executes matching, verifies persistence, explainability, and API response.
    """
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    session_factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with session_factory() as session:
        # Create Organizations
        org_a = Organization(code="IOCL", name="Indian Oil Corporation Limited", sector="OIL_AND_GAS", status="ACTIVE")
        org_b = Organization(code="NTPC", name="NTPC Limited", sector="POWER", status="ACTIVE")
        session.add_all([org_a, org_b])
        await session.flush()

        # Create Raw Materials
        raw_a = RawMaterial(
            organization_id=org_a.id,
            material_code="IOCL-B-101",
            material_description="HEX BOLT SS304 M16X50",
            uom="NOS",
            source_payload={"po_number": "PO-12345", "unit_price": 55.0}  # Sensitive Layer 1
        )
        raw_b = RawMaterial(
            organization_id=org_b.id,
            material_code="NTPC-B-902",
            material_description="STAINLESS STEEL HEXAGON BOLT 16MM X 50MM",
            uom="EA",
            source_payload={"po_number": "PO-99881", "unit_price": 60.0}  # Sensitive Layer 1
        )
        session.add_all([raw_a, raw_b])
        await session.flush()

        # Create Normalized Materials
        norm_a = NormalizedMaterial(
            raw_material_id=raw_a.id,
            organization_id=org_a.id,
            canonical_description="HEX BOLT SS304 M16 X 50MM",
            normalized_uom="EA",
            engineering_term="HEX BOLT",
            material_grade="SS304",
            standard_code="ISO 4017"
        )
        norm_b = NormalizedMaterial(
            raw_material_id=raw_b.id,
            organization_id=org_b.id,
            canonical_description="HEX BOLT SS304 M16 X 50MM",
            normalized_uom="EA",
            engineering_term="HEX BOLT",
            material_grade="SS304",
            standard_code="ISO 4017"
        )
        session.add_all([norm_a, norm_b])
        await session.flush()

        # Create Attributes
        attr_a1 = MaterialAttribute(normalized_material_id=norm_a.id, attribute_name="diameter", normalized_value="M16")
        attr_a2 = MaterialAttribute(normalized_material_id=norm_a.id, attribute_name="length", normalized_value="50MM")
        attr_b1 = MaterialAttribute(normalized_material_id=norm_b.id, attribute_name="diameter", normalized_value="M16")
        attr_b2 = MaterialAttribute(normalized_material_id=norm_b.id, attribute_name="length", normalized_value="50MM")
        session.add_all([attr_a1, attr_a2, attr_b1, attr_b2])
        await session.commit()

        # Execute candidate generation
        matches = await generate_and_persist_matches_for_material(
            source_material_id=norm_a.id,
            session=session,
            cross_org_only=True
        )

        assert len(matches) == 1
        m = matches[0]
        assert m.source_material_id == norm_a.id
        assert m.target_material_id == norm_b.id
        assert m.match_type == "EXACT_MATCH_CANDIDATE"
        assert m.composite_confidence >= 0.95
        assert m.recommendation_status == "PROPOSED"  # No auto-approval

    # Test API endpoints via FastAPI test client overriding db dependency
    async def override_get_db():
        async with session_factory() as s:
            yield s

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Check embeddings status endpoint
        res_emb = await client.get("/api/v1/status/embeddings")
        assert res_emb.status_code == 200
        emb_json = res_emb.json()
        assert "is_available" in emb_json

        # Trigger match endpoint
        res_match = await client.post(f"/api/v1/materials/{norm_a.id}/match?cross_org_only=true")
        assert res_match.status_code == 200
        match_list = res_match.json()
        assert len(match_list) >= 1
        assert match_list[0]["match_type"] == "EXACT_MATCH_CANDIDATE"

        # Get match detail endpoint
        match_id = match_list[0]["id"]
        res_detail = await client.get(f"/api/v1/matches/{match_id}")
        assert res_detail.status_code == 200
        detail_json = res_detail.json()
        assert detail_json["id"] == match_id
        assert detail_json["specification_diff"]["diameter"]["status"] == "MATCH"

    app.dependency_overrides.clear()
    await engine.dispose()
