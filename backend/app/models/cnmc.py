import uuid
from sqlalchemy import (
    Column,
    String,
    Text,
    Float,
    DateTime,
    ForeignKey,
    JSON,
    func,
    Uuid,
)
from sqlalchemy.orm import relationship
from app.db.session import Base


class CNMCCandidate(Base):
    """
    CNMC Candidate Proposal Model.
    Represents system/AI recommended Common National Material Code clusters pending human review.
    Status: PENDING_REVIEW, APPROVED, REJECTED, SUPERSEDED.
    """
    __tablename__ = "cnmc_candidates"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    proposed_cnmc = Column(String(100), nullable=False, index=True)  # MVP Prototype Reference Format
    candidate_group_name = Column(String(255), nullable=False)
    proposed_description = Column(Text, nullable=False)
    taxonomy_id = Column(Uuid, ForeignKey("material_taxonomies.id", ondelete="SET NULL"), nullable=True, index=True)
    confidence_score = Column(Float, nullable=False, default=0.0)
    recommendation_explanation = Column(Text, nullable=False)
    generation_source = Column(String(100), default="AI_CLUSTERING", nullable=False)  # AI_CLUSTERING, STANDARDIZATION_RULE, MANUAL_PROPOSAL
    status = Column(
        String(50),
        default="PENDING_REVIEW",
        nullable=False,
    )  # PENDING_REVIEW, APPROVED, REJECTED, SUPERSEDED
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    taxonomy = relationship("MaterialTaxonomy", back_populates="cnmc_candidates")


class CNMCMaster(Base):
    """
    Layer 3: Governed National Material Master Catalog.
    Contains officially approved Common National Material Code (CNMC) records only.
    Format is the MVP Prototype Reference Format (e.g., IN-IND-MECH-BLT-00492).
    """
    __tablename__ = "cnmc_master"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    cnmc_code = Column(String(100), unique=True, nullable=False, index=True)
    canonical_name = Column(String(255), nullable=False)
    standard_description = Column(Text, nullable=False)
    taxonomy_id = Column(Uuid, ForeignKey("material_taxonomies.id", ondelete="SET NULL"), nullable=True, index=True)
    spec_template = Column(JSON, nullable=True)  # Standardized attribute template
    status = Column(String(50), default="ACTIVE", nullable=False)  # ACTIVE, SUPERSEDED, DEPRECATED
    governance_metadata = Column(JSON, nullable=True)  # Committee approvals, gazette reference
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    taxonomy = relationship("MaterialTaxonomy", back_populates="cnmc_masters")
    mappings = relationship("CPSECNMCMapping", back_populates="cnmc_master")


class CPSECNMCMapping(Base):
    """
    CPSE Material Code <-> CNMC Mapping (Cross-walk Table).
    Binds an existing CPSE material code to an approved CNMC code while preserving the original CPSE code.
    Mapping Types: DIRECT_MATCH, NORMALIZED_MATCH, FUNCTIONAL_EQUIVALENCE, MANUAL_MAPPING.
    """
    __tablename__ = "cpse_cnmc_mappings"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    raw_material_id = Column(Uuid, ForeignKey("raw_materials.id", ondelete="RESTRICT"), nullable=False, index=True)
    normalized_material_id = Column(Uuid, ForeignKey("normalized_materials.id", ondelete="RESTRICT"), nullable=False, index=True)
    organization_id = Column(Uuid, ForeignKey("organizations.id", ondelete="RESTRICT"), nullable=False, index=True)
    local_material_code = Column(String(100), nullable=False, index=True)  # Preserves CPSE original code
    cnmc_id = Column(Uuid, ForeignKey("cnmc_master.id", ondelete="RESTRICT"), nullable=False, index=True)
    mapping_type = Column(
        String(50),
        nullable=False,
    )  # DIRECT_MATCH, NORMALIZED_MATCH, FUNCTIONAL_EQUIVALENCE, MANUAL_MAPPING
    confidence_score = Column(Float, nullable=False, default=1.0)
    status = Column(String(50), default="ACTIVE", nullable=False)  # ACTIVE, UNDER_REVIEW, DEPRECATED
    approved_by = Column(String(255), nullable=False)  # Reviewer or Admin reference
    effective_from = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    effective_to = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    raw_material = relationship("RawMaterial", back_populates="cpse_cnmc_mappings")
    normalized_material = relationship("NormalizedMaterial", back_populates="cpse_cnmc_mappings")
    organization = relationship("Organization", back_populates="cpse_cnmc_mappings")
    cnmc_master = relationship("CNMCMaster", back_populates="mappings")
