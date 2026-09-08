"""
Hybrid Match Scoring & Candidate Intelligence Engine.

Combines Tier 1 deterministic signals, Tier 2 text similarity, and Tier 3 semantic embeddings
into an explainable, safe candidate recommendation score.

Version: HYBRID_MATCH_V1
"""

from typing import Dict, Any, List, Optional, Tuple
import uuid
import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_

from app.models.material import NormalizedMaterial, MaterialAttribute, MaterialEmbedding
from app.models.matching import MaterialSimilarityMatch
from app.models.taxonomy import MaterialTaxonomy
from app.services.matching.representation import (
    MaterialRepresentation,
    build_material_representation
)
from app.services.matching.deterministic_matcher import evaluate_deterministic_match
from app.services.matching.text_similarity import evaluate_text_similarity
from app.services.matching.embedding_provider import get_embedding_provider, BaseEmbeddingProvider


# Configurable weights for HYBRID_MATCH_V1
DEFAULT_WEIGHTS_NO_SEMANTIC = {
    "attribute_signature": 0.45,
    "text_similarity": 0.35,
    "part_number": 0.10,
    "grade_and_standard": 0.10
}

DEFAULT_WEIGHTS_WITH_SEMANTIC = {
    "attribute_signature": 0.35,
    "text_similarity": 0.25,
    "semantic_similarity": 0.20,
    "part_number": 0.10,
    "grade_and_standard": 0.10
}


def score_candidate_pair(
    source: MaterialRepresentation,
    target: MaterialRepresentation,
    source_vec: Optional[List[float]] = None,
    target_vec: Optional[List[float]] = None,
    embedding_provider: Optional[BaseEmbeddingProvider] = None
) -> Dict[str, Any]:
    """
    Computes explainable hybrid match score and candidate classification
    between two material representations.
    """
    provider = embedding_provider or get_embedding_provider()

    # 1. Tier 1 Deterministic
    tier1 = evaluate_deterministic_match(source, target)

    # 2. Tier 2 Text Similarity
    tier2 = evaluate_text_similarity(source, target)

    # 3. Tier 3 Semantic Similarity (Strictly honest)
    semantic_score: Optional[float] = None
    semantic_status = "UNAVAILABLE"
    semantic_model_name = "N/A"

    if provider.is_available():
        if source_vec is None:
            source_vec = provider.generate_embedding(source.ai_safe_text)
        if target_vec is None:
            target_vec = provider.generate_embedding(target.ai_safe_text)

        if source_vec and target_vec:
            sim = provider.compute_similarity(source_vec, target_vec)
            if sim is not None:
                # Cosine similarity mapped to [0, 1] range: (sim + 1) / 2 if needed, but for MiniLM dot >= 0 is typical
                semantic_score = round(max(0.0, min(1.0, sim)), 4)
                semantic_status = "COMPUTED"
                semantic_model_name = provider.get_model_info().get("model_name", "local-model")

    # 4. Composite Scoring with Dynamic Active Weight Normalization
    attr_score = tier1["attribute_score"]
    text_score = tier2["text_similarity_score"]

    grade_std_signals = [s for s in tier1["signals"] if s["rule_id"] in ("MATERIAL_GRADE_MATCH", "STANDARD_CODE_MATCH")]
    grade_std_score = (sum(s["score"] for s in grade_std_signals) / len(grade_std_signals)) if grade_std_signals else None

    # Determine active signal values and weights
    base_weights = DEFAULT_WEIGHTS_WITH_SEMANTIC if semantic_score is not None else DEFAULT_WEIGHTS_NO_SEMANTIC
    active_signals: Dict[str, float] = {
        "attribute_signature": attr_score,
        "text_similarity": text_score,
    }

    if semantic_score is not None:
        active_signals["semantic_similarity"] = semantic_score

    if source.normalized_part_number and target.normalized_part_number:
        active_signals["part_number"] = 1.0 if tier1["is_exact_part_number"] else 0.0

    if grade_std_score is not None:
        active_signals["grade_and_standard"] = grade_std_score

    total_weight = sum(base_weights[k] for k in active_signals.keys())
    composite = sum(base_weights[k] * active_signals[k] for k in active_signals.keys()) / total_weight if total_weight > 0 else 0.0

    if semantic_score is not None:
        methodology = "HYBRID_AI_RULE_V1"
    elif tier1["is_exact_signature"]:
        methodology = "RULE_BASED_EXACT"
        composite = max(composite, 0.98)
    else:
        methodology = "HYBRID_RULE_TEXT_V1"

    # Hard conflict penalty
    if tier1["has_hard_conflict"]:
        composite = min(composite, 0.49)

    composite = round(min(max(composite, 0.0), 1.0), 4)

    # 5. Candidate Classification
    if tier1["is_exact_signature"] or (tier1["is_exact_part_number"] and not tier1["has_hard_conflict"]):
        candidate_classification = "EXACT_MATCH_CANDIDATE"
    elif composite >= 0.85 and not tier1["has_hard_conflict"]:
        candidate_classification = "NEAR_DUPLICATE_CANDIDATE"
    elif composite >= 0.70 and not tier1["has_hard_conflict"]:
        candidate_classification = "POSSIBLE_EQUIVALENT_CANDIDATE"
    elif composite >= 0.45 or (composite >= 0.45 and tier1["has_hard_conflict"]):
        candidate_classification = "REQUIRES_DOMAIN_REVIEW"
    else:
        candidate_classification = "NO_MEANINGFUL_MATCH"

    # 6. Structured Explainability Signals Assembly
    all_signals = []
    all_signals.extend(tier1["signals"])
    all_signals.extend(tier2["signals"])

    all_signals.append({
        "rule_id": "SEMANTIC_EMBEDDING_SIMILARITY",
        "name": "ML Semantic Embedding Similarity",
        "score": semantic_score,
        "status": semantic_status,
        "source_value": f"Model: {semantic_model_name}",
        "target_value": f"Status: {semantic_status}",
        "explanation": (
            f"Dense vector cosine similarity score: {round(semantic_score * 100, 1)}%."
            if semantic_score is not None
            else "ML semantic embedding provider unavailable in current environment; score omitted from hybrid calculation."
        )
    })

    # Summary Explanation
    if candidate_classification == "EXACT_MATCH_CANDIDATE":
        summary_explanation = f"Exact candidate match ({round(composite*100, 1)}%). Shared exact canonical signature / part number."
    elif candidate_classification == "NEAR_DUPLICATE_CANDIDATE":
        summary_explanation = f"High-confidence near duplicate ({round(composite*100, 1)}%). Compatible attributes with strong text similarity."
    elif candidate_classification == "POSSIBLE_EQUIVALENT_CANDIDATE":
        summary_explanation = f"Possible functional equivalent ({round(composite*100, 1)}%). Core attributes align with minor description variance."
    elif candidate_classification == "REQUIRES_DOMAIN_REVIEW":
        if tier1["has_hard_conflict"]:
            summary_explanation = f"Requires domain review ({round(composite*100, 1)}%). Conflicts detected: {', '.join(tier1['conflict_reasons'])}."
        else:
            summary_explanation = f"Requires domain review ({round(composite*100, 1)}%). Moderate similarity with incomplete attribute data."
    else:
        summary_explanation = f"No meaningful match ({round(composite*100, 1)}%). Low similarity or conflicting technical specifications."

    return {
        "composite_confidence": composite,
        "lexical_score": text_score,
        "vector_score": semantic_score if semantic_score is not None else 0.0,
        "attribute_score": attr_score,
        "candidate_classification": candidate_classification,
        "methodology": methodology,
        "ai_model_version": semantic_model_name if semantic_score is not None else "HYBRID_MATCH_V1",
        "match_explanation": summary_explanation,
        "specification_diff": tier1["specification_diff"],
        "has_hard_conflict": tier1["has_hard_conflict"],
        "conflict_reasons": tier1["conflict_reasons"],
        "signals": all_signals,
        "weights_used": base_weights
    }


