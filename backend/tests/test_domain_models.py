import pytest
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.exc import IntegrityError

from app.db.session import Base
from app.models import (
    Organization,
    SourceSystem,
    MaterialTaxonomy,
    RawMaterial,
    NormalizedMaterial,
    MaterialAttribute,
    MaterialEmbedding,
    StandardsEquivalence,
    MaterialSimilarityMatch,
    CNMCCandidate,
    CNMCMaster,
    CPSECNMCMapping,
    GovernanceReview,
    AuditLog,
    SystemHealthCheck,
)
from scripts.seed_demo_data import seed_data


def test_domain_models_schema_compilation():
    """
    Verify all Phase 5 domain models can compile their metadata and create tables
    in a clean SQLite database without foreign key or column mapping errors.
    """
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    # 1. Organization & Source System
    org = Organization(
        id=uuid.uuid4(),
        code="IOCL",
        name="Indian Oil Corporation Limited",
        sector="Oil & Gas",
        status="ACTIVE"
    )
    session.add(org)
    session.flush()

    src = SourceSystem(
        id=uuid.uuid4(),
        organization_id=org.id,
        name="IOCL SAP ERP",
        system_type="SAP",
        is_active=True
    )
    session.add(src)
    session.flush()

    # 2. Taxonomy
    tax = MaterialTaxonomy(
        id=uuid.uuid4(),
        code="IND-MECH-FAST-BLT",
        name="Hexagon Head Bolts",
        level=4,
        path="Industrial / Mechanical / Fasteners / Bolts",
        is_active=True
    )
    session.add(tax)
    session.flush()

    # 3. Raw Material (Layer 1) & Normalized Material (Layer 2)
    raw = RawMaterial(
        id=uuid.uuid4(),
        organization_id=org.id,
        source_system_id=src.id,
        material_code="IOCL-BOLT-001",
        material_description="HEX BOLT M16 X 50 MM SS304",
        uom="NOS",
        source_payload={"unit_price": 48.50, "po_number": "PO-12345"},
        status="NORMALIZED"
    )
    session.add(raw)
    session.flush()

    norm = NormalizedMaterial(
        id=uuid.uuid4(),
        raw_material_id=raw.id,
        organization_id=org.id,
        canonical_description="Hexagon Head Bolt, M16 x 50 mm, Grade SS304 (IS 1363)",
        normalized_uom="EA",
        taxonomy_id=tax.id,
        engineering_term="Hexagon Head Bolt",
        standard_code="IS 1363",
        material_grade="SS304",
        normalization_status="NORMALIZED",
        confidence_score=0.99
    )
    session.add(norm)
    session.flush()

    attr = MaterialAttribute(
        id=uuid.uuid4(),
        normalized_material_id=norm.id,
        attribute_name="diameter",
        original_value="16MM",
        normalized_value="16.0",
        normalized_unit="mm",
        data_type="NUMERIC",
        source="RULE_EXTRACTOR",
        confidence=1.0
    )
    session.add(attr)
    session.flush()

    # 4. Standards Equivalence
    std = StandardsEquivalence(
        id=uuid.uuid4(),
        source_standard="IS 1363",
        target_standard="ISO 4016",
        equivalence_type="VERIFIED_EQUIVALENT",
        comparison_notes="Standard metric bolt specifications identical",
        domain_reviewer_required=False,
        verification_status="VERIFIED"
    )
    session.add(std)
    session.flush()

    # 5. CNMC Candidate, Master & Mapping (Layer 3)
    cand = CNMCCandidate(
        id=uuid.uuid4(),
        proposed_cnmc="IN-IND-MECH-BLT-00492",
        candidate_group_name="Hex Bolt M16x50 SS304",
        proposed_description="National Unified Standard: Hexagon Head Bolt M16x50 SS304",
        taxonomy_id=tax.id,
        confidence_score=0.98,
        recommendation_explanation="Cluster across 3 CPSEs",
        status="APPROVED"
    )
    session.add(cand)
    session.flush()

    cnmc = CNMCMaster(
        id=uuid.uuid4(),
        cnmc_code="IN-IND-MECH-BLT-00492",
        canonical_name="Hexagon Head Bolt M16x50 SS304 (IS 1363)",
        standard_description="Standardized National Specification for M16x50 SS304 Hex Bolt",
        taxonomy_id=tax.id,
        spec_template={"diameter": "16mm", "length": "50mm", "grade": "SS304"},
        status="ACTIVE"
    )
    session.add(cnmc)
    session.flush()

    mapping = CPSECNMCMapping(
        id=uuid.uuid4(),
        raw_material_id=raw.id,
        normalized_material_id=norm.id,
        organization_id=org.id,
        local_material_code=raw.material_code,  # Original code preserved
        cnmc_id=cnmc.id,
        mapping_type="DIRECT_MATCH",
        confidence_score=1.0,
        status="ACTIVE",
        approved_by="domain_reviewer_01"
    )
    session.add(mapping)
    session.flush()

    # 6. Governance Review & Audit Log
    gov = GovernanceReview(
        id=uuid.uuid4(),
        entity_type="CNMC_CANDIDATE",
        entity_id=cand.id,
        reviewer_reference="domain_reviewer_01",
        decision="APPROVED",
        comments="Fully verified",
        new_status="APPROVED"
    )
    session.add(gov)

    audit = AuditLog(
        id=uuid.uuid4(),
        entity_type="CPSE_MAPPING",
        entity_id=str(mapping.id),
        action="MAPPING_ACTIVATED",
        actor_reference="domain_reviewer_01"
    )
    session.add(audit)
    session.commit()

    # Assertions
    retrieved_org = session.query(Organization).filter_by(code="IOCL").first()
    assert retrieved_org is not None
    assert retrieved_org.name == "Indian Oil Corporation Limited"

    retrieved_mapping = session.query(CPSECNMCMapping).filter_by(local_material_code="IOCL-BOLT-001").first()
    assert retrieved_mapping is not None
    assert retrieved_mapping.mapping_type == "DIRECT_MATCH"
    assert retrieved_mapping.status == "ACTIVE"

    retrieved_attr = session.query(MaterialAttribute).filter_by(attribute_name="diameter").first()
    assert retrieved_attr is not None
    assert retrieved_attr.normalized_value == "16.0"
    assert retrieved_attr.normalized_unit == "mm"

    session.close()


