import datetime
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, Optional, Union, Set
import uuid
import jwt
import bcrypt
from app.core.config import settings

ALGORITHM = "HS256"

# In-memory revocation set for rotated/blacklisted token JTIs (JWT IDs)
_REVOKED_JTIS: Set[str] = set()


def revoke_token_jti(jti: str) -> None:
    """
    Revokes a specific token JTI (e.g., during refresh rotation or logout).
    """
    if jti:
        _REVOKED_JTIS.add(str(jti))


def is_token_jti_revoked(jti: str) -> bool:
    """
    Checks if a token JTI has been revoked.
    """
    if not jti:
        return False
    return str(jti) in _REVOKED_JTIS


def clear_revoked_jtis() -> None:
    """
    Test helper to clear the revocation cache.
    """
    _REVOKED_JTIS.clear()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plaintext password against a stored bcrypt hashed password.
    """
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """
    Generates a secure hash for a password using native bcrypt with salt.
    """
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def create_access_token(
    subject: Union[str, Any],
    role: str,
    organization_id: Optional[str] = None,
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Creates a cryptographically signed short-lived JWT access token.
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode: Dict[str, Any] = {
        "sub": str(subject),
        "jti": str(uuid.uuid4()),
        "role": role,
        "type": "access",
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    if organization_id:
        to_encode["org_id"] = str(organization_id)

    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(
    subject: Union[str, Any],
    expires_delta: Optional[timedelta] = None,
    jti: Optional[str] = None
) -> str:
    """
    Creates a cryptographically signed refresh token with unique JTI for rotation support.
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    token_jti = jti or str(uuid.uuid4())

    to_encode: Dict[str, Any] = {
        "sub": str(subject),
        "jti": token_jti,
        "type": "refresh",
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }

    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Dict[str, Any]:
    """
    Decodes and validates a JWT token. Raises ValueError if invalid or expired.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired.")
    except jwt.InvalidTokenError as e:
        raise ValueError(f"Invalid token: {str(e)}")
