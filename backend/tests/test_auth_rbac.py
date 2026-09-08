import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select
from fastapi import HTTPException

from app.main import app
from app.db.session import Base, get_db
from app.models.user import User, RoleEnum, UserStatus
from app.models.organization import Organization
from app.models.governance import AuditLog
from app.models.cnmc import CNMCCandidate
from app.core.security import get_password_hash, create_access_token, clear_revoked_jtis
from app.core.deps import validate_raw_layer1_access, validate_tenant_access
from app.core.config import settings
from app.services.auth.seed_users import seed_demo_users


def get_error_message(data: dict) -> str:
    """Helper to extract error message from standardized API error format."""
    if "error" in data and isinstance(data["error"], dict):
        return data["error"].get("message", "")
    return str(data.get("detail", ""))


@pytest.fixture
async def auth_test_context():
    """
    Creates an isolated in-memory SQLite database, configures FastAPI get_db override,
    creates test organizations, and seeds demo users.
    """
    clear_revoked_jtis()
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    async def override_get_db():
        async with AsyncSessionLocal() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncSessionLocal() as session:
        # Create test organizations
        org_iocl = Organization(
            id=uuid.uuid4(),
            code="IOCL",
            name="Indian Oil Corporation Limited",
            sector="Oil & Gas",
            status="ACTIVE",
        )
        org_ongc = Organization(
            id=uuid.uuid4(),
            code="ONGC",
            name="Oil and Natural Gas Corporation",
            sector="Oil & Gas",
            status="ACTIVE",
        )
        session.add_all([org_iocl, org_ongc])
        await session.flush()

        # Seed demo users
        users = await seed_demo_users(session)
        await session.commit()

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            yield {
                "client": client,
                "session": session,
                "session_maker": AsyncSessionLocal,
                "org_iocl": org_iocl,
                "org_ongc": org_ongc,
                "users": users,
            }

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_seed_demo_users_created(auth_test_context: dict):
    """
    Verifies that seed_demo_users registers all 5 standard SIH demo accounts.
    """
    async with auth_test_context["session_maker"]() as session:
        stmt = select(User)
        res = await session.execute(stmt)
        users = res.scalars().all()
        assert len(users) >= 5

        emails = [u.email for u in users]
        assert "national_admin@sih.demo" in emails
        assert "cpse_manager_a@sih.demo" in emails
        assert "cpse_manager_b@sih.demo" in emails
        assert "domain_reviewer@sih.demo" in emails
        assert "auditor@sih.demo" in emails


@pytest.mark.asyncio
async def test_seed_demo_users_rejected_in_production(auth_test_context: dict):
    """
    SECURITY AUDIT ISSUE 1:
    Verifies that POST /api/v1/auth/seed-demo-users is permanently disabled and rejected
    with 403 Forbidden in production environments.
    """
    client = auth_test_context["client"]
    
    # Temporarily set ENVIRONMENT to production
    original_env = settings.ENVIRONMENT
    settings.ENVIRONMENT = "production"
    try:
        res = await client.post("/api/v1/auth/seed-demo-users")
        assert res.status_code == 403
        err_msg = get_error_message(res.json())
        assert "permanently disabled in production" in err_msg
    finally:
        settings.ENVIRONMENT = original_env


@pytest.mark.asyncio
async def test_login_success_and_jwt_tokens(auth_test_context: dict):
    """
    Verifies successful login returns access_token, refresh_token, and user profile.
    """
    client = auth_test_context["client"]
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "national_admin@sih.demo",
            "password": "DemoAdmin@2026",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "Bearer"
    assert data["user"]["email"] == "national_admin@sih.demo"
    assert data["user"]["role"] == "NATIONAL_MASTER_ADMIN"


@pytest.mark.asyncio
async def test_login_invalid_password(auth_test_context: dict):
    """
    Verifies 401 on incorrect password and records sanitized audit log.
    """
    client = auth_test_context["client"]
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "national_admin@sih.demo",
            "password": "WrongPassword!999",
        },
    )
    assert response.status_code == 401
    err_msg = get_error_message(response.json())
    assert "Invalid email or password" in err_msg

    # Verify audit failure logged
    async with auth_test_context["session_maker"]() as session:
        stmt = select(AuditLog).where(
            AuditLog.action == "LOGIN_FAILURE",
            AuditLog.actor_reference == "national_admin@sih.demo"
        )
        res = await session.execute(stmt)
        log = res.scalars().first()
        assert log is not None
        assert "WrongPassword" not in str(log.metadata_payload)


