"""
Repeatable Seed Data Script for Phase 5 Database Foundation
AI-Powered National Unified Material Master Framework (SIH 2026)

DISCLAIMER:
All organization names, material descriptions, and codes in this script are
fictional/synthetic demonstration data created strictly for SIH 2026 evaluation.
They do not represent real internal proprietary CPSE databases.
"""
import sys
import os
import asyncio
import uuid
from datetime import datetime, timezone
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

# Ensure backend directory is in sys.path
BASE_DIR = os.path.realpath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.db.session import AsyncSessionLocal
from app.models.organization import Organization, SourceSystem
from app.models.taxonomy import MaterialTaxonomy
from app.models.material import (
    RawMaterial,
    NormalizedMaterial,
    MaterialAttribute,
    MaterialEmbedding,
)
from app.models.standards import StandardsEquivalence
from app.models.matching import MaterialSimilarityMatch
from app.models.cnmc import CNMCCandidate, CNMCMaster, CPSECNMCMapping
from app.models.governance import GovernanceReview, AuditLog


async def seed_data(session: AsyncSession) -> dict:
    print("[1/8] Checking existing seed data...")
    # Check if organizations already exist
    res = await session.execute(select(Organization).where(Organization.code == "IOCL"))
    if res.scalars().first():
        print("  -> Data already seeded. Running in idempotent update mode.")

    # 1. Seed 10 Major Sector CPSE Organizations
    print("[2/8] Seeding 10 Major Sector CPSE Demonstration Organizations...")
    orgs_data = [
        {"code": "IOCL", "name": "Indian Oil Corporation Limited", "short_name": "IndianOil", "sector": "Oil & Gas", "type": "MAHARATNA", "source": "FUTURE_SAP_CONNECTOR"},
        {"code": "ONGC", "name": "Oil and Natural Gas Corporation", "short_name": "ONGC", "sector": "Oil & Gas", "type": "MAHARATNA", "source": "FUTURE_SAP_CONNECTOR"},
        {"code": "GAIL", "name": "GAIL (India) Limited", "short_name": "GAIL", "sector": "Gas Transmission & Petrochemicals", "type": "MAHARATNA", "source": "FUTURE_SAP_CONNECTOR"},
        {"code": "NTPC", "name": "NTPC Limited", "short_name": "NTPC", "sector": "Power Generation", "type": "MAHARATNA", "source": "FUTURE_ERP_API"},
        {"code": "PGCIL", "name": "Power Grid Corporation of India Limited", "short_name": "POWERGRID", "sector": "Power Transmission", "type": "MAHARATNA", "source": "FUTURE_SAP_CONNECTOR"},
        {"code": "SAIL", "name": "Steel Authority of India Limited", "short_name": "SAIL", "sector": "Steel Manufacturing", "type": "MAHARATNA", "source": "MANUAL_XLSX_UPLOAD"},
        {"code": "CIL", "name": "Coal India Limited", "short_name": "Coal India", "sector": "Coal & Mining", "type": "MAHARATNA", "source": "MANUAL_CSV_UPLOAD"},
        {"code": "BHEL", "name": "Bharat Heavy Electricals Limited", "short_name": "BHEL", "sector": "Heavy Engineering & Power Equipment", "type": "MAHARATNA", "source": "MANUAL_CSV_UPLOAD"},
        {"code": "NMDC", "name": "NMDC Limited", "short_name": "NMDC", "sector": "Metals & Mining", "type": "NAVRATNA", "source": "MANUAL_CSV_UPLOAD"},
        {"code": "BEL", "name": "Bharat Electronics Limited", "short_name": "BEL", "sector": "Defence Electronics & Manufacturing", "type": "NAVRATNA", "source": "FUTURE_ERP_API"},
    ]
    org_map = {}
    for o in orgs_data:
        existing = (await session.execute(select(Organization).where(Organization.code == o["code"]))).scalars().first()
        if not existing:
            org = Organization(
                id=uuid.uuid4(),
                code=o["code"],
                name=o["name"],
                short_name=o["short_name"],
                sector=o["sector"],
                organization_type=o["type"],
                onboarding_status="ONBOARDED_ACTIVE",
                demo_status="DEMONSTRATION_PROFILE",
                data_source_type=o["source"],
                status="ACTIVE"
            )
            session.add(org)
            org_map[o["code"]] = org
        else:
            org_map[o["code"]] = existing
    await session.flush()

    # 2. Seed Source Systems for each CPSE
    print("[3/8] Seeding CPSE Source Systems...")
    systems_data = [
        {"org": "IOCL", "name": "IOCL Refinery SAP S/4HANA MM", "type": "SAP"},
        {"org": "ONGC", "name": "ONGC Exploration SAP ECC", "type": "SAP"},
        {"org": "GAIL", "name": "GAIL Gas Pipeline SAP System", "type": "SAP"},
        {"org": "NTPC", "name": "NTPC Power Generation Oracle ERP", "type": "ORACLE"},
        {"org": "PGCIL", "name": "POWERGRID Transmission SAP MM", "type": "SAP"},
        {"org": "SAIL", "name": "SAIL Plant Logistics SAP ERP", "type": "SAP"},
        {"org": "CIL", "name": "CIL Mine Asset Management System", "type": "LEGACY_ERP"},
        {"org": "BHEL", "name": "BHEL Central Manufacturing Catalog", "type": "CSV_IMPORT"},
        {"org": "NMDC", "name": "NMDC Mining Equipment Catalog", "type": "CSV_IMPORT"},
        {"org": "BEL", "name": "BEL Defence Electronics Inventory ERP", "type": "ORACLE"},
    ]
    sys_map = {}
    for s in systems_data:
        org_obj = org_map[s["org"]]
        existing = (await session.execute(select(SourceSystem).where(
            SourceSystem.organization_id == org_obj.id,
            SourceSystem.name == s["name"]
        ))).scalars().first()
        if not existing:
            sys_item = SourceSystem(
                id=uuid.uuid4(),
                organization_id=org_obj.id,
                name=s["name"],
                system_type=s["type"],
                is_active=True
            )
            session.add(sys_item)
            sys_map[s["org"]] = sys_item
        else:
            sys_map[s["org"]] = existing
    await session.flush()

    # 3. Seed Multi-Level Material Taxonomy
    print("[4/8] Seeding Hierarchical Material Taxonomy...")
    # Level 1 Root
    tax_root = (await session.execute(select(MaterialTaxonomy).where(MaterialTaxonomy.code == "IND-MAT"))).scalars().first()
    if not tax_root:
        tax_root = MaterialTaxonomy(
            id=uuid.uuid4(),
            code="IND-MAT",
            name="Industrial Materials & Equipment",
            parent_id=None,
            level=1,
            path="Industrial Materials & Equipment"
        )
        session.add(tax_root)
        await session.flush()

    # Level 2 Groups
    tax_mech = (await session.execute(select(MaterialTaxonomy).where(MaterialTaxonomy.code == "IND-MECH"))).scalars().first()
    if not tax_mech:
        tax_mech = MaterialTaxonomy(
            id=uuid.uuid4(),
            code="IND-MECH",
            name="Mechanical Components",
            parent_id=tax_root.id,
            level=2,
            path="Industrial Materials & Equipment / Mechanical Components"
        )
        session.add(tax_mech)
        await session.flush()

    tax_elec = (await session.execute(select(MaterialTaxonomy).where(MaterialTaxonomy.code == "IND-ELEC"))).scalars().first()
    if not tax_elec:
        tax_elec = MaterialTaxonomy(
            id=uuid.uuid4(),
            code="IND-ELEC",
            name="Electrical Equipment",
            parent_id=tax_root.id,
            level=2,
            path="Industrial Materials & Equipment / Electrical Equipment"
        )
        session.add(tax_elec)
        await session.flush()

    tax_chem = (await session.execute(select(MaterialTaxonomy).where(MaterialTaxonomy.code == "IND-CHEM"))).scalars().first()
    if not tax_chem:
        tax_chem = MaterialTaxonomy(
            id=uuid.uuid4(),
            code="IND-CHEM",
            name="Industrial Chemicals & Lubricants",
            parent_id=tax_root.id,
            level=2,
            path="Industrial Materials & Equipment / Industrial Chemicals & Lubricants"
        )
        session.add(tax_chem)
        await session.flush()

    # Level 3 Families
    tax_fast = (await session.execute(select(MaterialTaxonomy).where(MaterialTaxonomy.code == "IND-MECH-FAST"))).scalars().first()
    if not tax_fast:
        tax_fast = MaterialTaxonomy(
            id=uuid.uuid4(),
            code="IND-MECH-FAST",
            name="Industrial Fasteners",
            parent_id=tax_mech.id,
            level=3,
            path="Industrial Materials & Equipment / Mechanical Components / Industrial Fasteners"
        )
        session.add(tax_fast)
        await session.flush()

    tax_valv = (await session.execute(select(MaterialTaxonomy).where(MaterialTaxonomy.code == "IND-MECH-VALV"))).scalars().first()
    if not tax_valv:
        tax_valv = MaterialTaxonomy(
            id=uuid.uuid4(),
            code="IND-MECH-VALV",
            name="Industrial Valves",
            parent_id=tax_mech.id,
            level=3,
            path="Industrial Materials & Equipment / Mechanical Components / Industrial Valves"
        )
        session.add(tax_valv)
        await session.flush()

    # Level 4 Classes (Terminal Categories)
    tax_bolt = (await session.execute(select(MaterialTaxonomy).where(MaterialTaxonomy.code == "IND-MECH-FAST-BLT"))).scalars().first()
    if not tax_bolt:
        tax_bolt = MaterialTaxonomy(
            id=uuid.uuid4(),
            code="IND-MECH-FAST-BLT",
            name="Hexagon Head Bolts & Studs",
            parent_id=tax_fast.id,
            level=4,
            path="Industrial Materials & Equipment / Mechanical Components / Industrial Fasteners / Hexagon Head Bolts & Studs"
        )
        session.add(tax_bolt)
        await session.flush()

    tax_ball_valv = (await session.execute(select(MaterialTaxonomy).where(MaterialTaxonomy.code == "IND-MECH-VALV-BAL"))).scalars().first()
    if not tax_ball_valv:
        tax_ball_valv = MaterialTaxonomy(
            id=uuid.uuid4(),
            code="IND-MECH-VALV-BAL",
            name="Ball Valves (Flanged / Threaded)",
            parent_id=tax_valv.id,
            level=4,
            path="Industrial Materials & Equipment / Mechanical Components / Industrial Valves / Ball Valves (Flanged / Threaded)"
        )
        session.add(tax_ball_valv)
        await session.flush()

    # 4. Seed Standards Equivalence Table
    print("[5/8] Seeding Engineering Standards Equivalence Table...")
    standards_data = [
        {
            "src": "IS 1363",
            "tgt": "ISO 4016",
            "type": "VERIFIED_EQUIVALENT",
            "notes": "Hexagon head bolts, screws and nuts of product grade C - Metric series.",
            "reviewer_req": False,
            "status": "VERIFIED",
            "verifier": "Chief Domain Engineer (Standardization Committee)"
        },
        {
            "src": "DIN 933",
            "tgt": "ISO 4017",
            "type": "VERIFIED_EQUIVALENT",
            "notes": "Hexagon head screws fully threaded - Metric pitch.",
            "reviewer_req": False,
            "status": "VERIFIED",
            "verifier": "National Technical Secretariat"
        },
        {
            "src": "ASTM A193 B7",
            "tgt": "EN 10269",
            "type": "POSSIBLE_EQUIVALENT",
            "notes": "High tensile alloy steel bolting for pressure vessels. Requires Charpy V-notch impact verification at sub-zero service temperatures.",
            "reviewer_req": True,
            "status": "DRAFT",
            "verifier": None
        },
        {
            "src": "IS 1239",
            "tgt": "ASTM A53",
            "type": "REQUIRES_DOMAIN_REVIEW",
            "notes": "Mild steel tubes and tubulars vs. seamless/welded carbon steel pipe. Pressure ratings differ across Schedule 40 vs Heavy class.",
            "reviewer_req": True,
            "status": "DRAFT",
            "verifier": None
        },
        {
            "src": "IS 1363",
            "tgt": "ASTM A325",
            "type": "NOT_EQUIVALENT",
            "notes": "ASTM A325 is a structural high-strength fastener with heavy hex geometry and specific preload requirements not interchangeable with IS 1363 grade C fasteners.",
            "reviewer_req": False,
            "status": "VERIFIED",
            "verifier": "Domain Reviewer (Mechanical Expert)"
        }
    ]
    for std in standards_data:
        existing_std = (await session.execute(select(StandardsEquivalence).where(
            StandardsEquivalence.source_standard == std["src"],
            StandardsEquivalence.target_standard == std["tgt"]
        ))).scalars().first()
        if not existing_std:
            session.add(StandardsEquivalence(
                id=uuid.uuid4(),
                source_standard=std["src"],
                target_standard=std["tgt"],
                equivalence_type=std["type"],
                comparison_notes=std["notes"],
                domain_reviewer_required=std["reviewer_req"],
                verification_status=std["status"],
                verified_by=std["verifier"]
            ))
    await session.flush()

    # 5. Seed Multi-CPSE Raw & Normalized Materials
    print("[6/8] Seeding Multi-CPSE Raw & Normalized Material Records...")
    materials_specs = [
        # Cluster 1: Bolt M16x50 SS304
        {
            "org": "IOCL",
            "code": "IOCL-BOLT-001",
            "raw_desc": "HEX BOLT M16 X 50 MM SS304",
            "raw_uom": "NOS",
            "canon_desc": "Hexagon Head Bolt, M16 x 50 mm, Grade SS304 (IS 1363 / ISO 4016)",
            "uom": "EA",
            "tax": tax_bolt.id,
            "term": "Hexagon Head Bolt",
            "std": "IS 1363",
            "grade": "SS304",
            "private_payload": {"po_number": "PO-IOCL-2024-884", "unit_cost_inr": 48.50, "store_bin": "BIN-REF-A12"},
            "attrs": [
                {"name": "diameter", "orig": "16MM", "norm": "16.0", "unit": "mm", "type": "NUMERIC"},
                {"name": "length", "orig": "50 MM", "norm": "50.0", "unit": "mm", "type": "NUMERIC"},
                {"name": "material_grade", "orig": "SS304", "norm": "SS304", "unit": None, "type": "STRING"},
                {"name": "thread_pitch", "orig": "M16", "norm": "2.0", "unit": "mm", "type": "NUMERIC"}
            ]
        },
        {
            "org": "NTPC",
            "code": "NTPC-MECH-7842",
            "raw_desc": "STAINLESS STEEL HEXAGON HEAD BOLT 16MM DIA 50MM LENGTH SS 304",
            "raw_uom": "EA",
            "canon_desc": "Hexagon Head Bolt, M16 x 50 mm, Grade SS304 (IS 1363 / ISO 4016)",
            "uom": "EA",
            "tax": tax_bolt.id,
            "term": "Hexagon Head Bolt",
            "std": "ISO 4016",
            "grade": "SS304",
            "private_payload": {"po_number": "NTPC-PO-99120", "unit_cost_inr": 54.00, "plant_code": "PLANT-RIHAND"},
            "attrs": [
                {"name": "diameter", "orig": "16MM DIA", "norm": "16.0", "unit": "mm", "type": "NUMERIC"},
                {"name": "length", "orig": "50MM LENGTH", "norm": "50.0", "unit": "mm", "type": "NUMERIC"},
                {"name": "material_grade", "orig": "SS 304", "norm": "SS304", "unit": None, "type": "STRING"},
                {"name": "head_type", "orig": "HEXAGON HEAD", "norm": "HEXAGON", "unit": None, "type": "STRING"}
            ]
        },
        {
            "org": "SAIL",
            "code": "SAIL-FAST-219",
            "raw_desc": "BOLT HEX M16X50 A2-70 SS",
            "raw_uom": "SET",
            "canon_desc": "Hexagon Head Bolt, M16 x 50 mm, Grade A2-70 Stainless Steel (ISO 4016)",
            "uom": "EA",
            "tax": tax_bolt.id,
            "term": "Hexagon Head Bolt",
            "std": "ISO 4016",
            "grade": "A2-70",
            "private_payload": {"po_number": "SAIL-BSP-4491", "unit_cost_inr": 51.20, "store_bin": "BSP-STOR-09"},
            "attrs": [
                {"name": "diameter", "orig": "M16", "norm": "16.0", "unit": "mm", "type": "NUMERIC"},
                {"name": "length", "orig": "50", "norm": "50.0", "unit": "mm", "type": "NUMERIC"},
                {"name": "material_grade", "orig": "A2-70", "norm": "A2-70 (SS304 Equiv)", "unit": None, "type": "STRING"}
            ]
        },
        # Cluster 2: Ball Valve 2" Class 300
        {
            "org": "IOCL",
            "code": "IOCL-VALV-302",
            "raw_desc": "2 INCH BALL VALVE CL300 FLANGED ASTM A216 WCB",
            "raw_uom": "NOS",
            "canon_desc": "Ball Valve, 2 Inch (50mm NB), ASME Class 300, Body: ASTM A216 WCB, Raised Face Flanged",
            "uom": "EA",
            "tax": tax_ball_valv.id,
            "term": "Ball Valve",
            "std": "ASME B16.34",
            "grade": "ASTM A216 WCB",
            "private_payload": {"po_number": "IOCL-MATHURA-VLV-112", "unit_cost_inr": 18500.00},
            "attrs": [
                {"name": "nominal_size", "orig": "2 INCH", "norm": "50.0", "unit": "mm", "type": "NUMERIC"},
                {"name": "pressure_class", "orig": "CL300", "norm": "300", "unit": "class", "type": "NUMERIC"},
                {"name": "body_material", "orig": "ASTM A216 WCB", "norm": "ASTM A216 WCB", "unit": None, "type": "STRING"}
            ]
        },
        {
            "org": "BHEL",
            "code": "BHEL-VLV-991",
            "raw_desc": "BALL VALVE 50MM NB ASME B16.34 CLASS 300 WCB RF FLANGED",
            "raw_uom": "EA",
            "canon_desc": "Ball Valve, 50mm NB (2 Inch), ASME Class 300, Body: ASTM A216 WCB, Raised Face Flanged",
            "uom": "EA",
            "tax": tax_ball_valv.id,
            "term": "Ball Valve",
            "std": "ASME B16.34",
            "grade": "WCB",
            "private_payload": {"po_number": "BHEL-TRICHY-PO-7721", "unit_cost_inr": 17900.00},
            "attrs": [
                {"name": "nominal_size", "orig": "50MM NB", "norm": "50.0", "unit": "mm", "type": "NUMERIC"},
                {"name": "pressure_class", "orig": "CLASS 300", "norm": "300", "unit": "class", "type": "NUMERIC"},
                {"name": "body_material", "orig": "WCB", "norm": "ASTM A216 WCB", "unit": None, "type": "STRING"}
            ]
        }
    ]

    mat_records = {}
    for item in materials_specs:
        org_obj = org_map[item["org"]]
        sys_obj = sys_map[item["org"]]
        
        # Check raw material
        raw = (await session.execute(select(RawMaterial).where(
            RawMaterial.organization_id == org_obj.id,
            RawMaterial.material_code == item["code"]
        ))).scalars().first()

        if not raw:
            raw = RawMaterial(
                id=uuid.uuid4(),
                organization_id=org_obj.id,
                source_system_id=sys_obj.id,
                material_code=item["code"],
                material_description=item["raw_desc"],
                uom=item["raw_uom"],
                source_payload=item["private_payload"],
                status="NORMALIZED"
            )
            session.add(raw)
            await session.flush()

        # Check normalized material
        norm = (await session.execute(select(NormalizedMaterial).where(
            NormalizedMaterial.raw_material_id == raw.id
        ))).scalars().first()

        if not norm:
            norm = NormalizedMaterial(
                id=uuid.uuid4(),
                raw_material_id=raw.id,
                organization_id=org_obj.id,
                canonical_description=item["canon_desc"],
                normalized_uom=item["uom"],
                taxonomy_id=item["tax"],
                engineering_term=item["term"],
                standard_code=item["std"],
                material_grade=item["grade"],
                normalization_status="NORMALIZED",
                confidence_score=0.98
            )
            session.add(norm)
            await session.flush()

            # Seed attributes
            for attr in item["attrs"]:
                session.add(MaterialAttribute(
                    id=uuid.uuid4(),
                    normalized_material_id=norm.id,
                    attribute_name=attr["name"],
                    original_value=attr["orig"],
                    normalized_value=attr["norm"],
                    normalized_unit=attr["unit"],
                    data_type=attr["type"],
                    source="RULE_EXTRACTOR",
                    confidence=0.99
                ))

        mat_records[item["code"]] = {"raw": raw, "norm": norm}
    await session.flush()

    # 6. Seed Synthetic Demonstration Match Records
    # DISCLAIMER: Manually seeded demonstration values used to validate database schema
    # and future workflow visualization. These values were NOT generated by a live AI model or embedding pipeline.
    print("[7/8] Seeding Synthetic Demonstration Match Records (Non-AI Manual Baseline)...")
    match_data = [
        {
            "src": "IOCL-BOLT-001",
            "tgt": "NTPC-MECH-7842",
            "type": "EXACT_DUPLICATE",
            "lex": 0.92,
            "vec": 0.97,
            "attr": 1.00,
            "comp": 0.98,
            "exp": "SYNTHETIC DEMONSTRATION MATCH DATA: Identical M16 diameter, 50mm length, SS304 metallurgy, and IS 1363 / ISO 4016 standard.",
            "diff": {"diameter_match": "16mm == 16mm", "length_match": "50mm == 50mm", "grade_match": "SS304 == SS304"},
            "status": "ACCEPTED"
        },
        {
            "src": "IOCL-BOLT-001",
            "tgt": "SAIL-FAST-219",
            "type": "NEAR_DUPLICATE",
            "lex": 0.88,
            "vec": 0.93,
            "attr": 0.96,
            "comp": 0.94,
            "exp": "SYNTHETIC DEMONSTRATION MATCH DATA: Identical M16x50 dimensions. Grade A2-70 is the ISO designation for austenitic stainless steel functionally interchangeable with SS304.",
            "diff": {"diameter_match": "16mm == 16mm", "grade_comparison": "SS304 (AISI) ~ A2-70 (ISO 3506)"},
            "status": "ACCEPTED"
        },
        {
            "src": "IOCL-VALV-302",
            "tgt": "BHEL-VLV-991",
            "type": "FUNCTIONALLY_EQUIVALENT",
            "lex": 0.76,
            "vec": 0.89,
            "attr": 0.98,
            "comp": 0.91,
            "exp": "SYNTHETIC DEMONSTRATION MATCH DATA: Both valves are 2-inch (50mm NB) ASME Class 300 flanged ball valves constructed with ASTM A216 WCB carbon steel cast bodies.",
            "diff": {"size": "2 INCH == 50mm NB", "rating": "CL300 == CLASS 300", "body": "ASTM A216 WCB == WCB"},
            "status": "PROPOSED"
        }
    ]

    for m in match_data:
        src_norm = mat_records[m["src"]]["norm"]
        tgt_norm = mat_records[m["tgt"]]["norm"]

        existing_match = (await session.execute(select(MaterialSimilarityMatch).where(
            MaterialSimilarityMatch.source_material_id == src_norm.id,
            MaterialSimilarityMatch.target_material_id == tgt_norm.id
        ))).scalars().first()

        if not existing_match:
            session.add(MaterialSimilarityMatch(
                id=uuid.uuid4(),
                source_material_id=src_norm.id,
                target_material_id=tgt_norm.id,
                match_type=m["type"],
                lexical_score=m["lex"],
                vector_score=m["vec"],
                attribute_score=m["attr"],
                composite_confidence=m["comp"],
                methodology="MANUAL_SYNTHETIC_DEMO_V1",
                match_explanation=m["exp"],
                specification_diff=m["diff"],
                recommendation_status=m["status"],
                ai_model_version="manual-demo-seed"
            ))
    await session.flush()

    # 7. Complete Demonstration Chain: Candidate -> Review -> Approved CNMC -> Crosswalk Mappings -> Audit
    print("[8/8] Seeding Complete Demonstration Chain (Candidate -> Review -> CNMC Master -> Mappings)...")
    
    # A. CNMC Candidate Recommendation (Synthetic Demonstration Data)
    cand_code = "IN-IND-MECH-BLT-00492"
    cand = (await session.execute(select(CNMCCandidate).where(
        CNMCCandidate.proposed_cnmc == cand_code
    ))).scalars().first()

    if not cand:
        cand = CNMCCandidate(
            id=uuid.uuid4(),
            proposed_cnmc=cand_code,
            candidate_group_name="Hex Head Bolt M16x50 SS304 / A2-70",
            proposed_description="MVP Prototype CNMC Reference Format: Hexagon Head Bolt, M16 x 50 mm, Austenitic Stainless Steel Grade SS304 / A2-70, Metric Coarse Thread",
            taxonomy_id=tax_bolt.id,
            confidence_score=0.98,
            recommendation_explanation="Synthetic demonstration CNMC recommendation seeded to validate the future recommendation and governance workflow across 3 CPSEs (IOCL, NTPC, SAIL).",
            generation_source="MANUAL_PROPOSAL",
            status="APPROVED"
        )
        session.add(cand)
        await session.flush()

    # B. Approved CNMC Master Record (MVP Prototype Reference Format)
    cnmc = (await session.execute(select(CNMCMaster).where(
        CNMCMaster.cnmc_code == cand_code
    ))).scalars().first()

    if not cnmc:
        cnmc = CNMCMaster(
            id=uuid.uuid4(),
            cnmc_code=cand_code,
            canonical_name="Hexagon Head Bolt M16 x 50 mm SS304 / A2-70 (MVP Prototype)",
            standard_description="MVP Prototype CNMC Reference Format: Hexagon Head Bolt M16x50 conforming to IS 1363 / ISO 4016 in Grade SS304 / A2-70 (SIH Demonstration Catalog).",
            taxonomy_id=tax_bolt.id,
            spec_template={
                "standard": "IS 1363 / ISO 4016",
                "diameter_mm": 16.0,
                "length_mm": 50.0,
                "thread_type": "Metric Coarse (M16x2.0)",
                "material_grade": "SS304 / A2-70",
                "tensile_strength_mpa": 700
            },
            status="ACTIVE",
            governance_metadata={
                "approval_reference": "SIH-2026-DEMO-MECH-DEC-0492",
                "approval_workflow": "SIH MVP Demonstration Governance Workflow",
                "approval_scope": "Application-level demonstration approval (Non-government / Prototype)",
                "approval_date": "2026-09-08T00:00:00Z"
            }
        )
        session.add(cnmc)
        await session.flush()

    # C. Governance Review Record (Demonstration Workflow Sign-off)
    rev = (await session.execute(select(GovernanceReview).where(
        GovernanceReview.entity_id == cand.id
    ))).scalars().first()

    if not rev:
        session.add(GovernanceReview(
            id=uuid.uuid4(),
            entity_type="CNMC_CANDIDATE",
            entity_id=cand.id,
            reviewer_reference="demo_reviewer_ongc_01 (Demonstration Domain Reviewer)",
            decision="APPROVED",
            comments="Approved within the SIH MVP demonstration governance workflow: Verified specification consistency across IS 1363 and ISO 4016 standards within prototype boundaries.",
            previous_status="PENDING_REVIEW",
            new_status="APPROVED"
        ))

    # D. Active CPSE <-> CNMC Cross-walk Mappings (Preserving original CPSE codes!)
    bolt_mappings = [
        {"code": "IOCL-BOLT-001", "org": "IOCL", "type": "DIRECT_MATCH", "conf": 0.99},
        {"code": "NTPC-MECH-7842", "org": "NTPC", "type": "NORMALIZED_MATCH", "conf": 0.98},
        {"code": "SAIL-FAST-219", "org": "SAIL", "type": "NORMALIZED_MATCH", "conf": 0.96},
    ]

    for bmap in bolt_mappings:
        rec = mat_records[bmap["code"]]
        existing_map = (await session.execute(select(CPSECNMCMapping).where(
            CPSECNMCMapping.raw_material_id == rec["raw"].id,
            CPSECNMCMapping.cnmc_id == cnmc.id
        ))).scalars().first()


        if not existing_map:
            session.add(CPSECNMCMapping(
                id=uuid.uuid4(),
                raw_material_id=rec["raw"].id,
                normalized_material_id=rec["norm"].id,
                organization_id=org_map[bmap["org"]].id,
                local_material_code=bmap["code"],  # Preserved original code!
                cnmc_id=cnmc.id,
                mapping_type=bmap["type"],
                confidence_score=bmap["conf"],
                status="ACTIVE",
                approved_by="reviewer_ongc_mech_01",
                effective_from=datetime.now(timezone.utc)
            ))

    # E. Audit Log Trail
    audit_events = [
        ("ORGANIZATION", "IOCL", "CPSE_REGISTERED", "system_init"),
        ("TAXONOMY", "IND-MECH-FAST-BLT", "TAXONOMY_CREATED", "standardization_engine"),
        ("RAW_MATERIAL", "IOCL-BOLT-001", "RAW_IMPORTED", "batch_ingest_001"),
        ("NORMALIZED_MATERIAL", "IOCL-BOLT-001", "NORMALIZATION_COMPLETED", "nlp_engine_v1"),
        ("CNMC_CANDIDATE", cand_code, "CANDIDATE_RECOMMENDED", "ai_cluster_engine"),
        ("CNMC_MASTER", cand_code, "CNMC_APPROVED", "reviewer_ongc_mech_01"),
        ("CPSE_MAPPING", "IOCL-BOLT-001", "MAPPING_ACTIVATED", "reviewer_ongc_mech_01"),
    ]

    for entity_type, entity_id, action, actor in audit_events:
        session.add(AuditLog(
            id=uuid.uuid4(),
            entity_type=entity_type,
            entity_id=entity_id,
            action=action,
            actor_reference=actor,
            timestamp=datetime.now(timezone.utc),
            metadata_payload={"phase": "Phase 5 Demo Seed", "sih_evaluation_year": 2026}
        ))

    await session.commit()
    print("[SUCCESS] Phase 5 Seed Data successfully committed!")
    return {
        "organizations": len(orgs_data),
        "materials": len(materials_specs),
        "matches": len(match_data),
        "standards": len(standards_data),
        "cnmc_approved": 1,
        "mappings": len(bolt_mappings),
        "audit_logs": len(audit_events)
    }


async def main():
    async with AsyncSessionLocal() as session:
        result = await seed_data(session)
        print("Summary of Seeded Entities:", result)


if __name__ == "__main__":
    asyncio.run(main())