async def load_representation_for_material(
    material_id: uuid.UUID,
    session: AsyncSession
) -> Optional[MaterialRepresentation]:
    """
    Loads NormalizedMaterial, its attributes, and taxonomy to construct MaterialRepresentation.
    """
    stmt = (
        select(NormalizedMaterial)
        .where(NormalizedMaterial.id == material_id)
    )
    result = await session.execute(stmt)
    norm_mat = result.scalar_one_or_none()
    if not norm_mat:
        return None

    # Load attributes
    attr_stmt = (
        select(MaterialAttribute)
        .where(MaterialAttribute.normalized_material_id == material_id)
    )
    attr_res = await session.execute(attr_stmt)
    attrs = attr_res.scalars().all()
    attr_dict = {a.attribute_name: a.normalized_value for a in attrs}

    # Load taxonomy if available
    category = None
    subcategory = None
    if norm_mat.taxonomy_id:
        tax_stmt = select(MaterialTaxonomy).where(MaterialTaxonomy.id == norm_mat.taxonomy_id)
        tax_res = await session.execute(tax_stmt)
        tax = tax_res.scalar_one_or_none()
        if tax:
            category = getattr(tax, "category_name", None) or tax.name
            subcategory = getattr(tax, "sub_category_name", None) or tax.code

    return build_material_representation(
        material_id=norm_mat.id,
        organization_id=norm_mat.organization_id,
        raw_material_id=norm_mat.raw_material_id,
        canonical_description=norm_mat.canonical_description,
        normalized_uom=norm_mat.normalized_uom,
        category=category,
        subcategory=subcategory,
        material_grade=norm_mat.material_grade,
        standard_code=norm_mat.standard_code,
        engineering_term=norm_mat.engineering_term,
        normalized_part_number=norm_mat.normalized_part_number,
        normalized_manufacturer=norm_mat.normalized_manufacturer,
        attributes_dict=attr_dict
    )


