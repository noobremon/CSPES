"""
Comprehensive Backend Test Suite for Phase 9:
National Material Intelligence Analytics Dashboard & Procurement Opportunity Engine.

Test Scenarios:
1. National dashboard aggregation (10 core KPIs)
2. Duplicate cluster analytics
3. Cross-CPSE overlap calculations
4. Empty dataset behavior
5. Insufficient data behavior (< 2 CPSEs)
6. CNMC summary metrics & funnel
7. Procurement opportunity generation
8. Synthetic data labeling / disclaimer verification
9. Rationalization priority scoring formula
10. Priority explanation rationale
11. Sensitive Layer 1 data exclusion
12. API validation & error handling
13. Pagination
14. Filtering
15. Category analytics & drilldown
16. Governance status aggregation
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
    MaterialSimilarityMatch,
    GovernanceReview,
    AuditLog,
)
from app.services.analytics import (
    NationalDashboardService,
    DuplicateAnalyticsService,
    CrossCPSEAnalyticsService,
    CNMCAnalyticsService,
    ProcurementOpportunityService,
    RationalizationPriorityService,
    CategoryAnalyticsService,
    DEMONSTRATION_OPPORTUNITY_NOTICE,
)


@pytest.fixture
async def analytics_db():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    async with AsyncSessionLocal() as session:
        # Create 3 CPSE Organizations
        org_a = Organization(id=uuid.uuid4(), code="IOCL", name="Indian Oil Corporation Limited", sector="Oil & Gas", status="ACTIVE")
        org_b = Organization(id=uuid.uuid4(), code="ONGC", name="Oil and Natural Gas Corporation", sector="Exploration", status="ACTIVE")
        org_c = Organization(id=uuid.uuid4(), code="NTPC", name="NTPC Limited", sector="Power Generation", status="ACTIVE")
        session.add_all([org_a, org_b, org_c])

        # Create Systems
        sys_a = SourceSystem(id=uuid.uuid4(), organization_id=org_a.id, name="IOCL SAP", system_type="SAP")
        sys_b = SourceSystem(id=uuid.uuid4(), organization_id=org_b.id, name="ONGC SAP", system_type="SAP")
        sys_c = SourceSystem(id=uuid.uuid4(), organization_id=org_c.id, name="NTPC Oracle", system_type="ORACLE")
        session.add_all([sys_a, sys_b, sys_c])

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

        # Material 1 (IOCL): Hex Bolt SS304 M16x50
        raw1 = RawMaterial(
            id=uuid.uuid4(),
            organization_id=org_a.id,
            source_system_id=sys_a.id,
            material_code="IOCL-B-101",
            material_description="HEX BOLT SS304 M16 X 50 MM",
            uom="NOS",
            source_payload={"unit_price": 50.0, "po_number": "PO-SECRET-01"}
        )
        norm1 = NormalizedMaterial(
            id=uuid.uuid4(),
            raw_material_id=raw1.id,
            organization_id=org_a.id,
            canonical_description="Hexagon Head Bolt, M16 x 50 mm, Grade SS304 (IS 1363)",
            normalized_uom="EA",
            taxonomy_id=tax_mech.id,
            engineering_term="Hexagon Head Bolt",
            material_grade="SS304",
            standard_code="IS 1363",
            normalization_status="NORMALIZED"
        )

        # Material 2 (ONGC): Stainless Steel Hex Bolt M16x50 (Exact duplicate candidate)
        raw2 = RawMaterial(
            id=uuid.uuid4(),
            organization_id=org_b.id,
            source_system_id=sys_b.id,
            material_code="ONGC-B-778",
            material_description="STAINLESS STEEL HEX BOLT M16 X 50",
            uom="EA",
            source_payload={"unit_price": 48.0, "vendor_name": "Secret Vendor"}
        )
        norm2 = NormalizedMaterial(
            id=uuid.uuid4(),
            raw_material_id=raw2.id,
            organization_id=org_b.id,
            canonical_description="Hexagon Head Bolt, M16 x 50 mm, Grade SS304 (IS 1363)",
            normalized_uom="EA",
            taxonomy_id=tax_mech.id,
            engineering_term="Hexagon Head Bolt",
            material_grade="SS304",
            standard_code="IS 1363",
            normalization_status="NORMALIZED"
        )

        # Material 3 (NTPC): Ball Valve 2 Inch (Piping)
        raw3 = RawMaterial(
            id=uuid.uuid4(),
            organization_id=org_c.id,
            source_system_id=sys_c.id,
            material_code="NTPC-V-901",
            material_description="BALL VALVE 2 INCH 150# FLANGED",
            uom="NOS"
        )
        norm3 = NormalizedMaterial(
            id=uuid.uuid4(),
            raw_material_id=raw3.id,
            organization_id=org_c.id,
            canonical_description="Ball Valve, 2 Inch, 150# Class, Flanged Ends",
            normalized_uom="EA",
            taxonomy_id=tax_pipe.id,
            engineering_term="Ball Valve",
            normalization_status="NORMALIZED"
        )
        session.add_all([raw1, norm1, raw2, norm2, raw3, norm3])
        await session.flush()

        # Similarity Match: Norm 1 <-> Norm 2
        match1 = MaterialSimilarityMatch(
            id=uuid.uuid4(),
            source_material_id=norm1.id,
            target_material_id=norm2.id,
            match_type="EXACT_MATCH_CANDIDATE",
            composite_confidence=0.98,
            lexical_score=0.95,
            attribute_score=1.0,
            match_explanation="Identical specifications and grade",
            recommendation_status="PROPOSED"
        )
        session.add(match1)

        # CNMC Master and Cross-Walk Mapping for Material 1
        master1 = CNMCMaster(
            id=uuid.uuid4(),
            cnmc_code="IN-IND-MECH-BLT-00492",
            canonical_name="Hexagon Head Bolt M16x50 SS304 (IS 1363)",
            standard_description="MVP Prototype Master Specification: Hex Bolt M16x50 SS304",
            taxonomy_id=tax_mech.id,
            status="ACTIVE"
        )
        session.add(master1)
        await session.flush()

        mapping1 = CPSECNMCMapping(
            id=uuid.uuid4(),
            raw_material_id=raw1.id,
            normalized_material_id=norm1.id,
            organization_id=org_a.id,
            local_material_code=raw1.material_code,
            cnmc_id=master1.id,
            mapping_type="DIRECT_MATCH",
            status="ACTIVE",
            approved_by="domain_reviewer_01"
        )
        session.add(mapping1)

        # Candidate proposal
        cand1 = CNMCCandidate(
            id=uuid.uuid4(),
            proposed_cnmc="IN-IND-MECH-BLT-00492",
            candidate_group_name="Hex Bolt SS304 M16x50",
            proposed_description="Proposed prototype CNMC",
            confidence_score=0.95,
            recommendation_explanation="{}",
            generation_source="ENGINE_V1_TAXONOMY_RULE_BASED",
            status="APPROVED"
        )
        cand2 = CNMCCandidate(
            id=uuid.uuid4(),
            proposed_cnmc="IN-IND-PIPG-VLV-00120",
            candidate_group_name="Ball Valve 2 Inch",
            proposed_description="Proposed prototype valve CNMC",
            confidence_score=0.88,
            recommendation_explanation="{}",
            generation_source="ENGINE_V1_TAXONOMY_RULE_BASED",
            status="PENDING_REVIEW"
        )
        session.add_all([cand1, cand2])

        await session.commit()
        yield session

    await engine.dispose()


# Test 1: National dashboard aggregation
@pytest.mark.asyncio
async def test_national_dashboard_aggregation(analytics_db: AsyncSession):
    service = NationalDashboardService(analytics_db)
    summary = await service.get_dashboard_summary()

    kpis = summary["kpis"]
    assert kpis["total_materials_ingested"] == 3
    assert kpis["total_normalized_materials"] == 3
    assert kpis["total_participating_cpses"] == 3
    assert kpis["exact_duplicate_candidates"] == 1
    assert kpis["approved_cnmc_records"] == 1
    assert kpis["pending_governance_reviews"] == 1
    assert kpis["cpse_legacy_codes_mapped"] == 1
    assert summary["macro_metrics"]["cnmc_format_version"] == "MVP_CNMC_V1"
    assert "SYNTHETIC DEMONSTRATION INSIGHT" in summary["disclaimer"]


# Test 2: Duplicate cluster analytics
@pytest.mark.asyncio
async def test_duplicate_cluster_analytics(analytics_db: AsyncSession):
    service = DuplicateAnalyticsService(analytics_db)
    summary = await service.get_duplicate_summary()
    assert summary["duplicate_classifications"]["exact_duplicates"] == 1

    clusters = await service.get_duplicate_clusters(limit=10)
    assert len(clusters) == 1
    assert clusters[0]["participating_cpse_count"] == 2
    assert "IOCL" in clusters[0]["participating_cpses"]
    assert "ONGC" in clusters[0]["participating_cpses"]
    assert clusters[0]["members"][0]["local_material_code"] == "IOCL-B-101"


# Test 3: Cross-CPSE overlap matrix
@pytest.mark.asyncio
async def test_cross_cpse_overlap_matrix(analytics_db: AsyncSession):
    service = CrossCPSEAnalyticsService(analytics_db)
    res = await service.get_cross_cpse_overlap_matrix()

    assert res["status"] == "COMPLETED"
    assert "IOCL" in res["organizations"]
    assert "ONGC" in res["organizations"]
    assert res["matrix"]["IOCL"]["ONGC"] == 1
    assert res["matrix"]["ONGC"]["IOCL"] == 1
    assert len(res["pair_details"]) >= 1
    assert res["pair_details"][0]["total_overlapping_materials"] == 1


# Test 4 & 5: Empty and insufficient data handling
@pytest.mark.asyncio
async def test_empty_and_insufficient_data():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    async with AsyncSessionLocal() as empty_session:
        # Empty dashboard
        dash_svc = NationalDashboardService(empty_session)
        summary = await dash_svc.get_dashboard_summary()
        assert summary["kpis"]["total_materials_ingested"] == 0
        assert summary["kpis"]["total_participating_cpses"] == 0

        # Insufficient data in overlap (< 2 orgs)
        overlap_svc = CrossCPSEAnalyticsService(empty_session)
        matrix_res = await overlap_svc.get_cross_cpse_overlap_matrix()
        assert matrix_res["status"] == "INSUFFICIENT_DATA"
        assert "INSUFFICIENT DATA" in matrix_res["message"]

    await engine.dispose()


# Test 6: CNMC summary metrics & conversion funnel
@pytest.mark.asyncio
async def test_cnmc_summary_and_funnel(analytics_db: AsyncSession):
    service = CNMCAnalyticsService(analytics_db)
    summary = await service.get_cnmc_summary()

    pipeline = summary["candidate_pipeline"]
    assert pipeline["total_candidates"] == 2
    assert pipeline["approved"] == 1
    assert pipeline["pending_review"] == 1
    assert summary["master_and_mappings"]["active_master_cnmcs"] == 1
    assert summary["master_and_mappings"]["active_crosswalk_mappings"] == 1
    assert len(summary["conversion_funnel"]) == 5


# Test 7 & 8: Procurement opportunity generation & synthetic data labeling
@pytest.mark.asyncio
async def test_procurement_opportunity_generation(analytics_db: AsyncSession):
    service = ProcurementOpportunityService(analytics_db)
    opps = await service.get_procurement_opportunities()

    assert len(opps) >= 1
    opp = opps[0]
    assert opp["opportunity_type"] == "CROSS_CPSE_DEMAND_AGGREGATION"
    assert opp["priority_level"] == "HIGH"
    assert opp["participating_cpse_count"] == 2
    assert "ILLUSTRATIVE PROCUREMENT OPPORTUNITY" in opp["disclaimer"]
    assert "demand aggregation" in opp["recommendation"]


# Test 9 & 10: Rationalization priority scoring formula & explanation
@pytest.mark.asyncio
async def test_rationalization_priority_scoring(analytics_db: AsyncSession):
    service = RationalizationPriorityService(analytics_db)
    priorities = await service.get_rationalization_priorities()

    assert len(priorities) >= 1
    p = priorities[0]
    assert p["priority_score"] >= 50.0
    assert p["priority_level"] in ("HIGH", "MEDIUM")
    assert p["scoring_methodology"] == "DETERMINISTIC_RATIONALIZATION_SCORE_V1"
    assert "Score:" in p["explanation_rationale"]
    assert "spans 2 CPSE(s)" in p["explanation_rationale"]


# Test 11: Sensitive Layer 1 data exclusion
@pytest.mark.asyncio
async def test_sensitive_layer1_data_exclusion_in_analytics(analytics_db: AsyncSession):
    dup_svc = DuplicateAnalyticsService(analytics_db)
    clusters = await dup_svc.get_duplicate_clusters()
    assert len(clusters) > 0

    cluster_json = str(clusters)
    assert "PO-SECRET" not in cluster_json
    assert "Secret Vendor" not in cluster_json
    assert "50.0" not in cluster_json  # price


# Test 12, 13, 14: API Validation, Pagination, and Filtering
@pytest.mark.asyncio
async def test_analytics_api_endpoints_and_pagination(analytics_db: AsyncSession):
    from app.main import app
    from app.db.session import get_db
    from httpx import AsyncClient, ASGITransport

    async def override_get_db():
        yield analytics_db

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # GET /api/v1/analytics/dashboard
        res_dash = await client.get("/api/v1/analytics/dashboard")
        assert res_dash.status_code == 200
        assert res_dash.json()["kpis"]["total_materials_ingested"] == 3

        # GET /api/v1/analytics/duplicates
        res_dup = await client.get("/api/v1/analytics/duplicates")
        assert res_dup.status_code == 200
        assert res_dup.json()["duplicate_classifications"]["exact_duplicates"] == 1

        # GET /api/v1/analytics/duplicates/clusters with pagination
        res_clust = await client.get("/api/v1/analytics/duplicates/clusters?limit=1&offset=0")
        assert res_clust.status_code == 200
        assert len(res_clust.json()) == 1

        # GET /api/v1/analytics/cross-cpse-overlap
        res_mat = await client.get("/api/v1/analytics/cross-cpse-overlap")
        assert res_mat.status_code == 200
        assert res_mat.json()["status"] == "COMPLETED"

        # GET /api/v1/analytics/cnmc-summary
        res_cnmc = await client.get("/api/v1/analytics/cnmc-summary")
        assert res_cnmc.status_code == 200
        assert res_cnmc.json()["candidate_pipeline"]["total_candidates"] == 2

        # GET /api/v1/analytics/procurement-opportunities with filter
        res_opp = await client.get("/api/v1/analytics/procurement-opportunities?priority=HIGH")
        assert res_opp.status_code == 200
        assert isinstance(res_opp.json(), list)

        # GET /api/v1/analytics/rationalization-priorities
        res_prio = await client.get("/api/v1/analytics/rationalization-priorities")
        assert res_prio.status_code == 200
        assert len(res_prio.json()) >= 1

        # GET /api/v1/analytics/categories
        res_cat = await client.get("/api/v1/analytics/categories")
        assert res_cat.status_code == 200
        assert len(res_cat.json()) >= 2

    app.dependency_overrides.clear()


# Test 15: Category Analytics & Drilldown
@pytest.mark.asyncio
async def test_category_analytics_and_drilldown(analytics_db: AsyncSession):
    service = CategoryAnalyticsService(analytics_db)
    cats = await service.get_category_analytics()
    assert len(cats) >= 2

    mech_cat = next((c for c in cats if "BLT" in c["category_code"]), None)
    assert mech_cat is not None
    assert mech_cat["total_materials"] == 2
    assert mech_cat["duplicate_candidates"] == 1

    drilldown = await service.get_category_detail(uuid.UUID(mech_cat["category_id"]))
    assert drilldown is not None
    assert len(drilldown["materials_sample"]) == 2
