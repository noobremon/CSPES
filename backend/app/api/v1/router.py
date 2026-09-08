from fastapi import APIRouter
from app.api.v1.endpoints import health, auth, ingestion, matching, cnmc, governance, analytics

api_router = APIRouter()

# Register health and readiness probes
api_router.include_router(health.router, tags=["System Health & Diagnostics"])

# Register authentication and user access control
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Access Control"])

# Register material ingestion and normalization pipeline
api_router.include_router(ingestion.router, prefix="/ingestion", tags=["Material Ingestion Pipeline"])

# Register material candidate matching engine
api_router.include_router(matching.router, tags=["Material Matching & Candidate Intelligence"])

# Register CNMC recommendation and prototype master catalog
api_router.include_router(cnmc.router, prefix="/cnmc", tags=["CNMC Recommendation & Master Catalog"])

# Register Human Governance and Audit Trail
api_router.include_router(governance.router, prefix="/governance", tags=["Human Governance & Audit Trail"])

# Register National Material Intelligence Analytics & Procurement Opportunity Engine
api_router.include_router(analytics.router, prefix="/analytics", tags=["National Analytics & Procurement Opportunities"])
