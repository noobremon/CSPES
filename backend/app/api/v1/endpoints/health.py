from fastapi import APIRouter, status, Depends
from datetime import datetime, timezone
from app.core.config import settings
from app.schemas.response import ApiResponse
from app.schemas.health import HealthResponse, ReadinessResponse
from app.workers.tasks import ping_task
import redis.asyncio as aioredis
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.db.session import get_db

router = APIRouter()


@router.get(
    "/health",
    response_model=ApiResponse[HealthResponse],
    status_code=status.HTTP_200_OK,
    summary="Liveness Probe",
)
async def get_health() -> ApiResponse[HealthResponse]:
    """
    Standard liveness endpoint verifying that the FastAPI application is running.
    """
    return ApiResponse(
        success=True,
        data=HealthResponse(
            status="healthy",
            app_name=settings.APP_NAME,
            environment=settings.ENVIRONMENT,
            version=settings.VERSION,
            timestamp=datetime.now(timezone.utc).isoformat(),
        ),
        meta={"uptime": "active"},
    )


@router.get(
    "/readiness",
    response_model=ApiResponse[ReadinessResponse],
    status_code=status.HTTP_200_OK,
    summary="Readiness Probe",
)
async def get_readiness(db: AsyncSession = Depends(get_db)) -> ApiResponse[ReadinessResponse]:
    """
    Standard readiness probe checking PostgreSQL database, pgvector extension, and Redis availability.
    """
    db_status = "unknown"
    pgvector_status = "unknown"
    redis_status = "unknown"

    # Check Database & pgvector
    try:
        result = await db.execute(text("SELECT 1;"))
        if result.scalar() == 1:
            db_status = "connected"
        
        # Check pgvector extension
        vec_check = await db.execute(
            text("SELECT extname FROM pg_extension WHERE extname = 'vector';")
        )
        if vec_check.scalar() == "vector":
            pgvector_status = "available"
        else:
            pgvector_status = "not_installed"
    except Exception as e:
        db_status = f"unreachable ({str(e)})"
        pgvector_status = "unavailable"

    # Check Redis
    try:
        r = aioredis.from_url(settings.REDIS_URL, socket_connect_timeout=2)
        if await r.ping():
            redis_status = "connected"
        await r.close()
    except Exception as e:
        redis_status = f"unreachable ({str(e)})"

    is_ready = (db_status == "connected" and redis_status == "connected")

    return ApiResponse(
        success=is_ready,
        data=ReadinessResponse(
            status="ready" if is_ready else "degraded",
            database=db_status,
            redis=redis_status,
            pgvector=pgvector_status,
            timestamp=datetime.now(timezone.utc).isoformat(),
        ),
        meta={"service": "gateway"},
    )


@router.post(
    "/test-celery-ping",
    response_model=ApiResponse[dict],
    status_code=status.HTTP_202_ACCEPTED,
    summary="Technical Verification: Dispatch Celery Test Task",
)
async def trigger_test_celery_task(msg: str = "technical_health_check") -> ApiResponse[dict]:
    """
    Technical verification endpoint: dispatches a harmless ping task to Redis broker for Celery worker consumption.
    """
    try:
        task = ping_task.delay(msg)
        return ApiResponse(
            success=True,
            data={
                "task_id": task.id,
                "status": "DISPATCHED",
                "message": f"Task queued to Redis broker with payload: {msg}",
            },
            meta={"broker": "redis"},
        )
    except Exception as e:
        return ApiResponse(
            success=False,
            error={
                "code": "CELERY_DISPATCH_ERROR",
                "message": f"Could not dispatch task to Redis: {str(e)}",
            },
        )
