import os
import uuid
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.organization import Organization, SourceSystem
from app.models.ingestion import IngestionJob
from app.schemas.ingestion import (
    ColumnDiscoveryResponse,
    IngestionUploadResponse,
    ProcessJobRequest,
    IngestionJobStatusResponse,
    IngestionErrorListResponse,
)
from app.services.file_parser import (
    detect_file_type,
    compute_file_hash,
    parse_csv_stream,
    parse_excel_stream,
    suggest_canonical_column_mapping,
)
from app.services.ingestion_engine import execute_ingestion_job
from app.workers.tasks import process_ingestion_batch_task
from app.core.config import settings
from app.core.deps import get_current_user, validate_tenant_access
from app.models.user import User, RoleEnum

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "data", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB
MAX_SYNC_INGESTION_ROWS = 250  # Safety threshold to prevent blocking web worker on large synchronous jobs


@router.get(
    "/organizations",
    summary="List all registered CPSE demonstration organizations"
)
async def list_cpse_organizations(
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Organization).order_by(Organization.name)
    res = await db.execute(stmt)
    orgs = res.scalars().all()
    return [
        {
            "id": str(o.id),
            "code": o.code,
            "name": o.name,
            "short_name": o.short_name,
            "sector": o.sector,
            "organization_type": o.organization_type,
            "onboarding_status": o.onboarding_status,
            "demo_status": o.demo_status,
            "data_source_type": o.data_source_type,
            "status": o.status
        }
        for o in orgs
    ]


@router.post(
    "/discover",
    response_model=ColumnDiscoveryResponse,
    summary="Inspect file headers and sample preview rows",
    description="Inspects an uploaded CSV or OpenXML Excel (.xlsx) file without persisting it. Returns detected column headers, estimated row count, preview sample rows, and suggested mappings. Explicitly rejects legacy .xls format."
)
async def discover_columns(
    file: UploadFile = File(..., description="CSV or .xlsx file to inspect"),
    current_user: Optional[User] = Depends(get_current_user),
):
    if current_user and current_user.role == RoleEnum.AUDITOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Auditor role is read-only and cannot perform discovery or ingestion."
        )

    filename = file.filename or "unknown_file.csv"
    content = await file.read()
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")

    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File size exceeds maximum 50MB limit.")

    try:
        file_type = detect_file_type(filename, content)
        if file_type == "EXCEL":
            headers, total_rows, sample_rows, _ = parse_excel_stream(content)
        else:
            headers, total_rows, sample_rows, _ = parse_csv_stream(content)
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse file: {str(e)}")

    suggested = suggest_canonical_column_mapping(headers)
    return ColumnDiscoveryResponse(
        filename=filename,
        file_type=file_type,
        detected_columns=headers,
        estimated_row_count=total_rows,
        sample_rows=sample_rows,
        suggested_mapping=suggested
    )


@router.post(
    "/upload",
    response_model=IngestionUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload material catalog file and create ingestion job",
    description="Uploads a CSV or OpenXML Excel (.xlsx) file, checks SHA-256 hash for duplicate upload protection, saves to controlled storage, and registers an IngestionJob."
)
async def upload_ingestion_file(
    organization_id: uuid.UUID = Form(..., description="Target CPSE organization UUID"),
    source_system_id: Optional[uuid.UUID] = Form(None, description="Optional CPSE source system UUID"),
    file: UploadFile = File(..., description="CSV or OpenXML Excel (.xlsx) catalog file"),
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user:
        if current_user.role == RoleEnum.AUDITOR:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Auditor role is read-only and cannot upload materials."
            )
        validate_tenant_access(organization_id, current_user)

    filename = file.filename or "catalog.csv"
    content = await file.read()
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")

    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File exceeds 50MB limit.")

    # Validate Organization exists
    org = (await db.execute(select(Organization).where(Organization.id == organization_id))).scalars().first()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Organization with ID {organization_id} not found.")

    file_hash = compute_file_hash(content)

    # Check for duplicate upload
    duplicate_job = (await db.execute(
        select(IngestionJob).where(
            IngestionJob.organization_id == organization_id,
            IngestionJob.file_hash == file_hash,
            IngestionJob.status.in_(["COMPLETED", "PROCESSING", "QUEUED"])
        )
    )).scalars().first()

    if duplicate_job:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Duplicate file detected. An identical file was already uploaded in job {duplicate_job.id} (Status: {duplicate_job.status})."
        )

    try:
        file_type = detect_file_type(filename, content)
        if file_type == "EXCEL":
            headers, total_rows, sample_rows, _ = parse_excel_stream(content)
        else:
            headers, total_rows, sample_rows, _ = parse_csv_stream(content)
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"File parse error: {str(e)}")

    # Store file in controlled upload directory with safe UUID filename
    safe_filename = f"{uuid.uuid4()}_{os.path.basename(filename)}"
    stored_path = os.path.join(UPLOAD_DIR, safe_filename)
    with open(stored_path, "wb") as f:
        f.write(content)

    suggested = suggest_canonical_column_mapping(headers)

    job = IngestionJob(
        id=uuid.uuid4(),
        organization_id=organization_id,
        source_system_id=source_system_id,
        original_filename=filename,
        stored_filepath=stored_path,
        file_type=file_type,
        file_hash=file_hash,
        total_rows=total_rows,
        processed_rows=0,
        failed_rows=0,
        status="QUEUED"
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)

    return IngestionUploadResponse(
        job_id=job.id,
        organization_id=job.organization_id,
        original_filename=job.original_filename,
        file_type=job.file_type,
        file_hash=job.file_hash,
        status=job.status,
        detected_columns=headers,
        sample_rows=sample_rows,
        suggested_mapping=suggested,
        created_at=job.created_at
    )


