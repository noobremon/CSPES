"""
Comprehensive Test Suite for Phase 8:
CNMC Recommendation Engine & Human Governance Workflow.

Mandatory Test Scenarios:
A. CNMC recommendation generation
B. Existing CNMC reuse candidate
C. New CNMC candidate generation
D. Insufficient data handling
E. Recommendation explanation generation
F. Pending review workflow
G. Approve workflow
H. Reject workflow with mandatory reason
I. Modify workflow with mandatory reason
J. Original recommendation preservation
K. CPSE code mapping creation
L. No automatic mapping without approval
M. No automatic material merge
N. Sensitive Layer 1 data exclusion
O. Duplicate recommendation prevention
P. Cross-CPSE traceability
Q. Audit trail generation
R. API validation
S. Regression testing
"""

import pytest
import uuid
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select

from app.db.session import Base
from app.models import (
    Organization,
    SourceSystem,
    MaterialTaxonomy,
    RawMaterial,
    NormalizedMaterial,
    MaterialAttribute,
    CNMCCandidate,
    CNMCMaster,
    CPSECNMCMapping,
    GovernanceReview,
    AuditLog,
    MaterialSimilarityMatch,
)
from app.services.cnmc.generator import (
    generate_prototype_cnmc_code,
    derive_cnmc_elements_from_representation,
    CNMCFormatVersion,
)
from app.services.cnmc.recommendation_engine import (
    CNMCRecommendationService,
    RecommendationOutcome,
    RecommendationStrength,
)
from app.services.governance.workflow_service import (
    GovernanceWorkflowService,
    GovernanceAction,
    GOVERNANCE_DISCLAIMER,
)
from app.services.governance.audit_service import (
    record_audit_log,
    sanitize_audit_payload,
)


