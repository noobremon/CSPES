import uuid
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, func, Uuid
from sqlalchemy.orm import relationship
from app.db.session import Base


class Organization(Base):
    """
    Organization Entity (CPSE).
    Represents participating public sector enterprises.
    """
    __tablename__ = "organizations"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    sector = Column(String(100), nullable=False)
    status = Column(String(50), default="ACTIVE", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    source_systems = relationship("SourceSystem", back_populates="organization", cascade="all, delete-orphan")
    raw_materials = relationship("RawMaterial", back_populates="organization")
    normalized_materials = relationship("NormalizedMaterial", back_populates="organization")
    cpse_cnmc_mappings = relationship("CPSECNMCMapping", back_populates="organization")


class SourceSystem(Base):
    """
    Source System Entity.
    Represents ERPs, legacy systems, or batch feeds from which CPSE materials originate.
    """
    __tablename__ = "source_systems"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    organization_id = Column(Uuid, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    system_type = Column(String(50), nullable=False)  # SAP, ORACLE, LEGACY_ERP, CSV_IMPORT
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    organization = relationship("Organization", back_populates="source_systems")
    raw_materials = relationship("RawMaterial", back_populates="source_system")
