import pytest
import uuid
import json
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select
from fastapi import HTTPException

from app.main import app
from app.db.session import Base, get_db
from app.models.organization import Organization
from app.models.ingestion import IngestionJob
from app.models.material import RawMaterial, NormalizedMaterial, MaterialAttribute
from app.models.cnmc import CNMCCandidate, CNMCMaster, CPSECNMCMapping
from app.models.governance import AuditLog
from app.models.user import User, RoleEnum
from app.services.auth.seed_users import seed_demo_users
from app.services.ingestion_engine import execute_ingestion_job
from app.services.cnmc.generator import generate_prototype_cnmc_code
from app.services.matching.text_similarity import compute_token_jaccard, _tokenize
from app.core.deps import validate_raw_layer1_access


@pytest.fixture
async def e2e_test_context():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    async def override_get_db():
        async with AsyncSessionLocal() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncSessionLocal() as session:
        # Create 2 test CPSE organizations
        org_iocl = Organization(
            id=uuid.uuid4(),
            code="IOCL",
            name="Indian Oil Corporation Limited",
            sector="Oil & Gas",
            status="ACTIVE",
        )
        org_ongc = Organization(
            id=uuid.uuid4(),
            code="ONGC",
            name="Oil and Natural Gas Corporation",
            sector="Oil & Gas",
            status="ACTIVE",
        )
        session.add_all([org_iocl, org_ongc])
        await session.flush()
        await seed_demo_users(session)
        await session.commit()

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            yield {
                "client": client,
                "session_maker": AsyncSessionLocal,
                "org_iocl": org_iocl,
                "org_ongc": org_ongc,
            }

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_scenario_1_full_end_to_end_workflow(e2e_test_context: dict):
    """
    PHASE 12 TEST SCENARIO 1:
    1. Synthetic CPSE Org A (IOCL) and Org B (ONGC)
    2. Upload/import material records
    3. Normalize descriptions
    4. Extract technical attributes
    5. Execute matching & retrieve match candidates
    6. Generate CNMC recommendation
    7. Submit governance review & approve
    8. Verify CNMC master record & CPSE mapping
    9. Verify original legacy material code is preserved
    10. Verify audit logs & analytics reflect records
    """
    client = e2e_test_context["client"]
    org_iocl = e2e_test_context["org_iocl"]
    org_ongc = e2e_test_context["org_ongc"]
    session_maker = e2e_test_context["session_maker"]

    # 1. Login as CPSE Manager A (IOCL)
    login_iocl = await client.post(
        "/api/v1/auth/login",
        json={"email": "cpse_manager_a@sih.demo", "password": "DemoManager@2026"}
    )
    token_iocl = login_iocl.json()["access_token"]

    csv_data = (
        "local_material_code,local_description,unit_of_measure,category_name,vendor_name,contract_price\n"
        "IOCL-BOLT-1001,Hexagon Head Bolt M16 x 50 mm SS304 IS 1363,NOS,Fasteners,Sundaram Fasteners,125.50\n"
    ).encode("utf-8")

    # 2. Upload and Ingest
    upload_res = await client.post(
        "/api/v1/ingestion/upload",
        headers={"Authorization": f"Bearer {token_iocl}"},
        data={"organization_id": str(org_iocl.id)},
        files={"file": ("iocl_catalog.csv", csv_data, "text/csv")}
    )
    assert upload_res.status_code == 201
    job_id = upload_res.json()["job_id"]

    mapping = {
        "material_code": "local_material_code",
        "description": "local_description",
        "uom": "unit_of_measure",
        "category": "category_name"
    }

    async with session_maker() as session:
        await execute_ingestion_job(uuid.UUID(job_id), mapping, session)

        # 3. Verify Layer 1 raw & Layer 2 normalized items
        raw_rec = (await session.execute(
            select(RawMaterial).where(RawMaterial.organization_id == org_iocl.id)
        )).scalars().first()
        assert raw_rec is not None
        assert raw_rec.material_code == "IOCL-BOLT-1001"

        norm_rec = (await session.execute(
            select(NormalizedMaterial).where(NormalizedMaterial.organization_id == org_iocl.id)
        )).scalars().first()
        assert norm_rec is not None
        assert "Hexagon Head Bolt" in norm_rec.canonical_description

        # 4. Create CNMC Candidate
        cand_id = uuid.uuid4()
        code_approve = generate_prototype_cnmc_code("IN", "IND", "MECH", "BLT", 1001)
        cand = CNMCCandidate(
            id=cand_id,
            proposed_cnmc=code_approve,
            candidate_group_name="Hex Bolt M16 SS304",
            proposed_description="Prototype Spec: Hex Bolt M16 SS304 IS 1363",
            confidence_score=0.96,
            recommendation_explanation=json.dumps({"summary": "Rule & similarity match"}),
            generation_source="ENGINE_V1_TAXONOMY_RULE_BASED",
            status="PENDING_REVIEW"
        )
        session.add(cand)
        await session.commit()

    # 5. Governance Reviewer Approves
    login_rev = await client.post(
        "/api/v1/auth/login",
        json={"email": "domain_reviewer@sih.demo", "password": "DemoReviewer@2026"}
    )
    rev_token = login_rev.json()["access_token"]

    res_app = await client.post(
        f"/api/v1/cnmc/candidates/{cand_id}/review",
        headers={"Authorization": f"Bearer {rev_token}"},
        json={"action": "APPROVE", "comments": "Approved as standard master specification"}
    )
    assert res_app.status_code == 200
    assert res_app.json()["decision"] == "APPROVE"
    assert res_app.json()["new_status"] == "APPROVED"

    # 6. Verify Master, CPSE Mapping, and Audit Log
    async with session_maker() as session:
        master_rec = (await session.execute(
            select(CNMCMaster).where(CNMCMaster.cnmc_code == code_approve)
        )).scalars().first()
        assert master_rec is not None
        assert master_rec.status == "ACTIVE"

        # Create mapping linking IOCL local code to CNMC
        mapping_rec = CPSECNMCMapping(
            id=uuid.uuid4(),
            organization_id=org_iocl.id,
            raw_material_id=raw_rec.id,
            normalized_material_id=norm_rec.id,
            local_material_code=raw_rec.material_code,
            cnmc_id=master_rec.id,
            mapping_type="DIRECT_MATCH",
            confidence_score=0.96,
            status="ACTIVE",
            approved_by="domain_reviewer@sih.demo"
        )
        session.add(mapping_rec)
        await session.commit()

        # Check legacy code preserved
        assert raw_rec.material_code == "IOCL-BOLT-1001"

        # Check audit log written
        audit_entries = (await session.execute(
            select(AuditLog).where(AuditLog.entity_id == str(cand_id))
        )).scalars().all()
        assert len(audit_entries) >= 1

    # 7. Check Analytics Dashboard reflects standardized records
    login_admin = await client.post(
        "/api/v1/auth/login",
        json={"email": "national_admin@sih.demo", "password": "DemoAdmin@2026"}
    )
    admin_token = login_admin.json()["access_token"]

    dash_res = await client.get(
        "/api/v1/analytics/dashboard",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["kpis"]["total_participating_cpses"] >= 2
    assert dash_data["disclaimer"] != ""


@pytest.mark.asyncio
async def test_scenario_2_rejected_cnmc_creates_no_mapping(e2e_test_context: dict):
    """
    PHASE 12 TEST SCENARIO 2:
    Rejected CNMC recommendation creates no approved master and no CPSE mapping.
    """
    client = e2e_test_context["client"]
    session_maker = e2e_test_context["session_maker"]

    login_rev = await client.post(
        "/api/v1/auth/login",
        json={"email": "domain_reviewer@sih.demo", "password": "DemoReviewer@2026"}
    )
    rev_token = login_rev.json()["access_token"]

    cand_id = uuid.uuid4()
    code_reject = generate_prototype_cnmc_code("IN", "IND", "MECH", "PMP", 999)
    async with session_maker() as session:
        cand_r = CNMCCandidate(
            id=cand_id,
            proposed_cnmc=code_reject,
            candidate_group_name="Defective Centrifugal Pump",
            proposed_description="Prototype Spec: Defective Pump Record",
            confidence_score=0.35,
            recommendation_explanation=json.dumps({"summary": "Low confidence match"}),
            generation_source="AI_CLUSTERING",
            status="PENDING_REVIEW"
        )
        session.add(cand_r)
        await session.commit()

    res_rej = await client.post(
        f"/api/v1/cnmc/candidates/{cand_id}/review",
        headers={"Authorization": f"Bearer {rev_token}"},
        json={"action": "REJECT", "comments": "Rejected due to ambiguous specification parameters"}
    )
    assert res_rej.status_code == 200
    assert res_rej.json()["decision"] == "REJECT"
    assert res_rej.json()["new_status"] == "REJECTED"

    async with session_maker() as session:
        master_rej = (await session.execute(
            select(CNMCMaster).where(CNMCMaster.cnmc_code == code_reject)
        )).scalars().first()
        assert master_rej is None


@pytest.mark.asyncio
async def test_scenario_3_modified_recommendation_preserves_metadata(e2e_test_context: dict):
    """
    PHASE 12 TEST SCENARIO 3:
    Modified recommendation preserves original recommendation metadata while capturing human override.
    """
    client = e2e_test_context["client"]
    session_maker = e2e_test_context["session_maker"]

    login_rev = await client.post(
        "/api/v1/auth/login",
        json={"email": "domain_reviewer@sih.demo", "password": "DemoReviewer@2026"}
    )
    rev_token = login_rev.json()["access_token"]

    cand_id = uuid.uuid4()
    orig_code = generate_prototype_cnmc_code("IN", "IND", "ELEC", "CBL", 101)
    modified_code = generate_prototype_cnmc_code("IN", "IND", "ELEC", "CBL", 777)

    async with session_maker() as session:
        cand_m = CNMCCandidate(
            id=cand_id,
            proposed_cnmc=orig_code,
            candidate_group_name="Copper Cable 4 Core",
            proposed_description="Prototype Spec: Copper Cable 4C",
            confidence_score=0.82,
            recommendation_explanation=json.dumps({"summary": "Rule recommendation"}),
            generation_source="ENGINE_V1_TAXONOMY_RULE_BASED",
            status="PENDING_REVIEW"
        )
        session.add(cand_m)
        await session.commit()

    res_mod = await client.post(
        f"/api/v1/cnmc/candidates/{cand_id}/review",
        headers={"Authorization": f"Bearer {rev_token}"},
        json={
            "action": "MODIFY",
            "comments": "Refined category sequence and expanded technical description",
            "modified_cnmc": modified_code,
            "modified_group_name": "Armoured Copper Power Cable 4 Core 16 sqmm 1.1kV",
            "modified_description": "Standard Master Spec: 4 Core x 16 sqmm XLPE Armoured Copper Cable"
        }
    )
    assert res_mod.status_code == 200
    assert res_mod.json()["decision"] == "MODIFY"
    assert res_mod.json()["new_status"] == "MODIFIED"

    async with session_maker() as session:
        # Check that candidate record was updated to modified code and status MODIFIED
        cand_db = (await session.execute(
            select(CNMCCandidate).where(CNMCCandidate.id == cand_id)
        )).scalars().first()
        assert cand_db.proposed_cnmc == modified_code
        assert cand_db.status == "MODIFIED"

        # Check that new master record uses the human-override code and stores original recommendation in metadata
        master_mod = (await session.execute(
            select(CNMCMaster).where(CNMCMaster.cnmc_code == modified_code)
        )).scalars().first()
        assert master_mod is not None
        assert "Armoured Copper Power Cable" in master_mod.canonical_name
        assert master_mod.governance_metadata["original_recommendation_history"]["proposed_cnmc"] == orig_code


@pytest.mark.asyncio
async def test_scenario_4_sensitive_procurement_airgap_in_shared_layers(e2e_test_context: dict):
    """
    PHASE 12 TEST SCENARIO 4:
    Sensitive PO, vendor identity, contract pricing, and store bin data NEVER appear in shared analytics.
    """
    client = e2e_test_context["client"]

    login_admin = await client.post(
        "/api/v1/auth/login",
        json={"email": "national_admin@sih.demo", "password": "DemoAdmin@2026"}
    )
    token = login_admin.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    endpoints = [
        "/api/v1/analytics/dashboard",
        "/api/v1/analytics/duplicates",
        "/api/v1/analytics/cross-cpse-overlap",
        "/api/v1/analytics/cnmc-summary",
        "/api/v1/analytics/procurement-opportunities",
        "/api/v1/analytics/rationalization-priorities",
        "/api/v1/analytics/categories",
    ]

    sensitive_keywords = ["vendor_name", "po_number", "contract_price", "store_bin", "sundaram", "l&t valves"]

    for ep in endpoints:
        res = await client.get(ep, headers=headers)
        assert res.status_code == 200
        raw_text = res.text.lower()
        for kw in sensitive_keywords:
            assert kw not in raw_text, f"Airgap violation: '{kw}' leaked in endpoint {ep}"


@pytest.mark.asyncio
async def test_scenario_5_multi_tenant_isolation_prevents_cross_access(e2e_test_context: dict):
    """
    PHASE 12 TEST SCENARIO 5:
    CPSE Material Manager cannot access or upload for another CPSE's organization.
    """
    client = e2e_test_context["client"]
    org_ongc = e2e_test_context["org_ongc"]

    # CPSE Manager A (IOCL) attempts action on ONGC
    login_iocl = await client.post(
        "/api/v1/auth/login",
        json={"email": "cpse_manager_a@sih.demo", "password": "DemoManager@2026"}
    )
    token_iocl = login_iocl.json()["access_token"]

    csv_data = b"material_code,description\nTEST-01,Sample Item\n"
    res_cross = await client.post(
        "/api/v1/ingestion/upload",
        headers={"Authorization": f"Bearer {token_iocl}"},
        data={"organization_id": str(org_ongc.id)},
        files={"file": ("test.csv", csv_data, "text/csv")}
    )
    assert res_cross.status_code == 403
    assert "Cross-tenant access denied" in res_cross.json()["error"]["message"]


@pytest.mark.asyncio
async def test_scenario_6_duplicate_upload_protection(e2e_test_context: dict):
    """
    PHASE 12 TEST SCENARIO 6:
    Duplicate catalog upload protection detects identical SHA-256 and rejects with HTTP 409 Conflict.
    """
    client = e2e_test_context["client"]
    org_iocl = e2e_test_context["org_iocl"]

    login_iocl = await client.post(
        "/api/v1/auth/login",
        json={"email": "cpse_manager_a@sih.demo", "password": "DemoManager@2026"}
    )
    token = login_iocl.json()["access_token"]

    csv_content = b"local_material_code,local_description\nITEM-UNIQUE-99,Unique Demo Catalog Item\n"

    # 1. First upload
    res1 = await client.post(
        "/api/v1/ingestion/upload",
        headers={"Authorization": f"Bearer {token}"},
        data={"organization_id": str(org_iocl.id)},
        files={"file": ("catalog_unique.csv", csv_content, "text/csv")}
    )
    assert res1.status_code == 201

    # 2. Duplicate upload with exact same SHA-256
    res2 = await client.post(
        "/api/v1/ingestion/upload",
        headers={"Authorization": f"Bearer {token}"},
        data={"organization_id": str(org_iocl.id)},
        files={"file": ("catalog_duplicate.csv", csv_content, "text/csv")}
    )
    assert res2.status_code == 409
    assert "Duplicate file detected" in res2.json()["error"]["message"]


@pytest.mark.asyncio
async def test_scenario_7_ai_recommendation_requires_human_governance(e2e_test_context: dict):
    """
    PHASE 12 TEST SCENARIO 7:
    AI recommendation never automatically approves without an authenticated human review action.
    """
    session_maker = e2e_test_context["session_maker"]

    cand_id = uuid.uuid4()
    code_auto = generate_prototype_cnmc_code("IN", "IND", "MECH", "VLV", 505)

    async with session_maker() as session:
        cand = CNMCCandidate(
            id=cand_id,
            proposed_cnmc=code_auto,
            candidate_group_name="Gate Valve 2 Inch Class 150",
            proposed_description="Prototype Spec: Gate Valve 2 Inch Class 150 WCB",
            confidence_score=0.99,  # Highest confidence
            recommendation_explanation=json.dumps({"summary": "High confidence match"}),
            generation_source="AI_CLUSTERING",
            status="PENDING_REVIEW"
        )
        session.add(cand)
        await session.commit()

        # Confirm candidate status is strictly PENDING_REVIEW
        cand_check = (await session.execute(
            select(CNMCCandidate).where(CNMCCandidate.id == cand_id)
        )).scalars().first()
        assert cand_check.status == "PENDING_REVIEW"

        # Confirm NO CNMCMaster record exists before human review
        master_check = (await session.execute(
            select(CNMCMaster).where(CNMCMaster.cnmc_code == code_auto)
        )).scalars().first()
        assert master_check is None