@pytest.fixture
async def async_db():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    async with AsyncSessionLocal() as session:
        # Create base organizations
        org1 = Organization(id=uuid.uuid4(), code="CPSE_A", name="CPSE Enterprise Alpha", sector="Energy", status="ACTIVE")
        org2 = Organization(id=uuid.uuid4(), code="CPSE_B", name="CPSE Enterprise Beta", sector="Refining", status="ACTIVE")
        org3 = Organization(id=uuid.uuid4(), code="CPSE_C", name="CPSE Enterprise Gamma", sector="Power", status="ACTIVE")
        session.add_all([org1, org2, org3])

        # Create source systems
        sys1 = SourceSystem(id=uuid.uuid4(), organization_id=org1.id, name="Alpha SAP", system_type="SAP")
        sys2 = SourceSystem(id=uuid.uuid4(), organization_id=org2.id, name="Beta Oracle", system_type="ORACLE")
        sys3 = SourceSystem(id=uuid.uuid4(), organization_id=org3.id, name="Gamma ERP", system_type="CSV_IMPORT")
        session.add_all([sys1, sys2, sys3])

        # Create Taxonomies
        tax_mech = MaterialTaxonomy(
            id=uuid.uuid4(),
            code="IND-MECH-FAST-BLT",
            name="Hexagon Head Bolts",
            level=4,
            path="Industrial / Mechanical / Fasteners / Bolts",
            is_active=True
        )
        tax_pipe = MaterialTaxonomy(
            id=uuid.uuid4(),
            code="IND-PIPG-VLV-BALL",
            name="Ball Valves",
            level=4,
            path="Industrial / Piping / Valves / Ball",
            is_active=True
        )
        session.add_all([tax_mech, tax_pipe])
        await session.flush()

        # Material 1 (CPSE A): Hex Bolt SS304 M16 x 50
        raw1 = RawMaterial(
            id=uuid.uuid4(),
            organization_id=org1.id,
            source_system_id=sys1.id,
            material_code="MAT-1001",
            material_description="HEX BOLT SS304 M16 X 50 MM",
            uom="NOS",
            source_payload={"unit_price": 54.0, "po_number": "PO-SECRET-01", "supplier_name": "Confidential Steel Ltd"}
        )
        norm1 = NormalizedMaterial(
            id=uuid.uuid4(),
            raw_material_id=raw1.id,
            organization_id=org1.id,
            canonical_description="Hexagon Head Bolt, M16 x 50 mm, Grade SS304 (IS 1363)",
            normalized_uom="EA",
            taxonomy_id=tax_mech.id,
            engineering_term="Hexagon Head Bolt",
            standard_code="IS 1363",
            material_grade="SS304",
            normalization_status="NORMALIZED"
        )
        attr1_d = MaterialAttribute(
            id=uuid.uuid4(),
            normalized_material_id=norm1.id,
            attribute_name="diameter",
            normalized_value="16.0",
            normalized_unit="mm"
        )
        attr1_l = MaterialAttribute(
            id=uuid.uuid4(),
            normalized_material_id=norm1.id,
            attribute_name="length",
            normalized_value="50.0",
            normalized_unit="mm"
        )
        session.add_all([raw1, norm1, attr1_d, attr1_l])

        # Material 2 (CPSE B): Stainless Steel Hex Bolt M16 x 50 (Near identical)
        raw2 = RawMaterial(
            id=uuid.uuid4(),
            organization_id=org2.id,
            source_system_id=sys2.id,
            material_code="BOLT-778",
            material_description="STAINLESS STEEL HEX BOLT M16 X 50",
            uom="EA",
            source_payload={"unit_price": 51.5, "vendor_name": "Private Fasteners Corp"}
        )
        norm2 = NormalizedMaterial(
            id=uuid.uuid4(),
            raw_material_id=raw2.id,
            organization_id=org2.id,
            canonical_description="Hexagon Head Bolt, M16 x 50 mm, Grade SS304 (IS 1363)",
            normalized_uom="EA",
            taxonomy_id=tax_mech.id,
            engineering_term="Hexagon Head Bolt",
            standard_code="IS 1363",
            material_grade="SS304",
            normalization_status="NORMALIZED"
        )
        attr2_d = MaterialAttribute(
            id=uuid.uuid4(),
            normalized_material_id=norm2.id,
            attribute_name="diameter",
            normalized_value="16.0",
            normalized_unit="mm"
        )
        attr2_l = MaterialAttribute(
            id=uuid.uuid4(),
            normalized_material_id=norm2.id,
            attribute_name="length",
            normalized_value="50.0",
            normalized_unit="mm"
        )
        session.add_all([raw2, norm2, attr2_d, attr2_l])

        # Material 3 (CPSE C): Carbon Steel Bolt M20 x 70 (Different specs)
        raw3 = RawMaterial(
            id=uuid.uuid4(),
            organization_id=org3.id,
            source_system_id=sys3.id,
            material_code="MAT-9001",
            material_description="HEX BOLT CARBON STEEL M20 X 70",
            uom="NOS",
            source_payload={"unit_price": 95.0, "store_location": "Yard-4"}
        )
        norm3 = NormalizedMaterial(
            id=uuid.uuid4(),
            raw_material_id=raw3.id,
            organization_id=org3.id,
            canonical_description="Hexagon Head Bolt, M20 x 70 mm, Grade 8.8 Carbon Steel",
            normalized_uom="EA",
            taxonomy_id=tax_mech.id,
            engineering_term="Hexagon Head Bolt",
            standard_code="IS 1363",
            material_grade="8.8",
            normalization_status="NORMALIZED"
        )
        session.add_all([raw3, norm3])

        # Material 4 (Incomplete Material for Insufficient Data Test)
        raw4 = RawMaterial(
            id=uuid.uuid4(),
            organization_id=org1.id,
            source_system_id=sys1.id,
            material_code="RAW-INC-001",
            material_description="SPARE PART",
            uom="NOS"
        )
        norm4 = NormalizedMaterial(
            id=uuid.uuid4(),
            raw_material_id=raw4.id,
            organization_id=org1.id,
            canonical_description="SP",
            normalized_uom="",
            normalization_status="PENDING"
        )
        session.add_all([raw4, norm4])

        await session.commit()
        yield session

    await engine.dispose()


