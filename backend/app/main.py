from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.logging import setup_logging
from app.core.security_headers import SecurityHeadersMiddleware
from app.core.exceptions import (
    BaseAppException,
    app_exception_handler,
    http_exception_handler,
    generic_exception_handler,
)
from app.api.v1.router import api_router

# Initialize structured logger
logger = setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.APP_NAME} in [{settings.ENVIRONMENT}] environment")
    if settings.ENVIRONMENT.lower() in ["production", "prod"]:
        if settings.SECRET_KEY.startswith("dev_secret_key"):
            logger.warning("CRITICAL SECURITY WARNING: Production environment is using default development SECRET_KEY! Override via SECRET_KEY env variable.")
    logger.info(f"API documentation accessible at /docs")
    yield
    logger.info(f"Shutting down {settings.APP_NAME}")


app = FastAPI(
    title=settings.APP_NAME,
    description="API Gateway for the AI-Powered National Unified Material Master Framework (SIH 2026)",
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Defensive OWASP Security Headers Middleware
app.add_middleware(SecurityHeadersMiddleware)

# CORS Configuration
if settings.ALLOWED_CORS_ORIGINS:
    # Ensure wildcard origin is never combined with credentials in production
    cors_origins = settings.ALLOWED_CORS_ORIGINS
    allow_cred = True
    if cors_origins == ["*"] or cors_origins == "*":
        allow_cred = False  # Strict specification compliance

    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins if isinstance(cors_origins, list) else [cors_origins],
        allow_credentials=allow_cred,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )

# Exception Handlers
app.add_exception_handler(BaseAppException, app_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Include API Router
app.include_router(api_router, prefix=settings.API_V1_STR)
# Mount at root as well so calls directly to /auth/login or /health succeed seamlessly
if settings.API_V1_STR:
    app.include_router(api_router)


@app.get("/", tags=["Root"])
async def root():
    return {
        "success": True,
        "message": "National Unified Material Master Framework API Gateway",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR,
    }
