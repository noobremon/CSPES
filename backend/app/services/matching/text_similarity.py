"""
Tier 2: Deterministic Text Similarity Engine.

Computes lexical and token-based similarity scores between canonical descriptions
and AI-safe representations without claiming to be machine learning.

Methodology: TEXT_SIMILARITY
Algorithms: Token Jaccard + SequenceMatcher Levenshtein approximation + Token Set Overlap.
"""

import re
import difflib
from typing import Dict, Any, List, Set
from app.services.matching.representation import MaterialRepresentation


def _tokenize(text: str) -> List[str]:
    """Tokenize text into alphanumeric tokens, ignoring small punctuation."""
    if not text:
        return []
    cleaned = re.sub(r"[^A-Z0-9\/\-\.]", " ", text.upper())
    return [t for t in cleaned.split() if len(t) > 0]


def compute_token_jaccard(tokens1: Set[str], tokens2: Set[str]) -> float:
    """Computes Jaccard index between two token sets."""
    if not tokens1 and not tokens2:
        return 1.0
    if not tokens1 or not tokens2:
        return 0.0
    intersection = len(tokens1 & tokens2)
    union = len(tokens1 | tokens2)
    return intersection / union if union > 0 else 0.0


def compute_token_overlap(tokens1: Set[str], tokens2: Set[str]) -> float:
    """Computes overlap coefficient (intersection / min(|A|, |B|))."""
    if not tokens1 and not tokens2:
        return 1.0
    if not tokens1 or not tokens2:
        return 0.0
    min_len = min(len(tokens1), len(tokens2))
    return len(tokens1 & tokens2) / min_len if min_len > 0 else 0.0


def compute_sequence_ratio(s1: str, s2: str) -> float:
    """Computes Levenshtein-like character sequence ratio using SequenceMatcher."""
    if not s1 and not s2:
        return 1.0
    if not s1 or not s2:
        return 0.0
    return difflib.SequenceMatcher(None, s1.strip().upper(), s2.strip().upper()).ratio()


def evaluate_text_similarity(
    source: MaterialRepresentation,
    target: MaterialRepresentation
) -> Dict[str, Any]:
    """
    Evaluates Tier 2 deterministic text similarity.
    Uses canonical descriptions and structured ai_safe_text.
    """
    # Description level
    s_desc = source.canonical_description or ""
    t_desc = target.canonical_description or ""
    s_tokens = set(_tokenize(s_desc))
    t_tokens = set(_tokenize(t_desc))

    jaccard_desc = compute_token_jaccard(s_tokens, t_tokens)
    overlap_desc = compute_token_overlap(s_tokens, t_tokens)
    seq_ratio_desc = compute_sequence_ratio(s_desc, t_desc)

    # Safe text level
    s_safe = source.ai_safe_text or ""
    t_safe = target.ai_safe_text or ""
    seq_ratio_safe = compute_sequence_ratio(s_safe, t_safe)

    # Composite deterministic text score (MVP heuristic)
    # Weights: Jaccard 40%, Overlap 30%, Sequence Ratio 30%
    composite_text_score = (0.40 * jaccard_desc) + (0.30 * overlap_desc) + (0.30 * seq_ratio_desc)
    composite_text_score = round(min(max(composite_text_score, 0.0), 1.0), 4)

    # Threshold classification
    if composite_text_score >= 0.85:
        classification = "HIGH_TEXT_SIMILARITY"
    elif composite_text_score >= 0.60:
        classification = "MEDIUM_TEXT_SIMILARITY"
    else:
        classification = "LOW_TEXT_SIMILARITY"

    signals = [
        {
            "rule_id": "TEXT_SIMILARITY_TOKEN_JACCARD",
            "name": "Token Jaccard Similarity",
            "score": round(jaccard_desc, 4),
            "status": "COMPUTED",
            "source_value": f"{len(s_tokens)} tokens",
            "target_value": f"{len(t_tokens)} tokens",
            "explanation": f"Shared {len(s_tokens & t_tokens)} of {len(s_tokens | t_tokens)} unique description tokens."
        },
        {
            "rule_id": "TEXT_SIMILARITY_SEQUENCE_RATIO",
            "name": "Normalized Sequence Ratio",
            "score": round(seq_ratio_desc, 4),
            "status": "COMPUTED",
            "source_value": s_desc,
            "target_value": t_desc,
            "explanation": f"Character-level sequence alignment ratio: {round(seq_ratio_desc * 100, 1)}%."
        }
    ]

    return {
        "text_similarity_score": composite_text_score,
        "classification": classification,
        "methodology": "TEXT_SIMILARITY",
        "algorithm_name": "TOKEN_JACCARD_SEQUENCE_V1",
        "details": {
            "token_jaccard": round(jaccard_desc, 4),
            "token_overlap": round(overlap_desc, 4),
            "sequence_ratio": round(seq_ratio_desc, 4),
            "safe_text_sequence_ratio": round(seq_ratio_safe, 4)
        },
        "signals": signals
    }
