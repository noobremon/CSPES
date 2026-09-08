import pytest
import time
import uuid
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select

from app.db.session import Base
from app.models.organization import Organization
from app.services.normalization import normalize_material_text
from app.services.attribute_extractor import extract_deterministic_attributes
from app.services.matching.text_similarity import compute_token_jaccard, compute_sequence_ratio, _tokenize
from app.services.cnmc.generator import generate_prototype_cnmc_code
from app.services.file_parser import parse_csv_stream


@pytest.fixture
async def bench_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    async with AsyncSessionLocal() as session:
        yield session


def generate_synthetic_catalog_csv(count: int) -> bytes:
    lines = ["local_material_code,local_description,unit_of_measure,category_name"]
    categories = ["Fasteners", "Valves", "Pumps", "Electrical", "Pipes"]
    nouns = ["Bolt Hex", "Gate Valve", "Centrifugal Pump", "Copper Cable", "Seamless Pipe"]
    for i in range(count):
        cat = categories[i % len(categories)]
        noun = nouns[i % len(nouns)]
        line = f"MAT-{i:05d},{noun} M{12 + (i%20)} x {50 + (i%50)} mm Grade SS304 IS 1363,NOS,{cat}"
        lines.append(line)
    return "\n".join(lines).encode("utf-8")


def test_benchmark_csv_parsing_100_items():
    """
    PERFORMANCE BASELINE: CSV Stream Ingestion Parser (100 items).
    Status: ACTUALLY MEASURED (TEST HARNESS)
    """
    csv_bytes = generate_synthetic_catalog_csv(100)
    start = time.perf_counter()
    headers, total_rows, sample_rows, rows = parse_csv_stream(csv_bytes)
    duration_ms = (time.perf_counter() - start) * 1000

    assert total_rows == 100
    assert len(rows) == 100
    print(f"\n[BENCHMARK] CSV Parsing 100 items: {duration_ms:.2f} ms (ACTUALLY MEASURED)")
    assert duration_ms < 1000.0  # Must parse 100 items under 1s


def test_benchmark_csv_parsing_1000_items():
    """
    PERFORMANCE BASELINE: CSV Stream Ingestion Parser (1,000 items).
    Status: ACTUALLY MEASURED (TEST HARNESS)
    """
    csv_bytes = generate_synthetic_catalog_csv(1000)
    start = time.perf_counter()
    headers, total_rows, sample_rows, rows = parse_csv_stream(csv_bytes)
    duration_ms = (time.perf_counter() - start) * 1000

    assert total_rows == 1000
    assert len(rows) == 1000
    print(f"\n[BENCHMARK] CSV Parsing 1,000 items: {duration_ms:.2f} ms (ACTUALLY MEASURED)")
    assert duration_ms < 2000.0  # Must parse 1,000 items under 2s


def test_benchmark_normalization_100_items():
    """
    PERFORMANCE BASELINE: Text Normalization & Attribute Extraction (100 items).
    Status: ACTUALLY MEASURED (TEST HARNESS)
    """
    descriptions = [
        f"Hexagon Head Bolt M{12 + (i%20)} x {50 + (i%50)} mm Grade SS304 (IS 1363)"
        for i in range(100)
    ]
    start = time.perf_counter()
    for desc in descriptions:
        norm_desc = normalize_material_text(desc)
        attrs = extract_deterministic_attributes(desc)
    duration_ms = (time.perf_counter() - start) * 1000

    throughput_per_sec = 100 / (duration_ms / 1000)
    print(f"\n[BENCHMARK] Normalization 100 items: {duration_ms:.2f} ms ({throughput_per_sec:.0f} items/sec) (ACTUALLY MEASURED)")
    assert duration_ms < 1000.0


def test_benchmark_similarity_matching_100_pairs():
    """
    PERFORMANCE BASELINE: Token Similarity Scoring (100 candidate pairs).
    Status: ACTUALLY MEASURED (TEST HARNESS)
    """
    text_a = "Hexagon Head Bolt M16 x 50 mm SS304"
    toks_a = set(_tokenize(text_a))
    
    start = time.perf_counter()
    for i in range(100):
        text_b = f"Hex Head Bolt M{16 + (i%2)} x 50 mm Stainless Steel 304"
        toks_b = set(_tokenize(text_b))
        jaccard = compute_token_jaccard(toks_a, toks_b)
        seq = compute_sequence_ratio(text_a, text_b)
    duration_ms = (time.perf_counter() - start) * 1000

    print(f"\n[BENCHMARK] Token Similarity 100 pairs: {duration_ms:.2f} ms (ACTUALLY MEASURED)")
    assert duration_ms < 1500.0


def test_benchmark_cnmc_recommendation_100_items():
    """
    PERFORMANCE BASELINE: Rule-Based CNMC Recommendation Generation (100 items).
    Status: ACTUALLY MEASURED (TEST HARNESS)
    """
    start = time.perf_counter()
    for i in range(100):
        code = generate_prototype_cnmc_code(
            country_code="IN",
            sector_or_family="IND",
            category_code="MECH",
            material_type_code="BLT",
            sequence_num=i+1
        )
    duration_ms = (time.perf_counter() - start) * 1000

    print(f"\n[BENCHMARK] CNMC Prototype Code Generator 100 items: {duration_ms:.2f} ms (ACTUALLY MEASURED)")
    assert duration_ms < 1000.0
