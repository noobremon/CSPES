from pydantic import BaseModel
from typing import Dict, Optional


class HealthResponse(BaseModel):
    status: str
    app_name: str
    environment: str
    version: str
    timestamp: str


class ReadinessResponse(BaseModel):
    status: str
    database: str
    redis: str
    pgvector: str
    timestamp: str
