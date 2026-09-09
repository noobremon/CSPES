"""
Tier 1: Deterministic Exact and Structural Candidate Matching Engine.

Evaluates strict rule-based signals:
1. EXACT_ATTRIBUTE_SIGNATURE_V1 (Canonical hash equivalence)
2. PART_NUMBER_EXACT (Exact normalized OEM part number)
3. STRUCTURAL_ATTRIBUTE_EQUIVALENCE (Key-value attribute match & conflict detection)
"""

from typing import Dict, Any, List, Tuple
from app.services.matching.representation import MaterialRepresentation


def evaluate_deterministic_match(
    source: MaterialRepresentation,
    target: MaterialRepresentation
) -> Dict[str, Any]:
    """
    Evaluates Tier 1 deterministic matching rules between two material representations.
    Returns structured signals, compatibility status, and attribute diffs.
    """
    signals: List[Dict[str, Any]] = []
    spec_diff: Dict[str, Any] = {}
    is_exact_signature = False
    is_exact_part_number = False
    has_hard_conflict = False
    conflict_reasons: List[str] = []

    from app.services.matching.representation import generate_canonical_signature

    s_sig = source.canonical_attribute_signature or generate_canonical_signature(
        source.category, source.engineering_term, source.material_grade, source.standard_code, source.technical_attributes
    )
    t_sig = target.canonical_attribute_signature or generate_canonical_signature(
        target.category, target.engineering_term, target.material_grade, target.standard_code, target.technical_attributes
    )

    # 1. Exact Canonical Signature
    if s_sig and t_sig:
        if s_sig == t_sig:
            is_exact_signature = True
            signals.append({
                "rule_id": "EXACT_ATTRIBUTE_SIGNATURE_V1",
                "name": "Canonical Attribute Signature",
                "score": 1.0,
                "status": "EXACT_MATCH",
                "source_value": s_sig,
                "target_value": t_sig,
                "explanation": "Materials share identical canonical category, engineering term, grade, and technical attributes."
            })
        else:
            signals.append({
                "rule_id": "EXACT_ATTRIBUTE_SIGNATURE_V1",
                "name": "Canonical Attribute Signature",
                "score": 0.0,
                "status": "DIFFERENT",
                "source_value": s_sig,
                "target_value": t_sig,
                "explanation": "Canonical attribute signatures differ."
            })

    # 2. Exact Part Number / OEM Reference
    if (
        source.normalized_part_number
        and target.normalized_part_number
        and len(source.normalized_part_number.strip()) > 2
        and len(target.normalized_part_number.strip()) > 2
    ):
        s_pn = source.normalized_part_number.strip().upper()
        t_pn = target.normalized_part_number.strip().upper()
        if s_pn == t_pn:
            is_exact_part_number = True
            signals.append({
                "rule_id": "PART_NUMBER_EXACT",
                "name": "Manufacturer Part Number",
                "score": 1.0,
                "status": "EXACT_MATCH",
                "source_value": s_pn,
                "target_value": t_pn,
                "explanation": f"Exact OEM/manufacturer part number match: '{s_pn}'."
            })
        else:
            signals.append({
                "rule_id": "PART_NUMBER_EXACT",
                "name": "Manufacturer Part Number",
                "score": 0.0,
                "status": "MISMATCH",
                "source_value": s_pn,
                "target_value": t_pn,
                "explanation": f"Part numbers differ: '{s_pn}' vs '{t_pn}'."
            })

    # 3. Material Grade Compatibility Check
    s_grade = (source.material_grade or "").strip().upper()
    t_grade = (target.material_grade or "").strip().upper()
    if s_grade and t_grade:
        if s_grade == t_grade:
            signals.append({
                "rule_id": "MATERIAL_GRADE_MATCH",
                "name": "Material Grade",
                "score": 1.0,
                "status": "EXACT_MATCH",
                "source_value": s_grade,
                "target_value": t_grade,
                "explanation": f"Material grades match: '{s_grade}'."
            })
        else:
            has_hard_conflict = True
            conflict_reasons.append(f"Incompatible material grades: '{s_grade}' vs '{t_grade}'")
            signals.append({
                "rule_id": "MATERIAL_GRADE_MATCH",
                "name": "Material Grade",
                "score": 0.0,
                "status": "CONFLICT",
                "source_value": s_grade,
                "target_value": t_grade,
                "explanation": f"Material grades conflict: '{s_grade}' vs '{t_grade}'."
            })
    elif s_grade or t_grade:
        signals.append({
            "rule_id": "MATERIAL_GRADE_MATCH",
            "name": "Material Grade",
            "score": 0.5,
            "status": "PARTIAL",
            "source_value": s_grade or "UNSPECIFIED",
            "target_value": t_grade or "UNSPECIFIED",
            "explanation": "One record is missing explicit material grade specification."
        })

    # 4. Standard Code Compatibility Check
    s_std = (source.standard_code or "").strip().upper()
    t_std = (target.standard_code or "").strip().upper()
    if s_std and t_std:
        if s_std == t_std:
            signals.append({
                "rule_id": "STANDARD_CODE_MATCH",
                "name": "Engineering Standard",
                "score": 1.0,
                "status": "EXACT_MATCH",
                "source_value": s_std,
                "target_value": t_std,
                "explanation": f"Engineering standards match: '{s_std}'."
            })
        else:
            signals.append({
                "rule_id": "STANDARD_CODE_MATCH",
                "name": "Engineering Standard",
                "score": 0.3,
                "status": "DIFFERENT",
                "source_value": s_std,
                "target_value": t_std,
                "explanation": f"Different engineering standards: '{s_std}' vs '{t_std}'."
            })

    # 5. Technical Attribute-by-Attribute Comparison
    all_attr_keys = sorted(set(source.technical_attributes.keys()) | set(target.technical_attributes.keys()))
    matched_attrs = 0
    total_compared = 0

    critical_dimension_keys = {
        "diameter", "length", "pressure", "pressure_class", "pressure_rating",
        "voltage", "schedule", "power_kw", "power_rating", "thread_pitch", "nominal_size", "speed"
    }

    for key in all_attr_keys:
        s_val = str(source.technical_attributes.get(key, "")).strip().upper()
        t_val = str(target.technical_attributes.get(key, "")).strip().upper()

        spec_diff[key] = {
            "source": s_val or None,
            "target": t_val or None,
            "status": "MATCH" if (s_val and t_val and s_val == t_val) else (
                "MISMATCH" if (s_val and t_val) else "MISSING_IN_ONE"
            )
        }

        if s_val and t_val:
            total_compared += 1
            if s_val == t_val:
                matched_attrs += 1
            else:
                if key in critical_dimension_keys:
                    has_hard_conflict = True
                    conflict_reasons.append(f"Incompatible {key}: '{s_val}' vs '{t_val}'")
                    signals.append({
                        "rule_id": f"DIMENSION_MISMATCH_{key.upper()}",
                        "name": f"Critical Attribute: {key}",
                        "score": 0.0,
                        "status": "CONFLICT",
                        "source_value": s_val,
                        "target_value": t_val,
                        "explanation": f"Critical dimensional conflict in {key}: '{s_val}' vs '{t_val}'."
                    })

    # Compute structural attribute score
    if total_compared > 0:
        attr_score = matched_attrs / total_compared
        if has_hard_conflict:
            attr_score = min(attr_score, 0.2)
    elif is_exact_signature:
        attr_score = 1.0
    else:
        attr_score = 0.5  # Neutral when neither has attributes

    return {
        "is_exact_signature": is_exact_signature,
        "is_exact_part_number": is_exact_part_number,
        "has_hard_conflict": has_hard_conflict,
        "conflict_reasons": conflict_reasons,
        "attribute_score": round(attr_score, 4),
        "matched_attributes_count": matched_attrs,
        "total_compared_attributes_count": total_compared,
        "signals": signals,
        "specification_diff": spec_diff
    }