@pytest.mark.asyncio
async def test_login_unknown_email(auth_test_context: dict):
    """
    Verifies 401 for non-existent email.
    """
    client = auth_test_context["client"]
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "nonexistent@sih.demo",
            "password": "SomePassword@123",
        },
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_login_inactive_user(auth_test_context: dict):
    """
    Verifies 403 when user account is inactive.
    """
    async with auth_test_context["session_maker"]() as session:
        inactive_user = User(
            id=uuid.uuid4(),
            email="inactive@sih.demo",
            hashed_password=get_password_hash("Password@123"),
            full_name="Inactive User",
            role=RoleEnum.CPSE_MATERIAL_MANAGER,
            status=UserStatus.INACTIVE,
        )
        session.add(inactive_user)
        await session.commit()

    client = auth_test_context["client"]
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "inactive@sih.demo",
            "password": "Password@123",
        },
    )
    assert response.status_code == 403
    err_msg = get_error_message(response.json())
    assert "INACTIVE" in err_msg


@pytest.mark.asyncio
async def test_get_me_authenticated_vs_unauthenticated(auth_test_context: dict):
    """
    Verifies GET /auth/me returns profile when authenticated and 401 when missing token.
    """
    client = auth_test_context["client"]

    # Unauthenticated request
    unauth_res = await client.get("/api/v1/auth/me")
    assert unauth_res.status_code == 401

    # Login to get token
    login_res = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "domain_reviewer@sih.demo",
            "password": "DemoReviewer@2026",
        },
    )
    token = login_res.json()["access_token"]

    # Authenticated request
    auth_res = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert auth_res.status_code == 200
    me_data = auth_res.json()
    assert me_data["email"] == "domain_reviewer@sih.demo"
    assert me_data["role"] == "DOMAIN_REVIEWER"


@pytest.mark.asyncio
async def test_logout_endpoint_and_token_invalidation(auth_test_context: dict):
    """
    Verifies logout action, token JTI revocation, and audit logging.
    """
    client = auth_test_context["client"]
    login_res = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "auditor@sih.demo",
            "password": "DemoAuditor@2026",
        },
    )
    token = login_res.json()["access_token"]

    logout_res = await client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert logout_res.status_code == 200
    assert logout_res.json()["success"] is True

    # After logout, accessing /me with revoked token returns 401
    post_logout_me = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert post_logout_me.status_code == 401


@pytest.mark.asyncio
async def test_refresh_token_rotation_and_replay_prevention(auth_test_context: dict):
    """
    SECURITY AUDIT ISSUE 5:
    Verifies that:
    1. Login returns valid refresh token.
    2. Refresh endpoint issues new access and new refresh tokens.
    3. Old refresh token is revoked immediately upon rotation.
    4. Replaying the old refresh token is strictly rejected (401 Unauthorized).
    5. New refresh token can be used successfully.
    """
    client = auth_test_context["client"]
    login_res = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "domain_reviewer@sih.demo",
            "password": "DemoReviewer@2026",
        },
    )
    initial_refresh_token = login_res.json()["refresh_token"]

    # 1. Use initial refresh token -> Success
    refresh_res_1 = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": initial_refresh_token}
    )
    assert refresh_res_1.status_code == 200
    data_1 = refresh_res_1.json()
    new_refresh_token_1 = data_1["refresh_token"]
    assert new_refresh_token_1 != initial_refresh_token

    # 2. Replay initial refresh token -> REJECTED (401)
    replay_res = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": initial_refresh_token}
    )
    assert replay_res.status_code == 401
    err_msg = get_error_message(replay_res.json())
    assert "rotated or revoked" in err_msg

    # 3. Use new rotated refresh token -> Success
    refresh_res_2 = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": new_refresh_token_1}
    )
    assert refresh_res_2.status_code == 200
    data_2 = refresh_res_2.json()
    new_refresh_token_2 = data_2["refresh_token"]
    assert new_refresh_token_2 != new_refresh_token_1


@pytest.mark.asyncio
async def test_national_admin_blocked_from_raw_layer1_access(auth_test_context: dict):
    """
    SECURITY AUDIT ISSUE 3:
    Verifies that NATIONAL_MASTER_ADMIN, DOMAIN_REVIEWER, and AUDITOR cannot automatically
    access or manipulate tenant-private Layer 1 ERP files and PO/vendor data.
    """
    org_iocl = auth_test_context["org_iocl"]
    
    # Create mock user objects
    admin_user = User(
        id=uuid.uuid4(),
        email="admin@test.com",
        role=RoleEnum.NATIONAL_MASTER_ADMIN,
        organization_id=None
    )
    reviewer_user = User(
        id=uuid.uuid4(),
        email="reviewer@test.com",
        role=RoleEnum.DOMAIN_REVIEWER,
        organization_id=None
    )
    auditor_user = User(
        id=uuid.uuid4(),
        email="auditor@test.com",
        role=RoleEnum.AUDITOR,
        organization_id=None
    )
    manager_iocl = User(
        id=uuid.uuid4(),
        email="manager@iocl.com",
        role=RoleEnum.CPSE_MATERIAL_MANAGER,
        organization_id=org_iocl.id
    )

    # 1. National Admin is BLOCKED from raw layer 1 access
    with pytest.raises(HTTPException) as exc_info:
        validate_raw_layer1_access(org_iocl.id, admin_user)
    assert exc_info.value.status_code == 403
    assert "strictly restricted to the assigned CPSE Material Manager" in str(exc_info.value.detail)

    # 2. Domain Reviewer is BLOCKED
    with pytest.raises(HTTPException) as exc_info:
        validate_raw_layer1_access(org_iocl.id, reviewer_user)
    assert exc_info.value.status_code == 403

    # 3. Auditor is BLOCKED
    with pytest.raises(HTTPException) as exc_info:
        validate_raw_layer1_access(org_iocl.id, auditor_user)
    assert exc_info.value.status_code == 403

    # 4. Assigned CPSE Material Manager is ALLOWED
    assert validate_raw_layer1_access(org_iocl.id, manager_iocl) is True


