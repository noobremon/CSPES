"""
CNMC Recommendation Engine Service.

Analyzes normalized material specifications, taxonomy nodes, and cross-CPSE similarity matches
to recommend either:
1. Reusing an existing governed prototype CNMC, or
2. Creating a new prototype CNMC candidate, or
3. Flagging insufficient data / domain review.

CRITICAL GOVERNANCE BOUNDARIES:
- Codification is strictly "MVP Prototype Reference Format".
- Zero automatic approval into Layer 3 CNMCMaster.
- All newly generated recommendations are assigned status "PENDING_REVIEW".
- Zero automatic merging of source ERP material codes.
- Confidence is labeled honestly as "recommendation_strength" and "match_evidence_score".
"""

import uuid
import json
from dataclasses import dataclass, field, asdict
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, desc

from app.models.material import NormalizedMaterial, RawMaterial, MaterialAttribute
from app.models.taxonomy import MaterialTaxonomy
from app.models.cnmc import CNMCCandidate, CNMCMaster, CPSECNMCMapping
from app.models.matching import MaterialSimilarityMatch
from app.services.matching.representation import (
    generate_canonical_signature,
    MaterialRepresentation,
)
from app.services.matching.hybrid_engine import load_representation_for_material
from app.services.cnmc.generator import (
    CNMCFormatVersion,
    generate_prototype_cnmc_code,
    derive_cnmc_elements_from_representation,
    deterministic_sequence_hash,
)
from app.services.governance.audit_service import record_audit_log


class RecommendationOutcome(str):
    REUSE_EXISTING_CNMC_CANDIDATE = "REUSE_EXISTING_CNMC_CANDIDATE"
    NEW_CNMC_CANDIDATE = "NEW_CNMC_CANDIDATE"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"
    REQUIRES_DOMAIN_REVIEW = "REQUIRES_DOMAIN_REVIEW"


class RecommendationStrength(str):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


@dataclass
class CNMCRecommendationExplanation:
    outcome: str
    recommendation_strength: str  # HIGH, MEDIUM, LOW
    generation_method: str  # TAXONOMY_RULE_BASED, HYBRID_MATCH_ASSISTED, EXISTING_CLUSTER_REUSE, INSUFFICIENT_DATA
    format_version: str = CNMCFormatVersion.MVP_CNMC_V1.value
    recommendation_reason: str = ""
    taxonomy_signals: Dict[str, Any] = field(default_factory=dict)
    matching_signals: Dict[str, Any] = field(default_factory=dict)
    existing_cluster_reference: Optional[str] = None
    existing_cnmc_id: Optional[str] = None
    warnings: List[str] = field(default_factory=list)
    missing_information: List[str] = field(default_factory=list)
    match_evidence_score: Optional[float] = None
    governance_notice: str = (
        "Recommended within the SIH MVP demonstration governance workflow. "
        "Does not constitute official Government of India national standard approval."
    )

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    def to_json(self) -> str:
        return json.dumps(self.to_dict(), indent=2)


@dataclass
class CNMCRecommendationResult:
    outcome: str
    proposed_cnmc: str
    candidate_group_name: str
    proposed_description: str
    taxonomy_id: Optional[uuid.UUID]
    recommendation_strength: str
    strength_score: float  # Internal numeric scale 0.0 - 1.0
    explanation: CNMCRecommendationExplanation
    is_existing_candidate: bool = False
    candidate_id: Optional[uuid.UUID] = None