# Test A & C: New CNMC candidate generation
@pytest.mark.asyncio
async def test_new_cnmc_candidate_generation(async_db: AsyncSession):
    stmt = select(NormalizedMaterial).where(NormalizedMaterial.canonical_description.ilike("%M16 x 50%"))
    res = await async_db.execute(stmt)
    mat = res.scalars().first()
    assert mat is not None

    service = CNMCRecommendationService(async_db)
    result = await service.recommend_cnmc_for_material(mat.id, persist_candidate=True)

    assert result.outcome == RecommendationOutcome.NEW_CNMC_CANDIDATE
    assert result.proposed_cnmc.startswith("IN-IND-MECH-BLT-")
    assert result.recommendation_strength in (RecommendationStrength.HIGH, RecommendationStrength.MEDIUM)
    assert result.candidate_id is not None
    assert result.explanation.format_version == CNMCFormatVersion.MVP_CNMC_V1.value

    # Verify candidate is in status PENDING_REVIEW in database
    cand = await async_db.get(CNMCCandidate, result.candidate_id)
    assert cand is not None
    assert cand.status == "PENDING_REVIEW"
    assert cand.proposed_cnmc == result.proposed_cnmc


# Test D: Insufficient data handling
@pytest.mark.asyncio
async def test_insufficient_data_handling(async_db: AsyncSession):
    stmt = select(NormalizedMaterial).where(NormalizedMaterial.canonical_description == "SP")
    res = await async_db.execute(stmt)
    mat = res.scalars().first()
    assert mat is not None

    service = CNMCRecommendationService(async_db)
    result = await service.recommend_cnmc_for_material(mat.id, persist_candidate=False)

    assert result.outcome == RecommendationOutcome.INSUFFICIENT_DATA
    assert result.recommendation_strength == RecommendationStrength.LOW
    assert len(result.explanation.missing_information) > 0
    assert "Incomplete" in result.proposed_description or "SP" in result.proposed_description


# Test E: Structured explainability generation
@pytest.mark.asyncio
async def test_recommendation_explainability_structure(async_db: AsyncSession):
    stmt = select(NormalizedMaterial).where(NormalizedMaterial.canonical_description.ilike("%M20 x 70%"))
    res = await async_db.execute(stmt)
    mat = res.scalars().first()
    assert mat is not None

    service = CNMCRecommendationService(async_db)
    result = await service.recommend_cnmc_for_material(mat.id, persist_candidate=False)

    expl = result.explanation
    assert expl.taxonomy_signals.get("sector") == "IND"
    assert expl.taxonomy_signals.get("category") == "MECH"
    assert expl.recommendation_reason != ""
    assert "SIH MVP demonstration governance workflow" in expl.governance_notice


