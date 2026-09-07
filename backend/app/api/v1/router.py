from fastapi import APIRouter
from app.api.v1.endpoints import health

api_router = APIRouter()

# Register health and readiness probes
api_router.include_router(health.router, tags=["System Health & Diagnostics"])
