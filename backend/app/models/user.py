import uuid
import enum
from sqlalchemy import (
    Column,
    String,
    DateTime,
    Boolean,
    ForeignKey,
    Enum as SQLEnum,
    func,
    Uuid,
)
from sqlalchemy.orm import relationship
from app.db.session import Base


class RoleEnum(str, enum.Enum):
    """
    Standard Role Definitions for the National Material Master Platform.
    """
    NATIONAL_MASTER_ADMIN = "NATIONAL_MASTER_ADMIN"
    CPSE_MATERIAL_MANAGER = "CPSE_MATERIAL_MANAGER"
    DOMAIN_REVIEWER = "DOMAIN_REVIEWER"
    AUDITOR = "AUDITOR"


class UserStatus(str, enum.Enum):
    """
    User Account Status.
    """
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    SUSPENDED = "SUSPENDED"


class User(Base):
    """
    User Entity with Role-Based Access Control and Organization Scoping.
    """
    __tablename__ = "users"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(
        SQLEnum(RoleEnum, name="user_role_enum", native_enum=False),
        nullable=False,
        default=RoleEnum.CPSE_MATERIAL_MANAGER,
        index=True,
    )
    organization_id = Column(
        Uuid,
        ForeignKey("organizations.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    status = Column(
        SQLEnum(UserStatus, name="user_status_enum", native_enum=False),
        nullable=False,
        default=UserStatus.ACTIVE,
        index=True,
    )
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    organization = relationship("Organization", backref="users", lazy="joined")
