import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_list_quests():
    """Test listing quests endpoint"""
    response = client.get("/api/v1/quests/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    
    # Check if we have seeded quests
    if data:
        quest = data[0]
        assert "id" in quest
        assert "slug" in quest
        assert "title" in quest
        assert "difficulty" in quest
        assert "active" in quest


def test_start_quest_unauthorized():
    """Test starting quest without authentication"""
    response = client.post("/api/v1/quests/test-quest-id/start", json={})
    assert response.status_code == 401


def test_quest_action_unauthorized():
    """Test quest action without authentication"""
    response = client.post("/api/v1/quests/test-quest-id/action", json={
        "user_quest_id": "test-user-quest-id",
        "action": "test_action",
        "payload": {}
    })
    assert response.status_code == 401


def test_quest_status_unauthorized():
    """Test quest status without authentication"""
    response = client.get("/api/v1/quests/test-user-quest-id/status")
    assert response.status_code == 401
