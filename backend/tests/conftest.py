import os
import sys
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.fixture(autouse=True)
def reset_rate_limiter():
    from app.core.rate_limiter import clear_rate_limiter_cache
    clear_rate_limiter_cache()
    yield
    clear_rate_limiter_cache()
    app.dependency_overrides.clear()


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