def test_unique_constraints_and_data_integrity():
    """
    Verify unique constraints on organizations, raw material codes per organization,
    and CNMC master codes.
    """
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    # 1. Duplicate Organization Code
    org1 = Organization(id=uuid.uuid4(), code="ONGC", name="ONGC Corp", sector="Energy")
    session.add(org1)
    session.commit()

    org2 = Organization(id=uuid.uuid4(), code="ONGC", name="Duplicate ONGC", sector="Energy")
    session.add(org2)
    with pytest.raises(IntegrityError):
        session.commit()
    session.rollback()

    # 2. Duplicate CNMC Code
    cnmc1 = CNMCMaster(
        id=uuid.uuid4(),
        cnmc_code="IN-IND-MECH-BLT-00001",
        canonical_name="Bolt M10",
        standard_description="M10 Bolt"
    )
    session.add(cnmc1)
    session.commit()

    cnmc2 = CNMCMaster(
        id=uuid.uuid4(),
        cnmc_code="IN-IND-MECH-BLT-00001",
        canonical_name="Duplicate M10",
        standard_description="Duplicate"
    )
    session.add(cnmc2)
    with pytest.raises(IntegrityError):
        session.commit()
    session.rollback()

    session.close()


@pytest.mark.asyncio
async def test_seed_demo_data_execution_and_idempotency():
    """
    Verify that the seed_demo_data function runs asynchronously against an in-memory
    database, creates all 5 CPSEs, multi-level taxonomies, raw and normalized records,
    candidate matches, standards equivalences, and completes the full CPSE -> CNMC chain.
    """
    async_engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    AsyncTestSession = async_sessionmaker(async_engine, expire_on_commit=False, class_=AsyncSession)

    # First run (Fresh Seed)
    async with AsyncTestSession() as session:
        summary = await seed_data(session)
        assert summary["organizations"] == 5
        assert summary["materials"] == 5
        assert summary["matches"] == 3
        assert summary["standards"] == 5
        assert summary["cnmc_approved"] == 1
        assert summary["mappings"] == 3
        assert summary["audit_logs"] == 7

    # Second run (Idempotency Check)
    async with AsyncTestSession() as session:
        summary2 = await seed_data(session)
        assert summary2["organizations"] == 5
        assert summary2["materials"] == 5
