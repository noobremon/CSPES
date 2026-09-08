from typing import Optional, List
import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from app.models.user import RoleEnum, UserStatus


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., description="User corporate or government email address")
    password: str = Field(..., min_length=6, description="User password")


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., description="Valid refresh token")


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    role: RoleEnum
    organization_id: Optional[uuid.UUID] = None
    organization_code: Optional[str] = None
    organization_name: Optional[str] = None
    status: UserStatus
    last_login_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int
    user: UserResponse


class UserCreateRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str
    role: RoleEnum = RoleEnum.CPSE_MATERIAL_MANAGER
    organization_id: Optional[uuid.UUID] = None


class AuthMessageResponse(BaseModel):
    message: str
    success: bool = True