# Test F & G: Human governance APPROVE workflow & CPSE mapping creation
@pytest.mark.asyncio
async def test_governance_approve_workflow(async_db: AsyncSession):
    # First generate recommendation
    stmt = select(NormalizedMaterial).where(NormalizedMaterial.canonical_description.ilike("%M16 x 50%"))
    res = await async_db.execute(stmt)
    mat1 = res.scalars().first()

    service = CNMCRecommendationService(async_db)
    rec = await service.recommend_cnmc_for_material(mat1.id, persist_candidate=True)
    assert rec.candidate_id is not None

    workflow = GovernanceWorkflowService(async_db)
    decision_res = await workflow.review_candidate(
        candidate_id=rec.candidate_id,
        action=GovernanceAction.APPROVE,
        reviewer_reference="domain_reviewer_01@sih.gov.in",
        comments="Approved for MVP prototype reference catalog.",
        material_id_to_map=mat1.id
    )

    assert decision_res["decision"] == "APPROVE"
    assert decision_res["new_status"] == "APPROVED"
    assert decision_res["master_id"] is not None
    assert decision_res["mapping_id"] is not None

    # Verify CNMCMaster record created in Layer 3
    master = await async_db.get(CNMCMaster, uuid.UUID(decision_res["master_id"]))
    assert master is not None
    assert master.cnmc_code == rec.proposed_cnmc
    assert master.status == "ACTIVE"
    assert "SIH MVP demonstration governance workflow" in master.governance_metadata["governance_boundary"]

    # Verify CPSE mapping created while preserving original CPSE code
    raw1 = await async_db.get(RawMaterial, mat1.raw_material_id)
    mapping = await async_db.get(CPSECNMCMapping, uuid.UUID(decision_res["mapping_id"]))
    assert mapping is not None
    assert mapping.local_material_code == raw1.material_code == "MAT-1001"
    assert mapping.cnmc_id == master.id
    assert mapping.status == "ACTIVE"


# Test B: Existing CNMC reuse candidate
@pytest.mark.asyncio
async def test_existing_cnmc_reuse_candidate(async_db: AsyncSession):
    # Find Mat 1 and Mat 2
    stmt1 = select(NormalizedMaterial).where(NormalizedMaterial.canonical_description.ilike("%M16 x 50%"))
    res1 = await async_db.execute(stmt1)
    materials = res1.scalars().all()
    mat1 = materials[0]
    mat2 = materials[1]

    # Create approved CNMC Master and mapping for Mat 1
    master = CNMCMaster(
        id=uuid.uuid4(),
        cnmc_code="IN-IND-MECH-BLT-00492",
        canonical_name=mat1.canonical_description,
        standard_description="Standardized M16x50 Bolt",
        taxonomy_id=mat1.taxonomy_id,
        status="ACTIVE"
    )
    raw1 = await async_db.get(RawMaterial, mat1.raw_material_id)
    mapping1 = CPSECNMCMapping(
        id=uuid.uuid4(),
        raw_material_id=raw1.id,
        normalized_material_id=mat1.id,
        organization_id=mat1.organization_id,
        local_material_code=raw1.material_code,
        cnmc_id=master.id,
        mapping_type="DIRECT_MATCH",
        status="ACTIVE",
        approved_by="domain_reviewer"
    )
    # Add match between Mat 1 and Mat 2
    match = MaterialSimilarityMatch(
        id=uuid.uuid4(),
        source_material_id=mat1.id,
        target_material_id=mat2.id,
        match_type="EXACT_DUPLICATE",
        composite_confidence=0.98,
        match_explanation="Identical canonical dimensions and grade",
        recommendation_status="PROPOSED"
    )
    async_db.add_all([master, mapping1, match])
    await async_db.flush()

    # Now ask recommendation for Mat 2 (CPSE B)
    service = CNMCRecommendationService(async_db)
    result = await service.recommend_cnmc_for_material(mat2.id, persist_candidate=False)

    assert result.outcome == RecommendationOutcome.REUSE_EXISTING_CNMC_CANDIDATE
    assert result.proposed_cnmc == "IN-IND-MECH-BLT-00492"
    assert result.explanation.existing_cluster_reference == "IN-IND-MECH-BLT-00492"
    assert result.recommendation_strength == RecommendationStrength.HIGH


