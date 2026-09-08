import uuid
from sqlalchemy import (
    Column,
    String,
    Text,
    Float,
    DateTime,
    ForeignKey,
    JSON,
    UniqueConstraint,
    Integer,
    func,
    Uuid,
)
from sqlalchemy.orm import relationship
from app.db.session import Base

try:
    from pgvector.sqlalchemy import Vector
except ImportError:
    from sqlalchemy.types import TypeDecorator

    class Vector(TypeDecorator):
        impl = JSON
        cache_ok = True


class RawMaterial(Base):
    """
    Layer 1: Tenant-Private Operational Data.
    Preserves imported source ERP material data without modification.
    Proprietary vendor, contract pricing, and plant info are isolated here.
    """
    __tablename__ = "raw_materials"
    __table_args__ = (
        UniqueConstraint("organization_id", "material_code", name="uq_raw_org_material_code"),
    )

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    organization_id = Column(Uuid, ForeignKey("organizations.id", ondelete="RESTRICT"), nullable=False, index=True)
    source_system_id = Column(Uuid, ForeignKey("source_systems.id", ondelete="SET NULL"), nullable=True, index=True)
    material_code = Column(String(100), nullable=False, index=True)
    material_description = Column(Text, nullable=False)
    specification_text = Column(Text, nullable=True)
    uom = Column(String(50), nullable=False)
    category_code = Column(String(100), nullable=True)
    manufacturer_reference = Column(String(255), nullable=True)
    source_payload = Column(JSON, nullable=True)  # Confidential PO / Price / Store details
    import_batch_id = Column(String(100), nullable=True, index=True)
    status = Column(String(50), default="IMPORTED", nullable=False)  # IMPORTED, NORMALIZED, ARCHIVED
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    organization = relationship("Organization", back_populates="raw_materials")
    source_system = relationship("SourceSystem", back_populates="raw_materials")
    normalized_material = relationship("NormalizedMaterial", back_populates="raw_material", uselist=False)
    cpse_cnmc_mappings = relationship("CPSECNMCMapping", back_populates="raw_material")


class NormalizedMaterial(Base):
    """
    Layer 2: Normalized Material Intelligence Data.
    Sanitized representation containing standardized engineering terminology,
    extracted attributes, and classification references. Sensitive pricing/vendor stripped.
    """
    __tablename__ = "normalized_materials"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    raw_material_id = Column(Uuid, ForeignKey("raw_materials.id", ondelete="RESTRICT"), unique=True, nullable=False, index=True)
    organization_id = Column(Uuid, ForeignKey("organizations.id", ondelete="RESTRICT"), nullable=False, index=True)
    canonical_description = Column(Text, nullable=False)
    normalized_manufacturer = Column(String(255), nullable=True)
    normalized_part_number = Column(String(255), nullable=True)
    normalized_uom = Column(String(50), nullable=False)  # Standardized SI UOM (e.g. EA, MM, KG)
    taxonomy_id = Column(Uuid, ForeignKey("material_taxonomies.id", ondelete="SET NULL"), nullable=True, index=True)
    engineering_term = Column(String(255), nullable=True)
    standard_code = Column(String(100), nullable=True)  # e.g., IS 1363, DIN 933, ASTM A193
    material_grade = Column(String(100), nullable=True)  # e.g., SS304, SS316, A2-70
    normalization_status = Column(String(50), default="NORMALIZED", nullable=False)
    confidence_score = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    raw_material = relationship("RawMaterial", back_populates="normalized_material")
    organization = relationship("Organization", back_populates="normalized_materials")
    taxonomy = relationship("MaterialTaxonomy", back_populates="normalized_materials")
    attributes = relationship("MaterialAttribute", back_populates="normalized_material", cascade="all, delete-orphan")
    embedding = relationship("MaterialEmbedding", back_populates="normalized_material", uselist=False, cascade="all, delete-orphan")
    source_matches = relationship("MaterialSimilarityMatch", foreign_keys="MaterialSimilarityMatch.source_material_id", back_populates="source_material")
    target_matches = relationship("MaterialSimilarityMatch", foreign_keys="MaterialSimilarityMatch.target_material_id", back_populates="target_material")
    cpse_cnmc_mappings = relationship("CPSECNMCMapping", back_populates="normalized_material")


class MaterialAttribute(Base):
    """
    Extensible Technical Specification Attribute Model.
    Stores flexible physical, electrical, mechanical, and chemical specifications
    without requiring hundreds of static table columns.
    """
    __tablename__ = "material_attributes"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    normalized_material_id = Column(Uuid, ForeignKey("normalized_materials.id", ondelete="CASCADE"), nullable=False, index=True)
    attribute_name = Column(String(100), nullable=False, index=True)  # diameter, length, grade, voltage, pressure
    original_value = Column(String(255), nullable=True)
    normalized_value = Column(String(255), nullable=False)
    normalized_unit = Column(String(50), nullable=True)
    data_type = Column(String(50), default="STRING", nullable=False)  # NUMERIC, STRING, RANGE, BOOLEAN
    source = Column(String(50), default="RULE_EXTRACTOR", nullable=False)  # RULE_EXTRACTOR, AI_EXTRACTOR, HUMAN_INPUT
    confidence = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationship
    normalized_material = relationship("NormalizedMaterial", back_populates="attributes")


class MaterialEmbedding(Base):
    """
    pgvector Embedding Model for Semantic Vector Storage.
    Stores dense vector representations for cosine similarity calculation.
    """
    __tablename__ = "material_embeddings"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    normalized_material_id = Column(Uuid, ForeignKey("normalized_materials.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    embedding_model = Column(String(100), default="all-MiniLM-L6-v2", nullable=False)
    model_version = Column(String(50), default="1.0.0", nullable=False)
    dimensions = Column(Integer, default=384, nullable=False)
    embedding_vector = Column(Vector(384), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationship
    normalized_material = relationship("NormalizedMaterial", back_populates="embedding")
