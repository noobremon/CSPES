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


class MaterialSimilarityMatch(Base):
    """
    Material Match / Similarity Candidate Model.
    Stores candidate pairs (Material A <-> Material B) with composite confidence scores,
    signal breakdowns (lexical, vector, attribute), and explainability diffs.
    Match types: EXACT_DUPLICATE, NEAR_DUPLICATE, FUNCTIONALLY_EQUIVALENT, POSSIBLE_EQUIVALENT, NOT_EQUIVALENT.
    """
    __tablename__ = "material_similarity_matches"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    source_material_id = Column(Uuid, ForeignKey("normalized_materials.id", ondelete="CASCADE"), nullable=False, index=True)
    target_material_id = Column(Uuid, ForeignKey("normalized_materials.id", ondelete="CASCADE"), nullable=False, index=True)
    match_type = Column(
        String(50),
        nullable=False,
    )  # EXACT_DUPLICATE, NEAR_DUPLICATE, FUNCTIONALLY_EQUIVALENT, POSSIBLE_EQUIVALENT, NOT_EQUIVALENT
    lexical_score = Column(Float, nullable=False, default=0.0)
    vector_score = Column(Float, nullable=False, default=0.0)
    attribute_score = Column(Float, nullable=False, default=0.0)
    composite_confidence = Column(Float, nullable=False, default=0.0)
    methodology = Column(String(100), default="HYBRID_AI_RULE_V1", nullable=False)
    match_explanation = Column(Text, nullable=False)
    specification_diff = Column(JSON, nullable=True)  # Attribute-level side-by-side diff
    recommendation_status = Column(
        String(50),
        default="PROPOSED",
        nullable=False,
    )  # PROPOSED, UNDER_REVIEW, ACCEPTED, REJECTED
    ai_model_version = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    source_material = relationship("NormalizedMaterial", foreign_keys=[source_material_id], back_populates="source_matches")
    target_material = relationship("NormalizedMaterial", foreign_keys=[target_material_id], back_populates="target_matches")
