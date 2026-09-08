import re
from typing import List, Dict, Any, Optional


def extract_deterministic_attributes(description: str, specification_text: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Deterministic rule-based technical attribute extraction foundation.
    Uses regex patterns and controlled engineering dictionaries.
    Returns structured list of extracted attributes:
    [
        {
            "attribute_name": str,
            "original_value": str,
            "normalized_value": str,
            "normalized_unit": Optional[str],
            "data_type": "NUMERIC" | "STRING",
            "source": "RULE_EXTRACTOR",
            "confidence": float
        }
    ]
    """
    text = f"{description} {specification_text or ''}".strip()
    extracted: List[Dict[str, Any]] = []
    seen_attributes = set()

    def add_attr(name: str, orig: str, norm: str, unit: Optional[str], dtype: str = "STRING", conf: float = 0.95):
        key = (name, norm, unit)
        if key not in seen_attributes:
            seen_attributes.add(key)
            extracted.append({
                "attribute_name": name,
                "original_value": orig.strip(),
                "normalized_value": norm.strip(),
                "normalized_unit": unit,
                "data_type": dtype,
                "source": "RULE_EXTRACTOR",
                "confidence": conf
            })

    # 1. Thread Pitch / Fastener Thread (e.g. M16, M16x2, M20, UNC 1/2)
    m_thread = re.search(r"\b(M\d+(?:\.\d+)?(?:x\d+(?:\.\d+)?)?)\b", text, re.IGNORECASE)
    if m_thread:
        add_attr("thread_pitch", m_thread.group(1), m_thread.group(1).upper(), None, "STRING", 0.98)

    # 2. Diameter Extraction (e.g., 16MM DIA, DIA 25MM, 16 MM DIA, Ø20)
    m_dia = re.search(r"\b(\d+(?:\.\d+)?)\s*(?:MM|mm)?\s*(?:DIA|DIAMETER|OD)\b", text, re.IGNORECASE)
    if not m_dia:
        m_dia = re.search(r"\b(?:DIA|DIAMETER|Ø)\s*[:=]?\s*(\d+(?:\.\d+)?)\s*(?:MM|mm)?\b", text, re.IGNORECASE)
    if m_dia:
        val = m_dia.group(1)
        add_attr("diameter", m_dia.group(0), str(float(val)), "mm", "NUMERIC", 0.95)
    elif m_thread:
        # Infer diameter from metric thread (e.g. M16 -> 16mm)
        thread_match = re.search(r"M(\d+)", m_thread.group(1), re.IGNORECASE)
        if thread_match:
            val = thread_match.group(1)
            add_attr("diameter", f"{m_thread.group(1)} (Inferred)", str(float(val)), "mm", "NUMERIC", 0.90)

    # 3. Length Extraction (e.g. 50MM LENGTH, 50 MM LONG, or M16 x 50 MM)
    m_len = re.search(r"\b(\d+(?:\.\d+)?)\s*(?:MM|mm)?\s*(?:LENGTH|LONG|LEN)\b", text, re.IGNORECASE)
    if m_len:
        val = m_len.group(1)
        add_attr("length", m_len.group(0), str(float(val)), "mm", "NUMERIC", 0.95)
    else:
        # Check standard multiplier pattern: 16 x 50 or M16 x 50
        m_mult = re.search(r"\b(?:M?\d+)\s*[xX]\s*(\d+(?:\.\d+)?)\s*(?:MM|mm)?\b", text)
        if m_mult:
            val = m_mult.group(1)
            add_attr("length", m_mult.group(0), str(float(val)), "mm", "NUMERIC", 0.92)

    # 4. Material Metallurgy / Grade
    m_grade = re.search(
        r"\b(SS\s*304[LH]?|SS\s*316[LH]?|SS\s*321|A2-70|A4-80|ASTM\s*A216\s*WCB|A216\s*WCB|WCB|ASTM\s*A105|A105|ASTM\s*A350\s*LF2|ASTM\s*A193\s*B7|IS\s*2062|EN\s*10269)\b",
        text,
        re.IGNORECASE
    )
    if m_grade:
        raw_g = m_grade.group(1).upper().replace(" ", "")
        # Standardize representation
        if "304" in raw_g:
            norm_g = "SS304"
        elif "316" in raw_g:
            norm_g = "SS316"
        elif "WCB" in raw_g:
            norm_g = "ASTM A216 WCB"
        elif "A105" in raw_g:
            norm_g = "ASTM A105"
        else:
            norm_g = m_grade.group(1).upper()
        add_attr("material_grade", m_grade.group(1), norm_g, None, "STRING", 0.98)

    # 5. Pressure Class / Rating (e.g., CL300, CLASS 150, 300#, 16 BAR, 100 PSI)
    m_class = re.search(r"\b(?:CL|CLASS|#)\s*(\d+)\b", text, re.IGNORECASE)
    if not m_class:
        m_class = re.search(r"\b(\d+)\s*#\b", text)
    if m_class:
        add_attr("pressure_class", m_class.group(0), m_class.group(1), "class", "NUMERIC", 0.95)

    m_bar = re.search(r"\b(\d+(?:\.\d+)?)\s*(BAR|bar|PSI|psi|KPA|kpa|MPA|mpa)\b", text)
    if m_bar:
        val = m_bar.group(1)
        unit = m_bar.group(2).lower()
        add_attr("pressure_rating", m_bar.group(0), str(float(val)), unit, "NUMERIC", 0.95)

    # 6. Nominal Size / Pipe Bore (e.g. 2 INCH, 50MM NB, 50 NB, DN50, 2")
    m_nb = re.search(r"\b(\d+(?:\.\d+)?)\s*(?:MM\s*NB|NB)\b", text, re.IGNORECASE)
    if m_nb:
        val = m_nb.group(1)
        add_attr("nominal_size", m_nb.group(0), str(float(val)), "mm", "NUMERIC", 0.95)
    else:
        m_inch = re.search(r"\b(\d+(?:\.\d+)?)\s*(?:INCH|\"|IN)\b", text, re.IGNORECASE)
        if m_inch:
            val_inch = float(m_inch.group(1))
            # Conservative conversion to metric mm NB
            val_mm = round(val_inch * 25.4, 1)
            add_attr("nominal_size", m_inch.group(0), str(val_mm), "mm", "NUMERIC", 0.92)

    # 7. Electrical Voltage / Power / Speed / IP
    m_volt = re.search(r"\b(\d+(?:\.\d+)?)\s*(?:V|VAC|VDC)\b", text, re.IGNORECASE)
    if m_volt:
        add_attr("voltage", m_volt.group(0), str(float(m_volt.group(1))), "V", "NUMERIC", 0.95)

    m_power = re.search(r"\b(\d+(?:\.\d+)?)\s*(?:KW|HP|MW)\b", text, re.IGNORECASE)
    if m_power:
        unit = "kW" if "KW" in m_power.group(0).upper() else ("HP" if "HP" in m_power.group(0).upper() else "MW")
        add_attr("power_rating", m_power.group(0), str(float(m_power.group(1))), unit, "NUMERIC", 0.95)

    m_rpm = re.search(r"\b(\d+)\s*(?:RPM|rpm)\b", text)
    if m_rpm:
        add_attr("speed", m_rpm.group(0), m_rpm.group(1), "RPM", "NUMERIC", 0.95)

    m_ip = re.search(r"\b(IP\s*\d{2})\b", text, re.IGNORECASE)
    if m_ip:
        add_attr("ip_rating", m_ip.group(1), m_ip.group(1).upper().replace(" ", ""), None, "STRING", 0.98)

    # 8. Governing Engineering Standards (e.g. IS 1363, ISO 4016, DIN 933, ASME B16.34)
    m_std = re.search(r"\b(IS\s*[0-9]+|ISO\s*[0-9]+|DIN\s*[0-9]+|ASTM\s*[A-Z0-9]+|ASME\s*[A-Z0-9\.]+)\b", text, re.IGNORECASE)
    if m_std:
        add_attr("standard_code", m_std.group(1), m_std.group(1).upper(), None, "STRING", 0.96)

    return extracted
