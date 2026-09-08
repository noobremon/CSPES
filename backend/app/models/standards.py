import uuid
from sqlalchemy import Column, String, Text, Boolean, DateTime, UniqueConstraint, func, Uuid
from app.db.session import Base


class StandardsEquivalence(Base):
    """
    Engineering Standards Equivalence Model.
    Governance-ready repository of cross-standard equivalents (IS, DIN, ISO, ASTM, ASME).
    Equivalence types: VERIFIED_EQUIVALENT, POSSIBLE_EQUIVALENT, NOT_EQUIVALENT, REQUIRES_DOMAIN_REVIEW.
    """
    __tablename__ = "standards_equivalences"
    __table_args__ = (
        UniqueConstraint("source_standard", "target_standard", name="uq_standards_equivalence_pair"),
    )

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    source_standard = Column(String(100), nullable=False, index=True)
    target_standard = Column(String(100), nullable=False, index=True)
    equivalence_type = Column(
        String(50),
        nullable=False,
        default="REQUIRES_DOMAIN_REVIEW",
    )  # VERIFIED_EQUIVALENT, POSSIBLE_EQUIVALENT, NOT_EQUIVALENT, REQUIRES_DOMAIN_REVIEW
    comparison_notes = Column(Text, nullable=True)
    domain_reviewer_required = Column(Boolean, default=False, nullable=False)
    verification_status = Column(String(50), default="DRAFT", nullable=False)  # DRAFT, VERIFIED, DEPRECATED
    verified_by = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