@pytest.mark.asyncio
async def test_tenant_isolation_on_upload(auth_test_context: dict):
    """
    Verifies that a CPSE Material Manager cannot upload or manipulate data for another CPSE.
    """
    client = auth_test_context["client"]
    org_iocl = auth_test_context["org_iocl"]
    org_ongc = auth_test_context["org_ongc"]

    # Login as CPSE Manager A (IOCL)
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "cpse_manager_a@sih.demo", "password": "DemoManager@2026"}
    )
    token = login_res.json()["access_token"]

    csv_content = b"local_material_code,local_description,unit_of_measure\nMAT-TEST-01,Carbon Steel Valve 2 Inch,EA\n"

    # Attempt to upload to ONGC (Forbidden cross-tenant)
    cross_tenant_res = await client.post(
        "/api/v1/ingestion/upload",
        headers={"Authorization": f"Bearer {token}"},
        data={"organization_id": str(org_ongc.id)},
        files={"file": ("test.csv", csv_content, "text/csv")}
    )
    assert cross_tenant_res.status_code == 403
    err_msg = get_error_message(cross_tenant_res.json())
    assert "Cross-tenant access denied" in err_msg

    # Upload to own organization IOCL (Allowed)
    own_tenant_res = await client.post(
        "/api/v1/ingestion/upload",
        headers={"Authorization": f"Bearer {token}"},
        data={"organization_id": str(org_iocl.id)},
        files={"file": ("test_own.csv", csv_content, "text/csv")}
    )
    assert own_tenant_res.status_code == 201


@pytest.mark.asyncio
async def test_governance_review_role_authorization(auth_test_context: dict):
    """
    Verifies that Domain Reviewers can review candidates, while CPSE Managers and Auditors are rejected.
    """
    client = auth_test_context["client"]

    # Create candidate in db
    candidate_id = uuid.uuid4()
    async with auth_test_context["session_maker"]() as session:
        candidate = CNMCCandidate(
            id=candidate_id,
            proposed_cnmc="IN-IND-MECH-BLT-00999",
            candidate_group_name="Hex Bolt M20 Grade SS316",
            proposed_description="Prototype specification for M20 SS316 Bolt",
            confidence_score=0.92,
            recommendation_explanation='{"summary": "Test explanation"}',
            generation_source="ENGINE_V1_TAXONOMY_RULE_BASED",
            status="PENDING_REVIEW"
        )
        session.add(candidate)
        await session.commit()

    # 1. CPSE Manager attempts review -> 403 Forbidden
    login_cpse = await client.post("/api/v1/auth/login", json={"email": "cpse_manager_a@sih.demo", "password": "DemoManager@2026"})
    token_cpse = login_cpse.json()["access_token"]

    res_cpse = await client.post(
        f"/api/v1/cnmc/candidates/{candidate_id}/review",
        headers={"Authorization": f"Bearer {token_cpse}"},
        json={"action": "APPROVE"}
    )
    assert res_cpse.status_code == 403
    err_msg = get_error_message(res_cpse.json())
    assert "require DOMAIN_REVIEWER or NATIONAL_MASTER_ADMIN" in err_msg

    # 2. Auditor attempts review -> 403 Forbidden
    login_auditor = await client.post("/api/v1/auth/login", json={"email": "auditor@sih.demo", "password": "DemoAuditor@2026"})
    token_auditor = login_auditor.json()["access_token"]

    res_auditor = await client.post(
        f"/api/v1/cnmc/candidates/{candidate_id}/review",
        headers={"Authorization": f"Bearer {token_auditor}"},
        json={"action": "APPROVE"}
    )
    assert res_auditor.status_code == 403

    # 3. Domain Reviewer submits review -> 200 OK
    login_reviewer = await client.post("/api/v1/auth/login", json={"email": "domain_reviewer@sih.demo", "password": "DemoReviewer@2026"})
    token_reviewer = login_reviewer.json()["access_token"]

    res_reviewer = await client.post(
        f"/api/v1/cnmc/candidates/{candidate_id}/review",
        headers={"Authorization": f"Bearer {token_reviewer}"},
        json={"action": "APPROVE", "comments": "Approved prototype master spec"}
    )
    assert res_reviewer.status_code == 200
    assert res_reviewer.json()["decision"] == "APPROVE"
    assert res_reviewer.json()["new_status"] == "APPROVED"
