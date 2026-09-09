from datetime import datetime, timezone, timedelta
from typing import Optional, List, Any
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.models.user import User, RoleEnum, UserStatus
from app.models.organization import Organization
from app.models.governance import AuditLog
from app.schemas.auth import (
    LoginRequest,
    TokenResponse,
    UserResponse,
    RefreshTokenRequest,
    AuthMessageResponse,
    UserCreateRequest,
)
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
    revoke_token_jti,
    is_token_jti_revoked,
)
from app.core.deps import get_current_user, require_authenticated_user, require_roles
from app.core.config import settings
from app.services.auth.seed_users import seed_demo_users

router = APIRouter()


def format_user_response(user: User) -> UserResponse:
    org_code = user.organization.code if user.organization else None
    org_name = user.organization.name if user.organization else None
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        organization_id=user.organization_id,
        organization_code=org_code,
        organization_name=org_name,
        status=user.status,
        last_login_at=user.last_login_at,
        created_at=user.created_at,
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    req: LoginRequest,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """
    Authenticates a user with corporate email and password.
    Returns short-lived JWT access token, refresh token, and user profile.
    Records audit event with credential sanitization.
    """
    client_ip = request.client.host if request.client else "unknown"

    # Query user by email
    stmt = select(User).where(User.email == req.email.lower().strip())
    res = await db.execute(stmt)
    user = res.scalars().first()

    # Self-healing demo account provisioning if database was migrated without manual seed
    if not user:
        from app.services.auth.seed_users import DEMO_USERS
        # Check if requested email is a known demo account
        is_demo_account = any(d["email"].lower() == req.email.lower().strip() for d in DEMO_USERS)
        if is_demo_account:
            await seed_demo_users(db)
            await db.commit()
            res = await db.execute(stmt)
            user = res.scalars().first()

    if not user or not verify_password(req.password, user.hashed_password):
        # Record failed login audit log (sanitized - never log passwords)
        audit_fail = AuditLog(
            id=uuid.uuid4(),
            entity_type="AUTH",
            entity_id=req.email.lower().strip(),
            action="LOGIN_FAILURE",
            actor_reference=req.email.lower().strip(),
            ip_address=client_ip,
            metadata_payload={"reason": "Invalid credentials provided"}
        )
        db.add(audit_fail)
        await db.commit()

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.status != UserStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User account is {user.status.value}. Please contact system administrator."
        )

    # Update last login timestamp
    user.last_login_at = datetime.now(timezone.utc)

    # Generate JWT Tokens
    access_token = create_access_token(
        subject=str(user.id),
        role=user.role.value,
        organization_id=str(user.organization_id) if user.organization_id else None,
    )
    refresh_token = create_refresh_token(subject=str(user.id))

    # Set HttpOnly Cookie for session security
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False,  # Set to True in HTTPS production
    )

    # Record login audit event
    audit_success = AuditLog(
        id=uuid.uuid4(),
        entity_type="AUTH",
        entity_id=str(user.id),
        action="LOGIN_SUCCESS",
        actor_reference=user.email,
        ip_address=client_ip,
        metadata_payload={
            "role": user.role.value,
            "organization_id": str(user.organization_id) if user.organization_id else None
        }
    )
    db.add(audit_success)
    await db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="Bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=format_user_response(user),
    )


@router.post("/logout", response_model=AuthMessageResponse)
async def logout(
    request: Request,
    response: Response,
    current_user: User = Depends(require_authenticated_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Logs out the authenticated user, invalidates active token JTI, clears cookies, and logs the event.
    """
    client_ip = request.client.host if request.client else "unknown"

    # Revoke current token JTI if present
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        try:
            payload = decode_token(auth_header.split(" ")[1])
            jti = payload.get("jti")
            if jti:
                revoke_token_jti(jti)
        except Exception:
            pass

    response.delete_cookie("access_token")

    # Audit logout
    audit_logout = AuditLog(
        id=uuid.uuid4(),
        entity_type="AUTH",
        entity_id=str(current_user.id),
        action="LOGOUT",
        actor_reference=current_user.email,
        ip_address=client_ip,
        metadata_payload={"role": current_user.role.value}
    )
    db.add(audit_logout)
    await db.commit()

    return AuthMessageResponse(message="Successfully logged out.", success=True)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    req: RefreshTokenRequest,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """
    Validates a refresh token, performs refresh token rotation (invalidating old token JTI),
    and generates a new access token and new refresh token.
    Replay of previously used or revoked refresh tokens is strictly rejected (401 Unauthorized).
    """
    try:
        payload = decode_token(req.refresh_token)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type.")

    old_jti = payload.get("jti")
    if not old_jti or is_token_jti_revoked(old_jti):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has already been rotated or revoked."
        )

    # Invalidate the old refresh token JTI immediately (Rotation)
    revoke_token_jti(old_jti)

    user_id = payload.get("sub")
    try:
        user_uuid = uuid.UUID(str(user_id))
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user subject.")

    stmt = select(User).where(User.id == user_uuid)
    res = await db.execute(stmt)
    user = res.scalars().first()

    if not user or user.status != UserStatus.ACTIVE:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account is inactive or not found.")

    new_access_token = create_access_token(
        subject=str(user.id),
        role=user.role.value,
        organization_id=str(user.organization_id) if user.organization_id else None,
    )
    new_refresh_token = create_refresh_token(subject=str(user.id))

    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False,
    )

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="Bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=format_user_response(user),
    )


@router.get("/me", response_model=UserResponse)
async def get_my_profile(
    current_user: User = Depends(require_authenticated_user)
):
    """
    Returns the profile and role metadata of the currently authenticated user.
    """
    return format_user_response(current_user)


@router.post("/seed-demo-users", response_model=AuthMessageResponse)
async def seed_users_endpoint(
    db: AsyncSession = Depends(get_db)
):
    """
    Development/Demo environment setup helper to seed standard SIH demo user accounts.
    
    SECURITY GUARD:
    Permanently disabled and rejected in production environments.
    """
    if settings.ENVIRONMENT.lower() in ["production", "prod"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Demo user seeding is permanently disabled in production environments."
        )

    users = await seed_demo_users(db)
    await db.commit()
    return AuthMessageResponse(
        message=f"Successfully seeded {len(users)} demonstration accounts (Development/Demo Environment).",
        success=True
    )
