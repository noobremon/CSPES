# Material Description & Unit Normalization Rules

**System:** AI-Powered National Unified Material Master Framework (SIH 2026)  
**Document Classification:** Engineering Standards & Data Quality (Phase 6)  
**Status:** `ACTIVE / AUDITED`

---

## 1. Text Sanitization & Cleaning Rules

1. **Whitespace Normalization:** Consecutive spaces, non-breaking spaces (`\u00a0`), and horizontal tabs are collapsed into single standard spaces. Leading and trailing whitespace is stripped.
2. **Punctuation Noise Removal:** Trailing semicolons, duplicate commas, and orphaned punctuation characters are removed.
3. **Dimension Multiplier Standardization:** Dimension representations such as `16 X 50`, `16X50`, `M16 x 50`, or `16*50` are standardized to `16 x 50` with consistent single spacing.
4. **Standard Notation Spacing:** Standard identifiers (e.g. `IS-1363`, `ISO4016`, `ASTM_A216`) are normalized with single spacing (e.g. `IS 1363`, `ISO 4016`, `ASTM A216`).
5. **Grade Standardization:** Metallurgy abbreviations such as `SS-304`, `SS 304`, or `ss304` are standardized to `SS304`.

---

## 2. Unit of Measure (UOM) Normalization Dictionary

The platform applies a **conservative unit normalization dictionary** to standardize variations without performing lossy dimensional conversions:

| Raw Source UOM Variations | Normalized Canonical UOM | Physical Quantity |
|---|---|---|
| `NOS`, `NO`, `NOS.`, `EA`, `EACH`, `NUMBER`, `NUMBERS`, `PIECE`, `PIECES`, `PC`, `PCS`, `UNIT`, `UNITS` | **`EA`** | Discrete Count |
| `MM`, `MM.`, `MILLIMETRE`, `MILLIMETRES`, `MILLIMETER`, `MILLIMETERS` | **`mm`** | Length (Millimeters) |
| `CM`, `CENTIMETRE`, `CENTIMETER` | **`cm`** | Length (Centimeters) |
| `M`, `MTR`, `METER`, `METRE`, `METERS`, `METRES` | **`m`** | Length (Meters) |
| `KM`, `KILOMETER`, `KILOMETRE` | **`km`** | Length (Kilometers) |
| `KG`, `KGS`, `KILOGRAM`, `KILOGRAMS` | **`kg`** | Mass (Kilograms) |
| `GM`, `GMS`, `GRAM`, `GRAMS` | **`g`** | Mass (Grams) |
| `MT`, `TONNE`, `TONNES`, `METRIC TON` | **`MT`** | Mass (Metric Tonnes) |
| `L`, `LTR`, `LTRS`, `LITRE`, `LITRES`, `LITER`, `LITERS` | **`L`** | Volume (Liters) |
| `ML`, `MILLILITRE` | **`mL`** | Volume (Milliliters) |
| `SET`, `SETS` | **`SET`** | Packaging Assembly |
| `ROLL`, `ROLLS` | **`ROLL`** | Coil / Roll |
| `PKT`, `PACK`, `PACKET`, `PACKETS` | **`PKT`** | Packet / Package |
| `BOX`, `BOXES` | **`BOX`** | Box |
| `PAIR`, `PAIRS` | **`PAIR`** | Pair |
| `DRUM`, `DRUMS` | **`DRUM`** | Drum / Barrel |

---

## 3. Deterministic Technical Attribute Extraction Rules

Deterministic regex and pattern matchers extract structured engineering specifications into `material_attributes`:

| Attribute Name | Extracted Pattern Examples | Normalized Value | Normalized Unit | Data Type |
|---|---|---|---|---|
| `thread_pitch` | `M16`, `M20x2.5`, `UNC 1/2` | `M16` | `None` | `STRING` |
| `diameter` | `16MM DIA`, `DIA 25MM`, `Ø16` | `16.0` | `mm` | `NUMERIC` |
| `length` | `50 MM LENGTH`, `50mm LONG`, `16 x 50` | `50.0` | `mm` | `NUMERIC` |
| `material_grade` | `SS304`, `A2-70`, `A216 WCB`, `IS 2062` | `SS304`, `ASTM A216 WCB` | `None` | `STRING` |
| `pressure_class` | `CL300`, `CLASS 150`, `300#` | `300` | `class` | `NUMERIC` |
| `pressure_rating` | `16 BAR`, `150 PSI` | `16.0` | `bar`, `psi` | `NUMERIC` |
| `nominal_size` | `2 INCH`, `50MM NB`, `DN50`, `4"` | `50.8`, `50.0` | `mm` | `NUMERIC` |
| `voltage` | `415V`, `220VAC`, `11KV` | `415.0` | `V` | `NUMERIC` |
| `power_rating` | `75KW`, `100HP` | `75.0` | `kW`, `HP` | `NUMERIC` |
| `speed` | `1480RPM`, `3000 RPM` | `1480` | `RPM` | `NUMERIC` |
| `ip_rating` | `IP55`, `IP 65`, `IP68` | `IP55` | `None` | `STRING` |
| `standard_code` | `IS 1363`, `ISO 4016`, `ASME B16.34` | `IS 1363` | `None` | `STRING` |

> [!NOTE]
> All extraction rules are strictly deterministic and rule-based. No live sentence-transformer or external AI model inference is claimed or utilized during Phase 6.
