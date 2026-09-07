import pytest
from app.workers.tasks import ping_task


@pytest.mark.asyncio
async def test_root_endpoint(client):
    response = await client.get("/")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    assert "National Unified Material Master Framework" in json_data["message"]


@pytest.mark.asyncio
async def test_health_liveness_endpoint(client):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    assert json_data["data"]["status"] == "healthy"
    assert json_data["data"]["environment"] == "development"


def test_celery_ping_task_execution():
    # Directly test the Celery task function logic locally without broker
    result = ping_task("technical_verification")
    assert result["status"] == "success"
    assert "pong: technical_verification" in result["message"]
    assert "worker_timestamp" in result
