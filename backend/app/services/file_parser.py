import csv
import hashlib
import io
import os
from typing import List, Dict, Any, Tuple
import openpyxl


def compute_file_hash(content: bytes) -> str:
    """Computes SHA-256 checksum of raw file bytes for duplicate upload protection."""
    return hashlib.sha256(content).hexdigest()


def detect_file_type(filename: str, content: bytes) -> str:
    """
    Detects file format based on extension and signature.
    Explicitly supports OpenXML Excel (.xlsx) and CSV (.csv).
    Explicitly rejects legacy binary Excel (.xls).
    """
    lower = filename.lower()
    if lower.endswith(".xls") and not lower.endswith(".xlsx"):
        raise ValueError(
            "Legacy binary Excel format (.xls) is not supported. "
            "Please convert the file to OpenXML Excel (.xlsx) or standard CSV format."
        )
    elif lower.endswith(".xlsx"):
        return "EXCEL"
    elif lower.endswith(".csv"):
        return "CSV"

    # Magic bytes check for ZIP (Excel .xlsx is an OpenXML zip package)
    if content.startswith(b"PK\x03\x04"):
        return "EXCEL"
    
    return "CSV"


def parse_csv_stream(
    content_bytes: bytes,
    preview_limit: int = 5
) -> Tuple[List[str], int, List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Parses CSV content with robust encoding detection and delimiter sniffing.
    Returns: (columns, total_row_count, sample_rows, all_rows)
    """
    # Attempt UTF-8 then fallback to Latin-1
    try:
        text = content_bytes.decode("utf-8-sig")
    except UnicodeDecodeError:
        text = content_bytes.decode("latin-1")

    lines = [line for line in text.splitlines() if line.strip()]
    if not lines:
        raise ValueError("The uploaded CSV file is empty.")

    # Sniff delimiter
    sample = "\n".join(lines[:10])
    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=",;\t|")
        delimiter = dialect.delimiter
    except Exception:
        delimiter = ","

    reader = csv.reader(io.StringIO(text), delimiter=delimiter)
    try:
        headers = next(reader)
    except StopIteration:
        raise ValueError("The uploaded CSV file does not contain a header row.")

    # Clean headers
    cleaned_headers = [h.strip() for h in headers if h.strip()]
    if not cleaned_headers:
        raise ValueError("No valid column headers found in CSV.")

    all_rows: List[Dict[str, Any]] = []
    for row in reader:
        if not any(cell.strip() for cell in row):
            continue
        row_dict = {}
        for idx, header in enumerate(cleaned_headers):
            val = row[idx].strip() if idx < len(row) else ""
            row_dict[header] = val
        all_rows.append(row_dict)

    sample_rows = all_rows[:preview_limit]
    return cleaned_headers, len(all_rows), sample_rows, all_rows


def parse_excel_stream(
    content_bytes: bytes,
    preview_limit: int = 5
) -> Tuple[List[str], int, List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Parses Excel (.xlsx) workbook content via openpyxl.
    Returns: (columns, total_row_count, sample_rows, all_rows)
    """
    try:
        wb = openpyxl.load_workbook(io.BytesIO(content_bytes), data_only=True, read_only=True)
    except Exception as e:
        raise ValueError(f"Failed to parse Excel file: {str(e)}")

    sheet = wb.active
    if not sheet:
        raise ValueError("Excel file contains no active worksheet.")

    rows_iter = sheet.iter_rows(values_only=True)
    try:
        header_row = next(rows_iter)
    except StopIteration:
        raise ValueError("Excel worksheet is empty.")

    cleaned_headers = []
    for idx, cell in enumerate(header_row):
        if cell is not None and str(cell).strip():
            cleaned_headers.append(str(cell).strip())
        else:
            cleaned_headers.append(f"Column_{idx + 1}")

    all_rows: List[Dict[str, Any]] = []
    for row in rows_iter:
        if not any(cell is not None and str(cell).strip() for cell in row):
            continue
        row_dict = {}
        for idx, header in enumerate(cleaned_headers):
            val = row[idx] if idx < len(row) and row[idx] is not None else ""
            row_dict[header] = str(val).strip()
        all_rows.append(row_dict)

    wb.close()
    sample_rows = all_rows[:preview_limit]
    return cleaned_headers, len(all_rows), sample_rows, all_rows


def suggest_canonical_column_mapping(columns: List[str]) -> Dict[str, str]:
    """
    Heuristically discovers and maps CPSE legacy column headers to canonical fields.
    """
    mapping = {}
    col_lower_map = {col.lower().replace("_", "").replace(" ", "").replace("-", ""): col for col in columns}

    # Canonical matching patterns
    patterns = {
        "material_code": ["materialcode", "matcode", "itemcode", "itemno", "itemnumber", "code", "partno", "partnumber", "materialnumber"],
        "description": ["materialdescription", "matdesc", "itemdescription", "itemdesc", "description", "desc", "shortdesc", "title"],
        "specification": ["technicalspecification", "specification", "specs", "spec", "itemspec", "techspec", "details"],
        "unit_of_measure": ["unitofmeasure", "uom", "unit", "baseuom", "measureunit", "units"],
        "category": ["materialgroup", "category", "classification", "group", "itemgroup", "matgroup"],
        "manufacturer": ["manufacturer", "mfr", "oem", "oemname", "maker", "brand", "supplier"],
        "oem_part_number": ["oempartno", "oempartnumber", "mfrpartno", "drawingno", "partnum"]
    }

    for canonical, variations in patterns.items():
        for var in variations:
            if var in col_lower_map:
                mapping[canonical] = col_lower_map[var]
                break

    return mapping
