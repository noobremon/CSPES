import re
from typing import Tuple, Dict, Any, Optional

# Controlled Unit Normalization Dictionary (Conservative Mapping)
UOM_NORMALIZATION_MAP: Dict[str, str] = {
    # Count / Discrete Units
    "NOS": "EA",
    "NO": "EA",
    "NOS.": "EA",
    "EA": "EA",
    "EACH": "EA",
    "NUMBER": "EA",
    "NUMBERS": "EA",
    "PIECE": "EA",
    "PIECES": "EA",
    "PC": "EA",
    "PCS": "EA",
    "UNIT": "EA",
    "UNITS": "EA",

    # Length Units
    "MM": "mm",
    "MM.": "mm",
    "MILLIMETRE": "mm",
    "MILLIMETRES": "mm",
    "MILLIMETER": "mm",
    "MILLIMETERS": "mm",
    "CM": "cm",
    "CENTIMETRE": "cm",
    "CENTIMETER": "cm",
    "M": "m",
    "MTR": "m",
    "METER": "m",
    "METRE": "m",
    "METERS": "m",
    "METRES": "m",
    "KM": "km",
    "KILOMETER": "km",
    "KILOMETRE": "km",

    # Mass / Weight Units
    "KG": "kg",
    "KGS": "kg",
    "KILOGRAM": "kg",
    "KILOGRAMS": "kg",
    "GM": "g",
    "GMS": "g",
    "GRAM": "g",
    "GRAMS": "g",
    "MT": "MT",
    "TONNE": "MT",
    "TONNES": "MT",
    "METRIC TON": "MT",

    # Volume Units
    "L": "L",
    "LTR": "L",
    "LTRS": "L",
    "LITRE": "L",
    "LITRES": "L",
    "LITER": "L",
    "LITERS": "L",
    "ML": "mL",
    "MILLILITRE": "mL",

    # Packaging / Sets
    "SET": "SET",
    "SETS": "SET",
    "ROLL": "ROLL",
    "ROLLS": "ROLL",
    "PKT": "PKT",
    "PACK": "PKT",
    "PACKET": "PKT",
    "PACKETS": "PKT",
    "BOX": "BOX",
    "BOXES": "BOX",
    "PAIR": "PAIR",
    "PAIRS": "PAIR",
    "DRUM": "DRUM",
    "DRUMS": "DRUM",
}


def normalize_whitespace_and_casing(text: str) -> str:
    """Cleans excess spaces, non-printable characters, and formatting noise."""
    if not text:
        return ""
    # Replace non-breaking spaces and tabs
    cleaned = text.replace("\u00a0", " ").replace("\t", " ")
    # Replace trailing or redundant semicolons, commas
    cleaned = re.sub(r"[;]{2,}", ";", cleaned)
    cleaned = re.sub(r"[,]{2,}", ",", cleaned)
    # Collapse multiple spaces into single space
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    # Strip trailing punctuation noise
    cleaned = re.sub(r"[;,]+$", "", cleaned).strip()
    return cleaned


def normalize_uom(raw_uom: str) -> Tuple[str, bool]:
    """
    Normalizes unit of measure conservatively.
    Returns: (normalized_uom, was_recognized)
    """
    if not raw_uom:
        return "EA", False

    lookup_key = raw_uom.strip().upper()
    if lookup_key in UOM_NORMALIZATION_MAP:
        return UOM_NORMALIZATION_MAP[lookup_key], True

    # Check for basic clean lowercase
    return raw_uom.strip(), False


def normalize_material_text(raw_description: str, specification_text: Optional[str] = None) -> str:
    """
    Applies standard industrial text normalization rules:
    - Standardizes dimension multiplier formatting (e.g. '16 X 50' -> '16 x 50')
    - Normalizes common grade representations (e.g. SS-304 -> SS304)
    - Normalizes standard prefix spacings (e.g. IS-1363 -> IS 1363)
    """
    combined = raw_description
    if specification_text and specification_text.strip():
        combined = f"{raw_description} {specification_text}"

    text = normalize_whitespace_and_casing(combined)

    # Standardize dimension multiplier formatting only between numbers or isolated 'X'
    text = re.sub(r"(\bM\d+)\s*[xX×*]\s*(\d+)", r"\1 x \2", text, flags=re.IGNORECASE)
    text = re.sub(r"(\d+)\s*[xX×*]\s*(\d+)", r"\1 x \2", text)
    text = re.sub(r"\s+\b[xX×*]\b\s+", " x ", text)

    # Normalize stainless steel grade notations
    text = re.sub(r"\bSS\s*[-_]?\s*([0-9]{3}[A-Za-z]?)\b", r"SS\1", text, flags=re.IGNORECASE)

    # Normalize standard prefix spacings (e.g. IS-1363 -> IS 1363, ISO-4016 -> ISO 4016)
    text = re.sub(r"\b(IS|ISO|DIN|ASTM|ASME)\s*[-_]?\s*([0-9]+)\b", r"\1 \2", text, flags=re.IGNORECASE)

    return normalize_whitespace_and_casing(text)
