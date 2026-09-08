from typing import Optional, List, Callable
import uuid
from fastapi import Depends, HTTPException, status, Header, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.models.user import User, RoleEnum, UserStatus
from app.models.organization import Organization
from app.core.security import decode_token, is_token_jti_revoked

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


async def get_current_user(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """
    Extracts and authenticates the current user from Bearer token or HttpOnly cookie.
    Returns User object or None if unauthenticated.
    """
    raw_token = token
    if not raw_token:
        # Check authorization header directly if not caught by OAuth2PasswordBearer
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            raw_token = auth_header.split(" ")[1]
        elif "access_token" in request.cookies:
            raw_token = request.cookies.get("access_token")

    if not raw_token:
        return None

    try:
        payload = decode_token(raw_token)
    except ValueError:
        return None

    if payload.get("type") != "access":
        return None

    # Check if token JTI has been revoked
    jti = payload.get("jti")
    if jti and is_token_jti_revoked(jti):
        return None

    user_id = payload.get("sub")
    if not user_id:
        return None

    try:
        user_uuid = uuid.UUID(str(user_id))
    except ValueError:
        return None

    stmt = select(User).where(User.id == user_uuid)
    res = await db.execute(stmt)
    user = res.scalars().first()

    if not user or user.status != UserStatus.ACTIVE:
        return None

    return user


async def require_authenticated_user(
    current_user: Optional[User] = Depends(get_current_user)
) -> User:
    """
    Enforces that the incoming request is authenticated with a valid, active user.
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a valid Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user


def require_roles(*allowed_roles: RoleEnum) -> Callable:
    """
    Dependency factory that restricts access to specific application roles.
    """
    async def role_checker(
        current_user: User = Depends(require_authenticated_user)
    ) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden. Action requires one of: {[r.value for r in allowed_roles]}. Current role: {current_user.role.value}"
            )
        return current_user

    return role_checker


def validate_tenant_access(
    target_organization_id: uuid.UUID,
    user: User
) -> bool:
    """
    Validates that a user cannot access or manipulate data belonging to another CPSE tenant.
    - NATIONAL_MASTER_ADMIN, DOMAIN_REVIEWER, AUDITOR have national / cross-CPSE scope on Layer 2 & 3.
    - CPSE_MATERIAL_MANAGER is strictly restricted to user.organization_id.
    """
    if user.role == RoleEnum.CPSE_MATERIAL_MANAGER:
        if user.organization_id is None or user.organization_id != target_organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cross-tenant access denied. You are only authorized to operate on materials within your assigned CPSE organization."
            )
    return True


def validate_raw_layer1_access(
    target_organization_id: uuid.UUID,
    user: User
) -> bool:
    """
    Guarantees that raw Layer 1 ERP data (vendor details, PO numbers, contract pricing, raw payloads)
    is accessible ONLY by the designated CPSE Material Manager of that tenant.
    
    CRITICAL SECURITY & COMMERCIAL AIRGAP BOUNDARY:
    National Master Admin, Domain Reviewer, and Auditor roles have access to Layer 2 (normalized materials),
    Layer 3 (governed CNMC records), and aggregated intelligence, but are strictly BLOCKED from raw
    tenant-private Layer 1 ERP files and confidential commercial records.
    """
    if user.role != RoleEnum.CPSE_MATERIAL_MANAGER or user.organization_id != target_organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access to tenant-private Layer 1 ERP data (vendor details, PO numbers, contract pricing) is strictly restricted to the assigned CPSE Material Manager."
        )
    return True