# Test H: Reject workflow with mandatory reason
@pytest.mark.asyncio
async def test_reject_workflow_mandatory_reason(async_db: AsyncSession):
    cand = CNMCCandidate(
        id=uuid.uuid4(),
        proposed_cnmc="IN-IND-MECH-BLT-99999",
        candidate_group_name="Invalid Bolt",
        proposed_description="Test candidate",
        confidence_score=0.8,
        recommendation_explanation="{}",
        status="PENDING_REVIEW"
    )
    async_db.add(cand)
    await async_db.flush()

    workflow = GovernanceWorkflowService(async_db)

    # Rejection without reason must fail
    with pytest.raises(ValueError, match="Mandatory justification comment is required"):
        await workflow.review_candidate(
            candidate_id=cand.id,
            action=GovernanceAction.REJECT,
            reviewer_reference="reviewer_01",
            comments=""
        )

    # Rejection with valid reason
    res = await workflow.review_candidate(
        candidate_id=cand.id,
        action=GovernanceAction.REJECT,
        reviewer_reference="reviewer_01",
        comments="Rejected due to invalid thread standard classification."
    )
    assert res["decision"] == "REJECT"
    assert res["new_status"] == "REJECTED"

    # Verify no CNMCMaster was created
    master_stmt = select(CNMCMaster).where(CNMCMaster.cnmc_code == "IN-IND-MECH-BLT-99999")
    m_res = await async_db.execute(master_stmt)
    assert m_res.scalars().first() is None


# Test I & J: Modify workflow with mandatory reason and original recommendation preservation
@pytest.mark.asyncio
async def test_modify_workflow_preserves_original_recommendation(async_db: AsyncSession):
    cand = CNMCCandidate(
        id=uuid.uuid4(),
        proposed_cnmc="IN-IND-MECH-GEN-00100",
        candidate_group_name="Hex Bolt Initial",
        proposed_description="Initial AI description",
        confidence_score=0.85,
        recommendation_explanation="{}",
        status="PENDING_REVIEW"
    )
    async_db.add(cand)
    await async_db.flush()

    workflow = GovernanceWorkflowService(async_db)

    # Modification without comment must fail
    with pytest.raises(ValueError, match="Mandatory justification comment is required"):
        await workflow.review_candidate(
            candidate_id=cand.id,
            action=GovernanceAction.MODIFY,
            reviewer_reference="reviewer_01",
            modified_cnmc="IN-IND-MECH-BLT-00100",
            comments=""
        )

    # Modification with valid comment
    res = await workflow.review_candidate(
        candidate_id=cand.id,
        action=GovernanceAction.MODIFY,
        reviewer_reference="reviewer_01",
        comments="Corrected type code from GEN to BLT based on DIN 933 drawings.",
        modified_cnmc="IN-IND-MECH-BLT-00100",
        modified_group_name="Hexagon Head Bolt Refined",
        modified_description="Refined Specification for Hex Bolt M16"
    )

    assert res["decision"] == "MODIFY"
    assert res["new_status"] == "MODIFIED"

    # Verify master created with overridden values
    master = await async_db.get(CNMCMaster, uuid.UUID(res["master_id"]))
    assert master is not None
    assert master.cnmc_code == "IN-IND-MECH-BLT-00100"
    assert master.canonical_name == "Hexagon Head Bolt Refined"

    # Verify original AI recommendation is preserved in governance_metadata
    orig = master.governance_metadata.get("original_recommendation_history")
    assert orig is not None
    assert orig["proposed_cnmc"] == "IN-IND-MECH-GEN-00100"
    assert orig["candidate_group_name"] == "Hex Bolt Initial"


# Test L & M: No automatic mapping or record merge
@pytest.mark.asyncio
async def test_no_automatic_mapping_or_merge(async_db: AsyncSession):
    # Verify raw materials count before and after candidate creation
    stmt = select(RawMaterial)
    res_before = await async_db.execute(stmt)
    raw_count_before = len(res_before.scalars().all())

    # Generate recommendation for Mat 1
    stmt1 = select(NormalizedMaterial).where(NormalizedMaterial.canonical_description.ilike("%M16 x 50%"))
    res1 = await async_db.execute(stmt1)
    mat1 = res1.scalars().first()

    service = CNMCRecommendationService(async_db)
    rec = await service.recommend_cnmc_for_material(mat1.id, persist_candidate=True)

    # Verify no mappings exist yet (only proposed candidate)
    map_stmt = select(CPSECNMCMapping).where(CPSECNMCMapping.normalized_material_id == mat1.id)
    map_res = await async_db.execute(map_stmt)
    assert map_res.scalars().first() is None

    # Verify raw materials are NOT merged or deleted
    res_after = await async_db.execute(stmt)
    raw_count_after = len(res_after.scalars().all())
    assert raw_count_before == raw_count_after


