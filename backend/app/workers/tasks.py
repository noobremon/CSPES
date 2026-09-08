import asyncio
import uuid
from datetime import datetime, timezone
from app.core.celery_app import celery_app
from app.db.session import AsyncSessionLocal
from app.services.ingestion_engine import execute_ingestion_job
from loguru import logger


@celery_app.task(name="app.workers.tasks.ping_task", bind=True)
def ping_task(self, message: str = "ping") -> dict:
    """
    Technical verification task for environment testing.
    Verifies that FastAPI can dispatch to Redis broker and Celery worker can execute.
    """
    logger.info(f"Executing Celery health check ping task with message: {message}")
    return {
        "status": "success",
        "task_id": self.request.id,
        "message": f"pong: {message}",
        "worker_timestamp": datetime.now(timezone.utc).isoformat(),
    }


@celery_app.task(name="app.workers.tasks.process_ingestion_batch_task", bind=True)
def process_ingestion_batch_task(self, job_id_str: str, mapping: dict) -> dict:
    """
    Asynchronous Celery task for processing material master ingestion batches.
    Validates file rows, preserves Layer 1 raw data, normalizes strings and units,
    and extracts deterministic Layer 2 technical attributes.
    """
    logger.info(f"Starting Celery batch ingestion task for job_id={job_id_str}")
    job_id = uuid.UUID(job_id_str)

    async def _run():
        async with AsyncSessionLocal() as session:
            return await execute_ingestion_job(job_id, mapping, session)

    try:
        result = asyncio.run(_run())
        logger.info(f"Completed batch ingestion task for job_id={job_id_str}: {result}")
        return result
    except Exception as exc:
        logger.error(f"Error in batch ingestion task {job_id_str}: {exc}")
        return {"status": "FAILED", "error": str(exc)}


@celery_app.task(name="app.workers.tasks.process_material_matching_task", bind=True)
def process_material_matching_task(self, material_id_str: str, cross_org_only: bool = True, min_confidence: float = 0.40) -> dict:
    """
    Asynchronous Celery task for generating candidate matches for a material.
    """
    logger.info(f"Starting Celery material matching task for material_id={material_id_str}")
    from app.services.matching.hybrid_engine import generate_and_persist_matches_for_material

    material_id = uuid.UUID(material_id_str)

    async def _run():
        async with AsyncSessionLocal() as session:
            matches = await generate_and_persist_matches_for_material(
                source_material_id=material_id,
                session=session,
                cross_org_only=cross_org_only,
                min_score_threshold=min_confidence
            )
            return {"status": "SUCCESS", "matches_count": len(matches), "material_id": material_id_str}

    try:
        result = asyncio.run(_run())
        logger.info(f"Completed material matching task for {material_id_str}: {result}")
        return result
    except Exception as exc:
        logger.error(f"Error in material matching task {material_id_str}: {exc}")
        return {"status": "FAILED", "error": str(exc)}
