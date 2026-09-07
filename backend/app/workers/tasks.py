from datetime import datetime, timezone
from app.core.celery_app import celery_app
from loguru import logger


@celery_app.task(name="app.workers.tasks.ping_task", bind=True)
def ping_task(self, message: str = "ping") -> dict:
    """
    Technical verification task for Phase 4 environment testing.
    Verifies that FastAPI can dispatch to Redis broker and Celery worker can execute.
    """
    logger.info(f"Executing Celery health check ping task with message: {message}")
    return {
        "status": "success",
        "task_id": self.request.id,
        "message": f"pong: {message}",
        "worker_timestamp": datetime.now(timezone.utc).isoformat(),
    }
