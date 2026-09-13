import sys
import re
from loguru import logger
from .config import settings

# Regular expressions for sensitive patterns
_SENSITIVE_PATTERNS = [
    (re.compile(r'("password"\s*:\s*)"[^"]+"', re.IGNORECASE), r'\1"***REDACTED***"'),
    (re.compile(r'("access_token"\s*:\s*)"[^"]+"', re.IGNORECASE), r'\1"***REDACTED***"'),
    (re.compile(r'("refresh_token"\s*:\s*)"[^"]+"', re.IGNORECASE), r'\1"***REDACTED***"'),
    (re.compile(r'(Bearer\s+)[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.?[A-Za-z0-9\-_=]*', re.IGNORECASE), r'\1***REDACTED_JWT***'),
    (re.compile(r'("SECRET_KEY"\s*:\s*)"[^"]+"', re.IGNORECASE), r'\1"***REDACTED***"'),
]


def redact_sensitive_data(message: str) -> str:
    """Masks credentials, tokens, and secret strings from log messages."""
    redacted = message
    for pattern, repl in _SENSITIVE_PATTERNS:
        redacted = pattern.sub(repl, redacted)
    return redacted


def setup_logging():
    logger.remove()
    logger.add(
        sys.stdout,
        format="<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level=settings.LOG_LEVEL,
        colorize=True,
        filter=lambda record: True,
    )
    return logger
