"""
CNMC Prototype Codification & Generation Utilities.

CRITICAL GOVERNANCE BOUNDARY:
This code implements the "MVP Prototype CNMC Reference Format" (e.g. IN-IND-MECH-BLT-00492).
Created exclusively for SIH 2026 prototype evaluation, taxonomy demonstration, and
application-level material governance workflow testing.
DO NOT claim this is an official Government of India approved code.
"""

from enum import Enum
import re
import hashlib
from typing import Optional, Dict, Any


class CNMCFormatVersion(str, Enum):
    MVP_CNMC_V1 = "MVP_CNMC_V1"


def sanitize_token(text: Optional[str], max_len: int = 4, default: str = "GEN") -> str:
    """
    Sanitizes and shortens a text token for deterministic prototype CNMC codification.
    """
    if not text:
        return default
    # Strip non-alphanumerics
    cleaned = re.sub(r"[^A-Za-z0-9]", "", text).upper()
    if not cleaned:
        return default
    return cleaned[:max_len]


def generate_prototype_cnmc_code(
    country_code: str = "IN",
    sector_or_family: str = "IND",
    category_code: str = "MECH",
    material_type_code: str = "GEN",
    sequence_num: int = 1,
    format_version: CNMCFormatVersion = CNMCFormatVersion.MVP_CNMC_V1
) -> str:
    """
    Generates a deterministic prototype CNMC string in reference format:
    e.g. IN-IND-MECH-BLT-00492
    """
    c_code = sanitize_token(country_code, 2, "IN")
    s_code = sanitize_token(sector_or_family, 3, "IND")
    cat_code = sanitize_token(category_code, 4, "GEN")
    type_code = sanitize_token(material_type_code, 4, "GEN")
    seq_str = f"{sequence_num:05d}"

    return f"{c_code}-{s_code}-{cat_code}-{type_code}-{seq_str}"


def map_component_type(text: Optional[str]) -> str:
    if not text:
        return "ITEM"
    t = text.lower()
    if "bolt" in t:
        return "BLT"
    if "nut" in t:
        return "NUT"
    if "valve" in t:
        return "VLV"
    if "flange" in t:
        return "FLG"
    if "bearing" in t:
        return "BRG"
    if "gasket" in t:
        return "GSK"
    if "pump" in t:
        return "PMP"
    if "motor" in t:
        return "MTR"
    if "pipe" in t or "piping" in t:
        return "PIPE"
    return sanitize_token(text, 4, "ITEM")


def derive_cnmc_elements_from_representation(
    taxonomy_path: Optional[str] = None,
    engineering_term: Optional[str] = None,
    canonical_description: Optional[str] = None,
    standard_code: Optional[str] = None,
    material_grade: Optional[str] = None,
) -> Dict[str, str]:
    """
    Derives deterministic sector, category, and material type tokens from Layer 2 intelligence.
    """
    sector = "IND"
    category = "GEN"
    material_type = "ITEM"

    if taxonomy_path:
        parts = [p.strip() for p in taxonomy_path.split("/") if p.strip()]
        if len(parts) >= 1:
            sector = sanitize_token(parts[0], 3, "IND")
        if len(parts) >= 2:
            category = sanitize_token(parts[1], 4, "GEN")
        if len(parts) >= 4:
            material_type = map_component_type(parts[3])
        elif len(parts) >= 3:
            material_type = map_component_type(parts[2])
    
    if material_type in ("ITEM", "GEN") and engineering_term:
        material_type = map_component_type(engineering_term)

    if material_type in ("ITEM", "GEN") and canonical_description:
        material_type = map_component_type(canonical_description)
        if material_type in ("BLT", "NUT"):
            category = "MECH"
        elif material_type in ("PIPE", "VLV", "FLG"):
            category = "PIPG"

    return {
        "country": "IN",
        "sector": sector,
        "category": category,
        "material_type": material_type
    }


def deterministic_sequence_hash(seed_text: str, max_sequence: int = 99999) -> int:
    """
    Computes a deterministic positive sequence integer from text hash.
    Ensures repeatable sequence number generation for demonstration clusters.
    """
    sha = hashlib.sha256(seed_text.strip().lower().encode("utf-8")).hexdigest()
    # Take first 8 hex characters as int modulo max_sequence
    val = int(sha[:8], 16)
    return (val % (max_sequence - 1)) + 1