# Test N: Sensitive Layer 1 data exclusion in audit trail
@pytest.mark.asyncio
async def test_sensitive_layer1_data_excluded_from_audit(async_db: AsyncSession):
    sensitive_payload = {
        "unit_price": 1500.00,
        "po_number": "PO-SECRET-999",
        "vendor_name": "Confidential Supplier Inc",
        "store_location": "Vault-A",
        "engineering_term": "Hexagon Head Bolt",
        "standard_code": "IS 1363"
    }

    sanitized = sanitize_audit_payload(sensitive_payload)
    assert "unit_price" not in sanitized
    assert "po_number" not in sanitized
    assert "vendor_name" not in sanitized
    assert "store_location" not in sanitized
    assert sanitized["engineering_term"] == "Hexagon Head Bolt"
    assert sanitized["standard_code"] == "IS 1363"


# Test O: Duplicate recommendation prevention / Idempotency
@pytest.mark.asyncio
async def test_duplicate_recommendation_prevention(async_db: AsyncSession):
    stmt = select(NormalizedMaterial).where(NormalizedMaterial.canonical_description.ilike("%M16 x 50%"))
    res = await async_db.execute(stmt)
    mat = res.scalars().first()

    service = CNMCRecommendationService(async_db)
    # First call
    res1 = await service.recommend_cnmc_for_material(mat.id, persist_candidate=True)
    # Second call for same material
    res2 = await service.recommend_cnmc_for_material(mat.id, persist_candidate=True)

    assert res1.candidate_id == res2.candidate_id
    assert res2.is_existing_candidate is True


# Test Q: Complete audit trail generation
@pytest.mark.asyncio
async def test_complete_audit_trail_generation(async_db: AsyncSession):
    cand_id = uuid.uuid4()
    await record_audit_log(
        session=async_db,
        entity_type="CNMC_CANDIDATE",
        entity_id=str(cand_id),
        action="CNMC_RECOMMENDATION_CREATED",
        actor_reference="ENGINE_V1",
        metadata_payload={"test": "ok"}
    )
    await async_db.flush()

    audit_stmt = select(AuditLog).where(AuditLog.entity_id == str(cand_id))
    a_res = await async_db.execute(audit_stmt)
    logs = a_res.scalars().all()
    assert len(logs) == 1
    assert logs[0].action == "CNMC_RECOMMENDATION_CREATED"
    assert logs[0].actor_reference == "ENGINE_V1"


# Test R: API validation via AsyncClient
@pytest.mark.asyncio
async def test_cnmc_and_governance_api_endpoints(async_db: AsyncSession):
    from app.main import app
    from app.db.session import get_db
    from httpx import AsyncClient, ASGITransport

    async def override_get_db():
        yield async_db

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Test GET /api/v1/cnmc/candidates
        res = await client.get("/api/v1/cnmc/candidates")
        assert res.status_code == 200
        assert isinstance(res.json(), list)

        # Test GET /api/v1/cnmc/mappings
        res_map = await client.get("/api/v1/cnmc/mappings")
        assert res_map.status_code == 200
        assert isinstance(res_map.json(), list)

        # Test GET /api/v1/governance/reviews
        res_gov = await client.get("/api/v1/governance/reviews")
        assert res_gov.status_code == 200
        assert isinstance(res_gov.json(), list)

        # Test GET /api/v1/governance/audit-logs
        res_audit = await client.get("/api/v1/governance/audit-logs")
        assert res_audit.status_code == 200
        assert isinstance(res_audit.json(), list)

    app.dependency_overrides.clear()