class CNMCRecommendationService:
    """
    Core service responsible for analyzing normalized materials, evaluating match clusters,
    and generating structured CNMC recommendations with complete explainability.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def recommend_cnmc_for_material(
        self,
        material_id: uuid.UUID,
        persist_candidate: bool = True,
        actor_reference: str = "CNMC_RECOMMENDATION_ENGINE_V1"
    ) -> CNMCRecommendationResult:
        """
        Analyzes a single NormalizedMaterial, checks for existing reuse opportunities,
        or synthesizes a new prototype candidate, returning an explainable recommendation.
        """
        # 1. Load normalized material and its sanitized representation
        norm_mat = await self.db.get(NormalizedMaterial, material_id)
        if not norm_mat:
            raise ValueError(f"NormalizedMaterial with ID {material_id} not found.")

        rep = await load_representation_for_material(material_id, self.db)
        if not rep:
            raise ValueError(f"Failed to load material representation for {material_id}.")

        # Load taxonomy details if attached
        taxonomy = None
        if norm_mat.taxonomy_id:
            taxonomy = await self.db.get(MaterialTaxonomy, norm_mat.taxonomy_id)

        # 2. Check for Insufficient Data
        missing_fields = []
        if not rep.canonical_description or len(rep.canonical_description.strip()) < 5:
            missing_fields.append("canonical_description")
        if not rep.normalized_uom:
            missing_fields.append("uom")
        if not rep.technical_attributes and not rep.material_grade and not rep.standard_code:
            missing_fields.append("technical_specifications (attributes/grade/standard)")

        if len(missing_fields) >= 2 or "canonical_description" in missing_fields:
            expl = CNMCRecommendationExplanation(
                outcome=RecommendationOutcome.INSUFFICIENT_DATA,
                recommendation_strength=RecommendationStrength.LOW,
                generation_method="INSUFFICIENT_DATA",
                recommendation_reason="Material lacks essential descriptive or technical specifications for deterministic codification.",
                taxonomy_signals={"taxonomy_path": taxonomy.path if taxonomy else None},
                matching_signals={},
                missing_information=missing_fields,
                warnings=["Mandatory material attributes missing. Domain data enrichment required before CNMC assignment."]
            )
            return CNMCRecommendationResult(
                outcome=RecommendationOutcome.INSUFFICIENT_DATA,
                proposed_cnmc="IN-IND-GEN-UNCL-00000",
                candidate_group_name="Unclassified / Incomplete Specification",
                proposed_description=rep.canonical_description or "Incomplete Material Record",
                taxonomy_id=norm_mat.taxonomy_id,
                recommendation_strength=RecommendationStrength.LOW,
                strength_score=0.10,
                explanation=expl
            )

        # 3. Check for Existing Governed CNMC Reuse
        reuse_result = await self._check_existing_cnmc_reuse(material_id, rep, taxonomy)
        if reuse_result:
            if persist_candidate:
                cand_id, is_existing = await self._persist_or_get_candidate(reuse_result, actor_reference)
                reuse_result.candidate_id = cand_id
                reuse_result.is_existing_candidate = is_existing
            return reuse_result

        # 4. Generate New Prototype Candidate
        new_result = await self._generate_new_cnmc_candidate(material_id, rep, taxonomy)
        if persist_candidate:
            cand_id, is_existing = await self._persist_or_get_candidate(new_result, actor_reference)
            new_result.candidate_id = cand_id
            new_result.is_existing_candidate = is_existing

        return new_result

    async def _check_existing_cnmc_reuse(
        self,
        material_id: uuid.UUID,
        rep: MaterialRepresentation,
        taxonomy: Optional[MaterialTaxonomy]
    ) -> Optional[CNMCRecommendationResult]:
        """
        Evaluates whether an existing governed CNMCMaster record can be recommended for reuse,
        based on exact signature match or high-confidence similarity cluster with active mappings.
        """
        # Step A: Query existing candidate matches for this material
        stmt = (
            select(MaterialSimilarityMatch)
            .where(
                or_(
                    MaterialSimilarityMatch.source_material_id == material_id,
                    MaterialSimilarityMatch.target_material_id == material_id
                )
            )
            .order_by(desc(MaterialSimilarityMatch.composite_confidence))
        )
        res = await self.db.execute(stmt)
        matches = res.scalars().all()

        for match in matches:
            other_id = (
                match.target_material_id
                if match.source_material_id == material_id
                else match.source_material_id
            )
            # Check if other_id has an active CPSECNMCMapping
            map_stmt = (
                select(CPSECNMCMapping)
                .where(
                    CPSECNMCMapping.normalized_material_id == other_id,
                    CPSECNMCMapping.status == "ACTIVE"
                )
            )
            map_res = await self.db.execute(map_stmt)
            mapping = map_res.scalars().first()

            if mapping and match.composite_confidence >= 0.70:
                cnmc_master = await self.db.get(CNMCMaster, mapping.cnmc_id)
                if cnmc_master and cnmc_master.status == "ACTIVE":
                    # Strong candidate for reuse
                    strength = (
                        RecommendationStrength.HIGH
                        if match.composite_confidence >= 0.85
                        else RecommendationStrength.MEDIUM
                    )

                    expl = CNMCRecommendationExplanation(
                        outcome=RecommendationOutcome.REUSE_EXISTING_CNMC_CANDIDATE,
                        recommendation_strength=strength,
                        generation_method="EXISTING_CLUSTER_REUSE",
                        recommendation_reason=(
                            f"Matched existing governed cluster for CNMC '{cnmc_master.cnmc_code}' "
                            f"via material similarity match with {match.match_type} (score: {match.composite_confidence:.2f})."
                        ),
                        taxonomy_signals={
                            "taxonomy_id": str(cnmc_master.taxonomy_id) if cnmc_master.taxonomy_id else None,
                            "canonical_name": cnmc_master.canonical_name
                        },
                        matching_signals={
                            "matched_material_id": str(other_id),
                            "match_type": match.match_type,
                            "composite_confidence": match.composite_confidence,
                            "lexical_score": match.lexical_score,
                            "vector_score": match.vector_score,
                            "attribute_score": match.attribute_score,
                        },
                        existing_cluster_reference=cnmc_master.cnmc_code,
                        existing_cnmc_id=str(cnmc_master.id),
                        match_evidence_score=match.composite_confidence,
                        warnings=[
                            "Existing governed CNMC reuse is a prototype recommendation. "
                            "Requires domain reviewer validation before cross-walk mapping activation."
                        ]
                    )

                    return CNMCRecommendationResult(
                        outcome=RecommendationOutcome.REUSE_EXISTING_CNMC_CANDIDATE,
                        proposed_cnmc=cnmc_master.cnmc_code,
                        candidate_group_name=cnmc_master.canonical_name,
                        proposed_description=cnmc_master.standard_description,
                        taxonomy_id=cnmc_master.taxonomy_id or (taxonomy.id if taxonomy else None),
                        recommendation_strength=strength,
                        strength_score=match.composite_confidence,
                        explanation=expl
                    )

        # Step B: Check direct exact canonical name or spec_template match in CNMCMaster
        canonical_sig = rep.canonical_attribute_signature or rep.canonical_description
        master_stmt = select(CNMCMaster).where(CNMCMaster.status == "ACTIVE")
        master_res = await self.db.execute(master_stmt)
        masters = master_res.scalars().all()

        for m in masters:
            if m.canonical_name.strip().lower() == rep.canonical_description.strip().lower():
                expl = CNMCRecommendationExplanation(
                    outcome=RecommendationOutcome.REUSE_EXISTING_CNMC_CANDIDATE,
                    recommendation_strength=RecommendationStrength.HIGH,
                    generation_method="EXISTING_CLUSTER_REUSE",
                    recommendation_reason=f"Exact canonical title match found with governed prototype CNMC '{m.cnmc_code}'.",
                    taxonomy_signals={"cnmc_code": m.cnmc_code, "canonical_name": m.canonical_name},
                    matching_signals={"exact_canonical_name": True},
                    existing_cluster_reference=m.cnmc_code,
                    existing_cnmc_id=str(m.id),
                    match_evidence_score=1.0,
                    warnings=["Recommended for cluster reuse. Awaiting human sign-off."]
                )
                return CNMCRecommendationResult(
                    outcome=RecommendationOutcome.REUSE_EXISTING_CNMC_CANDIDATE,
                    proposed_cnmc=m.cnmc_code,
                    candidate_group_name=m.canonical_name,
                    proposed_description=m.standard_description,
                    taxonomy_id=m.taxonomy_id or (taxonomy.id if taxonomy else None),
                    recommendation_strength=RecommendationStrength.HIGH,
                    strength_score=1.0,
                    explanation=expl
                )

        return None

    async def _generate_new_cnmc_candidate(
        self,
        material_id: uuid.UUID,
        rep: MaterialRepresentation,
        taxonomy: Optional[MaterialTaxonomy]
    ) -> CNMCRecommendationResult:
        """
        Synthesizes a new deterministic prototype CNMC candidate code and explanation card.
        """
        tax_path = taxonomy.path if taxonomy else None
        elements = derive_cnmc_elements_from_representation(
            taxonomy_path=tax_path,
            engineering_term=rep.engineering_term,
            canonical_description=rep.canonical_description,
            standard_code=rep.standard_code,
            material_grade=rep.material_grade,
        )

        # Deterministic sequence hash from canonical representation signature
        sig = rep.canonical_attribute_signature or rep.canonical_description
        seq_num = deterministic_sequence_hash(sig)

        proposed_code = generate_prototype_cnmc_code(
            country_code=elements["country"],
            sector_or_family=elements["sector"],
            category_code=elements["category"],
            material_type_code=elements["material_type"],
            sequence_num=seq_num
        )

        # Candidate group title
        group_name = rep.canonical_description
        if rep.engineering_term and rep.engineering_term not in group_name:
            group_name = f"{rep.engineering_term} - {group_name}"

        # Standardized description template
        std_desc = f"MVP Prototype Master Specification: {rep.canonical_description}"
        if rep.standard_code:
            std_desc += f" [Standard: {rep.standard_code}]"
        if rep.material_grade:
            std_desc += f" [Grade: {rep.material_grade}]"

        # Evaluate strength
        warnings = []
        strength = RecommendationStrength.HIGH
        strength_score = 0.90
        method = "TAXONOMY_RULE_BASED"

        if not taxonomy:
            warnings.append("Material is not mapped to a formal taxonomy node. Derived from keyword heuristics.")
            strength = RecommendationStrength.MEDIUM
            strength_score = 0.75

        # Check if hybrid match data exists to contribute evidence
        stmt = (
            select(MaterialSimilarityMatch)
            .where(
                or_(
                    MaterialSimilarityMatch.source_material_id == material_id,
                    MaterialSimilarityMatch.target_material_id == material_id
                )
            )
            .order_by(desc(MaterialSimilarityMatch.composite_confidence))
        )
        res = await self.db.execute(stmt)
        top_match = res.scalars().first()
        match_signals = {}
        match_score = None

        if top_match:
            method = "HYBRID_MATCH_ASSISTED"
            match_score = top_match.composite_confidence
            match_signals = {
                "top_match_type": top_match.match_type,
                "composite_confidence": top_match.composite_confidence,
                "lexical_score": top_match.lexical_score,
                "attribute_score": top_match.attribute_score,
            }

        expl = CNMCRecommendationExplanation(
            outcome=RecommendationOutcome.NEW_CNMC_CANDIDATE,
            recommendation_strength=strength,
            generation_method=method,
            recommendation_reason=(
                f"Generated new prototype CNMC candidate '{proposed_code}' derived from "
                f"sector '{elements['sector']}', category '{elements['category']}', and type '{elements['material_type']}'."
            ),
            taxonomy_signals={
                "taxonomy_path": tax_path,
                "sector": elements["sector"],
                "category": elements["category"],
                "material_type": elements["material_type"],
                "engineering_term": rep.engineering_term,
            },
            matching_signals=match_signals,
            match_evidence_score=match_score,
            warnings=warnings
        )

        return CNMCRecommendationResult(
            outcome=RecommendationOutcome.NEW_CNMC_CANDIDATE,
            proposed_cnmc=proposed_code,
            candidate_group_name=group_name[:255],
            proposed_description=std_desc,
            taxonomy_id=taxonomy.id if taxonomy else None,
            recommendation_strength=strength,
            strength_score=strength_score,
            explanation=expl
        )

    async def _persist_or_get_candidate(
        self,
        result: CNMCRecommendationResult,
        actor_reference: str
    ) -> tuple[uuid.UUID, bool]:
        """
        Idempotently persists or retrieves existing CNMCCandidate in PENDING_REVIEW status.
        Returns (candidate_id, is_existing).
        """
        # Check if an existing candidate with same proposed_cnmc and status PENDING_REVIEW exists
        stmt = select(CNMCCandidate).where(
            CNMCCandidate.proposed_cnmc == result.proposed_cnmc,
            CNMCCandidate.status == "PENDING_REVIEW"
        )
        res = await self.db.execute(stmt)
        existing = res.scalars().first()

        if existing:
            return existing.id, True

        # Create new candidate record
        cand = CNMCCandidate(
            id=uuid.uuid4(),
            proposed_cnmc=result.proposed_cnmc,
            candidate_group_name=result.candidate_group_name,
            proposed_description=result.proposed_description,
            taxonomy_id=result.taxonomy_id,
            confidence_score=result.strength_score,
            recommendation_explanation=result.explanation.to_json(),
            generation_source=f"ENGINE_V1_{result.explanation.generation_method}",
            status="PENDING_REVIEW"
        )
        self.db.add(cand)
        await self.db.flush()

        # Record audit log
        await record_audit_log(
            session=self.db,
            entity_type="CNMC_CANDIDATE",
            entity_id=str(cand.id),
            action="CNMC_RECOMMENDATION_CREATED",
            actor_reference=actor_reference,
            previous_state=None,
            new_state={
                "proposed_cnmc": cand.proposed_cnmc,
                "status": cand.status,
                "generation_source": cand.generation_source,
                "strength": result.recommendation_strength,
            },
            metadata_payload={
                "outcome": result.outcome,
                "format_version": result.explanation.format_version,
            }
        )

        return cand.id, False
