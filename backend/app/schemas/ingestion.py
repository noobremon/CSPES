import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class ColumnDiscoveryResponse(BaseModel):
    filename: str
    file_type: str
    detected_columns: List[str]
    estimated_row_count: int
    sample_rows: List[Dict[str, Any]]
    suggested_mapping: Dict[str, str] = Field(default_factory=dict)


class IngestionUploadResponse(BaseModel):
    job_id: uuid.UUID
    organization_id: uuid.UUID
    original_filename: str
    file_type: str
    file_hash: str
    status: str
    detected_columns: List[str]
    sample_rows: List[Dict[str, Any]]
    suggested_mapping: Dict[str, str]
    created_at: datetime


class ProcessJobRequest(BaseModel):
    column_mapping: Dict[str, str] = Field(
        ...,
        description="Mapping from canonical field names to file column headers. Required: 'material_code', 'description'",
        json_schema_extra={
            "example": {
                "material_code": "MAT_CODE",
                "description": "ITEM_DESCRIPTION",
                "unit_of_measure": "UOM",
                "specification": "SPEC_DETAILS",
                "category": "CATEGORY",
                "manufacturer": "OEM_NAME"
            }
        }
    )


class IngestionErrorItem(BaseModel):
    row_number: int
    column: Optional[str] = None
    original_value: Optional[str] = None
    reason: str


class IngestionJobStatusResponse(BaseModel):
    job_id: uuid.UUID
    organization_id: uuid.UUID
    source_system_id: Optional[uuid.UUID]
    original_filename: str
    file_type: str
    status: str
    total_rows: int
    processed_rows: int
    failed_rows: int
    column_mapping: Optional[Dict[str, str]] = None
    error_summary: Optional[List[Dict[str, Any]]] = None
    created_at: datetime
    updated_at: datetime


class IngestionErrorListResponse(BaseModel):
    job_id: uuid.UUID
    total_errors: int
    errors: List[Dict[str, Any]]