async def retrieve_candidate_materials(
    source_rep: MaterialRepresentation,
    session: AsyncSession,
    cross_org_only: bool = False,
    limit: int = 50
) -> List[MaterialRepresentation]:
    """
    Safe candidate retrieval / blocking strategy.
    Prevents N x N search storms by pre-filtering materials that share
    category, engineering term, material grade, or key tokens.
    """
    conditions = [NormalizedMaterial.id != source_rep.material_id]

    if cross_org_only:
        conditions.append(NormalizedMaterial.organization_id != source_rep.organization_id)

    # Blocking criteria (OR-based filter on high-signal attributes)
    blocking_clauses = []

    if source_rep.engineering_term:
        blocking_clauses.append(NormalizedMaterial.engineering_term.ilike(f"%{source_rep.engineering_term}%"))
        blocking_clauses.append(NormalizedMaterial.canonical_description.ilike(f"%{source_rep.engineering_term}%"))

    if source_rep.material_grade:
        blocking_clauses.append(NormalizedMaterial.material_grade.ilike(f"%{source_rep.material_grade}%"))

    if source_rep.normalized_part_number:
        blocking_clauses.append(NormalizedMaterial.normalized_part_number == source_rep.normalized_part_number)

    # Key tokens from canonical description
    desc_words = [w for w in source_rep.canonical_description.split() if len(w) >= 3 and not w.isdigit()][:4]
    for w in desc_words:
        blocking_clauses.append(NormalizedMaterial.canonical_description.ilike(f"%{w}%"))

    if blocking_clauses:
        conditions.append(or_(*blocking_clauses))

    stmt = select(NormalizedMaterial).where(and_(*conditions)).limit(limit)
    result = await session.execute(stmt)
    candidate_mats = result.scalars().all()

    reps = []
    for mat in candidate_mats:
        rep = await load_representation_for_material(mat.id, session)
        if rep:
            reps.append(rep)

    return reps


async def generate_and_persist_matches_for_material(
    source_material_id: uuid.UUID,
    session: AsyncSession,
    cross_org_only: bool = False,
    min_score_threshold: float = 0.40,
    limit: int = 25
) -> List[MaterialSimilarityMatch]:
    """
    Executes end-to-end candidate generation, hybrid scoring, explainability generation,
    and database persistence for a given source material.
    """
    source_rep = await load_representation_for_material(source_material_id, session)
    if not source_rep:
        return []

    candidates = await retrieve_candidate_materials(
        source_rep=source_rep,
        session=session,
        cross_org_only=cross_org_only,
        limit=50
    )

    created_matches: List[MaterialSimilarityMatch] = []

    for cand_rep in candidates:
        score_res = score_candidate_pair(source_rep, cand_rep)
        composite = score_res["composite_confidence"]

        if composite >= min_score_threshold:
            # Check if match already exists
            existing_stmt = select(MaterialSimilarityMatch).where(
                or_(
                    and_(
                        MaterialSimilarityMatch.source_material_id == source_rep.material_id,
                        MaterialSimilarityMatch.target_material_id == cand_rep.material_id,
                    ),
                    and_(
                        MaterialSimilarityMatch.source_material_id == cand_rep.material_id,
                        MaterialSimilarityMatch.target_material_id == source_rep.material_id,
                    )
                )
            )
            existing_res = await session.execute(existing_stmt)
            existing_match = existing_res.scalar_one_or_none()

            match_explanation_json = json.dumps({
                "summary": score_res["match_explanation"],
                "candidate_classification": score_res["candidate_classification"],
                "signals": score_res["signals"],
                "conflict_reasons": score_res["conflict_reasons"],
                "weights_used": score_res["weights_used"]
            })

            if existing_match:
                # Update existing
                existing_match.match_type = score_res["candidate_classification"]
                existing_match.lexical_score = score_res["lexical_score"]
                existing_match.vector_score = score_res["vector_score"]
                existing_match.attribute_score = score_res["attribute_score"]
                existing_match.composite_confidence = composite
                existing_match.methodology = score_res["methodology"]
                existing_match.match_explanation = match_explanation_json
                existing_match.specification_diff = score_res["specification_diff"]
                existing_match.ai_model_version = score_res["ai_model_version"]
                created_matches.append(existing_match)
            else:
                new_match = MaterialSimilarityMatch(
                    source_material_id=source_rep.material_id,
                    target_material_id=cand_rep.material_id,
                    match_type=score_res["candidate_classification"],
                    lexical_score=score_res["lexical_score"],
                    vector_score=score_res["vector_score"],
                    attribute_score=score_res["attribute_score"],
                    composite_confidence=composite,
                    methodology=score_res["methodology"],
                    match_explanation=match_explanation_json,
                    specification_diff=score_res["specification_diff"],
                    recommendation_status="PROPOSED",
                    ai_model_version=score_res["ai_model_version"]
                )
                session.add(new_match)
                created_matches.append(new_match)

    await session.commit()
    return created_matches[:limit]
