from typing import Generic, Optional, TypeVar, Any, Dict, List
from pydantic import BaseModel, Field
from datetime import datetime, timezone

T = TypeVar("T")


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[List[Dict[str, Any]]] = Field(default_factory=list)


class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    data: Optional[T] = None
    meta: Optional[Dict[str, Any]] = Field(default_factory=dict)
    error: Optional[ErrorDetail] = None
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
