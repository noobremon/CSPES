import uuid
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, func, Uuid
from sqlalchemy.orm import relationship
from app.db.session import Base


class MaterialTaxonomy(Base):
    """
    Hierarchical Material Taxonomy / Classification Model.
    Represents standardized multi-level industrial material classifications.
    Example: Industrial Materials (L1) -> Mechanical (L2) -> Fasteners (L3) -> Bolts (L4)
    """
    __tablename__ = "material_taxonomies"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    code = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    parent_id = Column(Uuid, ForeignKey("material_taxonomies.id", ondelete="SET NULL"), nullable=True, index=True)
    level = Column(Integer, nullable=False, default=1)
    path = Column(String(500), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Self-referential hierarchy
    parent = relationship("MaterialTaxonomy", remote_side=[id], backref="children")

    # Associated normalized materials
    normalized_materials = relationship("NormalizedMaterial", back_populates="taxonomy")
    cnmc_candidates = relationship("CNMCCandidate", back_populates="taxonomy")
    cnmc_masters = relationship("CNMCMaster", back_populates="taxonomy")