@router.post(
    "/{job_id}/process",
    summary="Submit column mapping and trigger ingestion pipeline",
    description="Submits the column mapping dictionary and triggers row validation, raw preservation, normalization, and attribute extraction. Large files (>250 rows) mandate background Celery processing."
)
async def process_ingestion_job(
    job_id: uuid.UUID,
    payload: ProcessJobRequest,
    run_sync: bool = False,
    db: AsyncSession = Depends(get_db)
):
    job = (await db.execute(select(IngestionJob).where(IngestionJob.id == job_id))).scalars().first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"IngestionJob with ID {job_id} not found.")

    if job.status not in ["QUEUED", "FAILED", "PARTIALLY_COMPLETED"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Job is already in '{job.status}' state.")

    # Synchronous mode threshold safety
    if run_sync:
        if job.total_rows > MAX_SYNC_INGESTION_ROWS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Synchronous processing is limited to {MAX_SYNC_INGESTION_ROWS} rows for web worker safety. This file has {job.total_rows} rows and requires background Celery worker processing."
            )
        result = await execute_ingestion_job(job_id, payload.column_mapping, db)
        return {
            "message": "Ingestion job executed synchronously within safe row threshold.",
            "job_id": str(job_id),
            "execution_mode": "SYNCHRONOUS",
            "result": result
        }

    # Attempt Celery task dispatch
    try:
        task = process_ingestion_batch_task.delay(str(job_id), payload.column_mapping)
        job.status = "PROCESSING"
        await db.commit()
        return {
            "message": "Ingestion job queued for background Celery worker execution.",
            "job_id": str(job_id),
            "celery_task_id": task.id,
            "execution_mode": "CELERY_BACKGROUND"
        }
    except Exception as exc:
        # Fallback to direct async execution ONLY if below the safe row threshold
        if job.total_rows > MAX_SYNC_INGESTION_ROWS:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Background Celery worker is offline and file exceeds maximum synchronous processing limit of {MAX_SYNC_INGESTION_ROWS} rows (total: {job.total_rows}). Please start Redis and Celery worker."
            )
        result = await execute_ingestion_job(job_id, payload.column_mapping, db)
        return {
            "message": f"Celery broker unavailable; executed synchronously as fallback (within {MAX_SYNC_INGESTION_ROWS} row limit).",
            "job_id": str(job_id),
            "execution_mode": "FALLBACK_DIRECT",
            "result": result
        }


@router.get(
    "/{job_id}",
    response_model=IngestionJobStatusResponse,
    summary="Get ingestion job status and row processing counts"
)
async def get_ingestion_job_status(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    job = (await db.execute(select(IngestionJob).where(IngestionJob.id == job_id))).scalars().first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"IngestionJob with ID {job_id} not found.")

    return IngestionJobStatusResponse(
        job_id=job.id,
        organization_id=job.organization_id,
        source_system_id=job.source_system_id,
        original_filename=job.original_filename,
        file_type=job.file_type,
        status=job.status,
        total_rows=job.total_rows,
        processed_rows=job.processed_rows,
        failed_rows=job.failed_rows,
        column_mapping=job.column_mapping,
        error_summary=job.error_summary,
        created_at=job.created_at,
        updated_at=job.updated_at
    )


@router.get(
    "/{job_id}/errors",
    response_model=IngestionErrorListResponse,
    summary="Get row-level validation errors for an ingestion job"
)
async def get_ingestion_job_errors(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    job = (await db.execute(select(IngestionJob).where(IngestionJob.id == job_id))).scalars().first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"IngestionJob with ID {job_id} not found.")

    errors = job.error_summary or []
    return IngestionErrorListResponse(
        job_id=job.id,
        total_errors=len(errors),
        errors=errors
    )
