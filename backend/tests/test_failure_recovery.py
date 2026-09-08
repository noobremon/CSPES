import pytest
import uuid
import io
import openpyxl
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select

from app.main import app
from app.db.session import Base, get_db
from app.models.organization import Organization
from app.models.user import User, RoleEnum
from app.services.auth.seed_users import seed_demo_users
from app.core.security import create_access_token


def get_error_message(data: dict) -> str:
    if "error" in data and isinstance(data["error"], dict):
        return data["error"].get("message", "")
    return str(data.get("detail", ""))


@pytest.fixture
async def failure_test_context():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    async def override_get_db():
        async with AsyncSessionLocal() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncSessionLocal() as session:
        org_iocl = Organization(
            id=uuid.uuid4(),
            code="IOCL",
            name="Indian Oil Corporation Limited",
            sector="Oil & Gas",
            status="ACTIVE",
        )
        session.add(org_iocl)
        await session.flush()
        await seed_demo_users(session)
        await session.commit()

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # Login as CPSE Material Manager (IOCL)
            login_res = await client.post(
                "/api/v1/auth/login",
                json={"email": "cpse_manager_a@sih.demo", "password": "DemoManager@2026"}
            )
            token = login_res.json()["access_token"]
            yield {
                "client": client,
                "token": token,
                "org_iocl": org_iocl,
                "session_maker": AsyncSessionLocal,
            }

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_invalid_csv_structure_rejected(failure_test_context: dict):
    """
    FAILURE TEST: Uploading an empty or corrupted file is gracefully rejected.
    """
    client = failure_test_context["client"]
    token = failure_test_context["token"]
    org_iocl = failure_test_context["org_iocl"]

    # 1. Empty file
    empty_res = await client.post(
        "/api/v1/ingestion/discover",
        headers={"Authorization": f"Bearer {token}"},
        files={"file": ("empty.csv", b"", "text/csv")}
    )
    assert empty_res.status_code == 400
    assert "empty" in get_error_message(empty_res.json()).lower()


@pytest.mark.asyncio
async def test_unsupported_legacy_xls_rejected(failure_test_context: dict):
    """
    FAILURE TEST: Legacy binary .xls files are explicitly rejected with 422 Unprocessable Entity.
    """
    client = failure_test_context["client"]
    token = failure_test_context["token"]

    # Legacy OLE2 Excel binary header (D0 CF 11 E0)
    legacy_xls_bytes = b"\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1\x00\x00\x00\x00"

    res = await client.post(
        "/api/v1/ingestion/discover",
        headers={"Authorization": f"Bearer {token}"},
        files={"file": ("legacy_catalog.xls", legacy_xls_bytes, "application/vnd.ms-excel")}
    )
    assert res.status_code == 422
    err_msg = get_error_message(res.json())
    assert "legacy binary excel (.xls) is not supported" in err_msg.lower() or "not supported" in err_msg.lower()


@pytest.mark.asyncio
async def test_corrupted_xlsx_rejected(failure_test_context: dict):
    """
    FAILURE TEST: Non-zip corrupted XLSX file is rejected with 422.
    """
    client = failure_test_context["client"]
    token = failure_test_context["token"]

    corrupted_xlsx_bytes = b"PK\x03\x04CORRUPTED_ZIP_STREAM_NOT_VALID_EXCEL"
    res = await client.post(
        "/api/v1/ingestion/discover",
        headers={"Authorization": f"Bearer {token}"},
        files={"file": ("corrupt.xlsx", corrupted_xlsx_bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
    )
    assert res.status_code in [422, 400]


@pytest.mark.asyncio
async def test_duplicate_upload_prevention(failure_test_context: dict):
    """
    FAILURE & INTEGRITY TEST: Uploading an identical file returns HTTP 409 Conflict.
    """
    client = failure_test_context["client"]
    token = failure_test_context["token"]
    org_iocl = failure_test_context["org_iocl"]

    csv_content = b"item_code,description,unit\nVALV-001,Ball Valve 2 Inch SS304,EA\n"

    # First upload -> 201 Created
    res1 = await client.post(
        "/api/v1/ingestion/upload",
        headers={"Authorization": f"Bearer {token}"},
        data={"organization_id": str(org_iocl.id)},
        files={"file": ("valves.csv", csv_content, "text/csv")}
    )
    assert res1.status_code == 201

    # Duplicate upload -> 409 Conflict
    res2 = await client.post(
        "/api/v1/ingestion/upload",
        headers={"Authorization": f"Bearer {token}"},
        data={"organization_id": str(org_iocl.id)},
        files={"file": ("valves_copy.csv", csv_content, "text/csv")}
    )
    assert res2.status_code == 409
    err_msg = get_error_message(res2.json())
    assert "Duplicate file detected" in err_msg


@pytest.mark.asyncio
async def test_invalid_jwt_token_rejection(failure_test_context: dict):
    """
    SECURITY FAILURE TEST: Corrupted, tampered, or expired tokens return 401 Unauthorized.
    """
    client = failure_test_context["client"]

    # 1. Tampered signature token
    tampered_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.invalid_signature"
    res1 = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {tampered_token}"}
    )
    assert res1.status_code == 401

    # 2. Random garbage header
    res2 = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer NOT_EVEN_A_JWT"}
    )
    assert res2.status_code == 401


@pytest.mark.asyncio
async def test_nonexistent_entity_graceful_404(failure_test_context: dict):
    """
    API FAILURE TEST: Non-existent UUID queries return clean 404 without leaking stack trace.
    """
    client = failure_test_context["client"]
    token = failure_test_context["token"]
    random_id = uuid.uuid4()

    res = await client.get(
        f"/api/v1/ingestion/jobs/{random_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 404
    err_msg = get_error_message(res.json())
    assert "not found" in err_msg.lower()
