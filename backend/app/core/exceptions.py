from typing import Any, Dict, List, Optional
from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse
from datetime import datetime, timezone
from app.core.config import settings
from app.core.logging import logger


class BaseAppException(Exception):
    def __init__(
        self,
        message: str,
        code: str = "INTERNAL_APPLICATION_ERROR",
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[List[Dict[str, Any]]] = None,
    ):
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or []
        super().__init__(self.message)


async def app_exception_handler(request: Request, exc: BaseAppException) -> JSONResponse:
    logger.error(f"Application error on {request.url.path}: {exc.code} - {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details,
            },
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": "HTTP_ERROR",
                "message": str(exc.detail),
                "details": [],
            },
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
        headers=exc.headers,
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Catches unhandled server exceptions, logs tracebacks server-side,
    and returns a sanitized generic error response to prevent leaking internals.
    """
    logger.exception(f"Unhandled server exception on {request.method} {request.url.path}: {str(exc)}")
    
    # In development, provide message for debugging; in production, keep generic
    if settings.ENVIRONMENT.lower() in ["production", "prod"]:
        err_msg = "An unexpected internal server error occurred. Please contact the administrator."
    else:
        err_msg = f"Internal Server Error: {str(exc)}"

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": err_msg,
                "details": [],
            },
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )
