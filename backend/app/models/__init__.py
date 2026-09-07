# Technical Foundation Model for Phase 4 Connection & Migration Verification
from sqlalchemy import Column, String, DateTime, func
from app.db.session import Base
import uuid


class SystemHealthCheck(Base):
    __tablename__ = "system_health_checks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    node_name = Column(String(100), nullable=False)
    status = Column(String(50), default="HEALTHY")
    checked_at = Column(DateTime(timezone=True), server_default=func.now())
