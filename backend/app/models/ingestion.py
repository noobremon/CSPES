import uuid
from sqlalchemy import (
    Column,
    String,
    Integer,
    DateTime,
    ForeignKey,
    JSON,
    func,
    Uuid,
)
from sqlalchemy.orm import relationship
from app.db.session import Base


class IngestionJob(Base):
    """
    Import Batch / Ingestion Job Entity.
    Tracks file uploads, column mappings, processing states, row counts,
    and row-level validation errors.
    Statuses: QUEUED, PROCESSING, COMPLETED, PARTIALLY_COMPLETED, FAILED
    """
    __tablename__ = "ingestion_jobs"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    organization_id = Column(Uuid, ForeignKey("organizations.id", ondelete="RESTRICT"), nullable=False, index=True)
    source_system_id = Column(Uuid, ForeignKey("source_systems.id", ondelete="SET NULL"), nullable=True, index=True)
    original_filename = Column(String(255), nullable=False)
    stored_filepath = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)  # CSV, EXCEL
    file_hash = Column(String(64), nullable=False, index=True)  # SHA-256 checksum for duplicate protection
    total_rows = Column(Integer, default=0, nullable=False)
    processed_rows = Column(Integer, default=0, nullable=False)
    failed_rows = Column(Integer, default=0, nullable=False)
    status = Column(
        String(50),
        default="QUEUED",
        nullable=False,
    )  # QUEUED, PROCESSING, COMPLETED, PARTIALLY_COMPLETED, FAILED
    column_mapping = Column(JSON, nullable=True)  # Key-value mapping: canonical_field -> source_column
    error_summary = Column(JSON, nullable=True)  # Array of row-level error objects: [{"row": N, "reason": "..."}]
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    organization = relationship("Organization")
    source_system = relationship("SourceSystem")
