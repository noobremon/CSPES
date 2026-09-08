import uuid
from sqlalchemy import (
    Column,
    String,
    Text,
    DateTime,
    JSON,
    func,
    Uuid,
)
from app.db.session import Base


class GovernanceReview(Base):
    """
    Human Review / Validation Workflow Foundation.
    Tracks review decisions across similarity matches, CNMC candidates, and cross-walk mappings.
    Decisions: APPROVED, REJECTED, NEEDS_MORE_INFORMATION, ESCALATED.
    """
    __tablename__ = "governance_reviews"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    entity_type = Column(
        String(50),
        nullable=False,
        index=True,
    )  # SIMILARITY_MATCH, CNMC_CANDIDATE, CPSE_MAPPING, STANDARDS_EQUIVALENCE
    entity_id = Column(Uuid, nullable=False, index=True)
    reviewer_reference = Column(String(255), nullable=False)  # Identifier or placeholder for future RBAC user
    decision = Column(
        String(50),
        nullable=False,
    )  # APPROVED, REJECTED, NEEDS_MORE_INFORMATION, ESCALATED
    comments = Column(Text, nullable=True)
    previous_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class AuditLog(Base):
    """
    Append-Oriented Audit Log Model.
    Provides immutable audit traceability for all major domain operations and governance decisions.
    """
    __tablename__ = "audit_logs"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    entity_type = Column(String(100), nullable=False, index=True)
    entity_id = Column(String(100), nullable=False, index=True)
    action = Column(
        String(100),
        nullable=False,
    )  # RAW_IMPORTED, NORMALIZED, MATCH_PROPOSED, CNMC_APPROVED, MAPPING_ACTIVATED, etc.
    previous_state = Column(JSON, nullable=True)
    new_state = Column(JSON, nullable=True)
    actor_reference = Column(String(255), nullable=False)
    ip_address = Column(String(100), nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    metadata_payload = Column(JSON, nullable=True)
