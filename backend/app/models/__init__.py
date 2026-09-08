# Central Model Registry for Phases 4, 5, and 6
from app.db.session import Base
from app.models.organization import Organization, SourceSystem
from app.models.taxonomy import MaterialTaxonomy
from app.models.material import (
    RawMaterial,
    NormalizedMaterial,
    MaterialAttribute,
    MaterialEmbedding,
)
from app.models.standards import StandardsEquivalence
from app.models.matching import MaterialSimilarityMatch
from app.models.cnmc import CNMCCandidate, CNMCMaster, CPSECNMCMapping
from app.models.governance import GovernanceReview, AuditLog
from app.models.ingestion import IngestionJob
from app.models.user import User, RoleEnum, UserStatus

# Technical table from Phase 4 foundation (maintained for technical test baseline)
from sqlalchemy import Column, String, DateTime, func
import uuid


class SystemHealthCheck(Base):
    __tablename__ = "system_health_checks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    node_name = Column(String(100), nullable=False)
    status = Column(String(50), default="HEALTHY")
    checked_at = Column(DateTime(timezone=True), server_default=func.now())


__all__ = [
    "Base",
    "SystemHealthCheck",
    "Organization",
    "SourceSystem",
    "MaterialTaxonomy",
    "RawMaterial",
    "NormalizedMaterial",
    "MaterialAttribute",
    "MaterialEmbedding",
    "StandardsEquivalence",
    "MaterialSimilarityMatch",
    "CNMCCandidate",
    "CNMCMaster",
    "CPSECNMCMapping",
    "GovernanceReview",
    "AuditLog",
    "IngestionJob",
    "User",
    "RoleEnum",
    "UserStatus",
]
