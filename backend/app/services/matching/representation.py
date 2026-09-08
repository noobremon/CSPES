"""
Material Representation Layer for AI-Ready and Explainable Matching.

Constructs sanitized, canonical MaterialRepresentation instances strictly from
Layer 2 intelligence (normalized descriptions, standardized UOM, material grades,
standard codes, and extracted technical attributes).

CRITICAL PRIVACY GUARANTEE:
Layer 1 private commercial payload (PO pricing, vendor names, store locations)
is strictly isolated and NEVER included in the AI-safe representation.
"""

from dataclasses import dataclass, field
from typing import Dict, Any, Optional, List
import uuid


@dataclass
class MaterialRepresentation:
    """
    Canonical AI-ready material representation generated exclusively from Layer 2.
    """
    material_id: uuid.UUID
    organization_id: uuid.UUID
    canonical_description: str
    normalized_uom: str
    raw_material_id: Optional[uuid.UUID] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    material_grade: Optional[str] = None
    standard_code: Optional[str] = None
    engineering_term: Optional[str] = None
    normalized_part_number: Optional[str] = None
    normalized_manufacturer: Optional[str] = None
    technical_attributes: Dict[str, Any] = field(default_factory=dict)
    ai_safe_text: str = ""
    canonical_attribute_signature: str = ""
    representation_version: str = "1.0.0"


def generate_canonical_signature(
    category: Optional[str],
    engineering_term: Optional[str],
    material_grade: Optional[str],
    standard_code: Optional[str],
    attributes: Dict[str, Any]
) -> str:
    """
    Generates a deterministic signature string for exact structural hashing.
    Format: CATEGORY|TERM|GRADE|STANDARD|ATTR_KEYS_VALUES_SORTED
    """
    cat_part = (category or "GENERIC").strip().upper()
    term_part = (engineering_term or "ITEM").strip().upper()
    grade_part = (material_grade or "NA").strip().upper()
    std_part = (standard_code or "NA").strip().upper()

    # Extract primary dimensions if present
    sig_attrs = []
    primary_keys = ["diameter", "length", "thread_pitch", "pressure", "voltage", "schedule", "power_kw"]
    for k in primary_keys:
        if k in attributes and attributes[k]:
            sig_attrs.append(f"{k.upper()}={str(attributes[k]).strip().upper()}")

    # Any remaining non-primary attributes sorted
    other_attrs = []
    for k in sorted(attributes.keys()):
        if k not in primary_keys and attributes[k]:
            other_attrs.append(f"{k.upper()}={str(attributes[k]).strip().upper()}")

    attr_part = ";".join(sig_attrs + other_attrs) if (sig_attrs or other_attrs) else "NO_ATTRS"
    return f"{cat_part}|{term_part}|{grade_part}|{std_part}|{attr_part}"


def generate_ai_safe_text(
    category: Optional[str],
    canonical_description: str,
    engineering_term: Optional[str],
    material_grade: Optional[str],
    standard_code: Optional[str],
    normalized_uom: str,
    attributes: Dict[str, Any],
    normalized_part_number: Optional[str] = None
) -> str:
    """
    Generates sanitized, high-signal structured text representation for text and embedding models.
    Does NOT include any commercial, supplier, or pricing data.
    """
    lines = []
    if category:
        lines.append(f"CATEGORY: {category.upper()}")
    if engineering_term:
        lines.append(f"TYPE: {engineering_term.upper()}")
    
    lines.append(f"DESCRIPTION: {canonical_description.upper()}")

    if material_grade:
        lines.append(f"MATERIAL_GRADE: {material_grade.upper()}")
    if standard_code:
        lines.append(f"STANDARD: {standard_code.upper()}")
    if normalized_part_number:
        lines.append(f"PART_NUMBER: {normalized_part_number.upper()}")

    # Add attributes in stable order
    for k in sorted(attributes.keys()):
        val = attributes[k]
        if val is not None and str(val).strip():
            lines.append(f"{k.upper()}: {str(val).upper()}")

    lines.append(f"UOM: {normalized_uom.upper()}")
    return " | ".join(lines)


def build_material_representation(
    material_id: uuid.UUID,
    organization_id: uuid.UUID,
    canonical_description: str,
    normalized_uom: str,
    raw_material_id: Optional[uuid.UUID] = None,
    category: Optional[str] = None,
    subcategory: Optional[str] = None,
    material_grade: Optional[str] = None,
    standard_code: Optional[str] = None,
    engineering_term: Optional[str] = None,
    normalized_part_number: Optional[str] = None,
    normalized_manufacturer: Optional[str] = None,
    attributes_dict: Optional[Dict[str, Any]] = None,
) -> MaterialRepresentation:
    """
    Factory to assemble a MaterialRepresentation instance with signature and ai_safe_text.
    """
    attrs = attributes_dict or {}

    signature = generate_canonical_signature(
        category=category,
        engineering_term=engineering_term,
        material_grade=material_grade,
        standard_code=standard_code,
        attributes=attrs
    )

    safe_text = generate_ai_safe_text(
        category=category,
        canonical_description=canonical_description,
        engineering_term=engineering_term,
        material_grade=material_grade,
        standard_code=standard_code,
        normalized_uom=normalized_uom,
        attributes=attrs,
        normalized_part_number=normalized_part_number
    )

    return MaterialRepresentation(
        material_id=material_id,
        organization_id=organization_id,
        raw_material_id=raw_material_id,
        canonical_description=canonical_description,
        normalized_uom=normalized_uom,
        category=category,
        subcategory=subcategory,
        material_grade=material_grade,
        standard_code=standard_code,
        engineering_term=engineering_term,
        normalized_part_number=normalized_part_number,
        normalized_manufacturer=normalized_manufacturer,
        technical_attributes=attrs,
        ai_safe_text=safe_text,
        canonical_attribute_signature=signature,
        representation_version="1.0.0"
    )
