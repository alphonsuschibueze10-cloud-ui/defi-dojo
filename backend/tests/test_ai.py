import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from app.main import app
from app.core.database import get_db
from app.models.user import User
from app.models.quest import Quest, UserQuest
from app.models.ai_run import AIRun
import uuid

client = TestClient(app)


@pytest.fixture
def mock_db():
    """Mock database session"""
    from sqlalchemy.orm import Session
    return Session()


@pytest.fixture
def sample_user():
    """Create a sample user"""
    return User(
        id=uuid.uuid4(),
        wallet_address="SP123456789",
        display_name="Test User"
    )


@pytest.fixture
def sample_quest():
    """Create a sample quest"""
    return Quest(
        id=uuid.uuid4(),
        slug="test-quest",
        title="Test Quest",
        description="A test quest",
        difficulty=1,
        active=True
    )


@pytest.fixture
def sample_user_quest(sample_user, sample_quest):
    """Create a sample user quest"""
    return UserQuest(
        id=uuid.uuid4(),
        user_id=sample_user.id,
        quest_id=sample_quest.id,
        state="started",
        server_seed="test-seed"
    )


def test_request_ai_hint_success(sample_user, sample_user_quest):
    """Test successful AI hint request"""
    with patch('app.api.v1.ai.get_current_user', return_value=sample_user), \
         patch('app.api.v1.ai.get_db') as mock_get_db, \
         patch('app.api.v1.ai.background_tasks') as mock_bg_tasks:
        
        # Mock database session
        mock_db = mock_get_db.return_value
        mock_db.query.return_value.filter.return_value.first.return_value = sample_user_quest
        mock_db.add = AsyncMock()
        mock_db.commit = AsyncMock()
        mock_db.refresh = AsyncMock()
        
        response = client.post("/api/v1/ai/hint", json={
            "user_id": str(sample_user.id),
            "user_quest_id": str(sample_user_quest.id),
            "context": {"quest_step": 1, "balances": {}}
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "ai_run_id" in data
        assert data["status"] == "queued"


def test_request_ai_hint_quest_not_found(sample_user):
    """Test AI hint request with non-existent quest"""
    with patch('app.api.v1.ai.get_current_user', return_value=sample_user), \
         patch('app.api.v1.ai.get_db') as mock_get_db:
        
        mock_db = mock_get_db.return_value
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        response = client.post("/api/v1/ai/hint", json={
            "user_id": str(sample_user.id),
            "user_quest_id": str(uuid.uuid4()),
            "context": {"quest_step": 1}
        })
        
        assert response.status_code == 404
        assert "Quest instance not found" in response.json()["detail"]


def test_request_ai_hint_quest_not_active(sample_user, sample_user_quest):
    """Test AI hint request for inactive quest"""
    sample_user_quest.state = "completed"
    
    with patch('app.api.v1.ai.get_current_user', return_value=sample_user), \
         patch('app.api.v1.ai.get_db') as mock_get_db:
        
        mock_db = mock_get_db.return_value
        mock_db.query.return_value.filter.return_value.first.return_value = sample_user_quest
        
        response = client.post("/api/v1/ai/hint", json={
            "user_id": str(sample_user.id),
            "user_quest_id": str(sample_user_quest.id),
            "context": {"quest_step": 1}
        })
        
        assert response.status_code == 400
        assert "Quest is not active" in response.json()["detail"]


def test_get_ai_hint_success(sample_user):
    """Test getting AI hint result"""
    ai_run = AIRun(
        id=uuid.uuid4(),
        user_id=sample_user.id,
        status="completed",
        response={"hint": "Test hint", "risk": "low", "param": "slippage: 0.5%"}
    )
    
    with patch('app.api.v1.ai.get_current_user', return_value=sample_user), \
         patch('app.api.v1.ai.get_db') as mock_get_db:
        
        mock_db = mock_get_db.return_value
        mock_db.query.return_value.filter.return_value.first.return_value = ai_run
        
        response = client.get(f"/api/v1/ai/hint/{ai_run.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "completed"
        assert data["hint"] == "Test hint"
        assert data["risk"] == "low"
        assert data["param"] == "slippage: 0.5%"


def test_get_ai_hint_failed(sample_user):
    """Test getting failed AI hint result"""
    ai_run = AIRun(
        id=uuid.uuid4(),
        user_id=sample_user.id,
        status="failed"
    )
    
    with patch('app.api.v1.ai.get_current_user', return_value=sample_user), \
         patch('app.api.v1.ai.get_db') as mock_get_db:
        
        mock_db = mock_get_db.return_value
        mock_db.query.return_value.filter.return_value.first.return_value = ai_run
        
        response = client.get(f"/api/v1/ai/hint/{ai_run.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "failed"
        assert "trouble connecting" in data["hint"]


def test_get_ai_hint_pending(sample_user):
    """Test getting pending AI hint result"""
    ai_run = AIRun(
        id=uuid.uuid4(),
        user_id=sample_user.id,
        status="pending"
    )
    
    with patch('app.api.v1.ai.get_current_user', return_value=sample_user), \
         patch('app.api.v1.ai.get_db') as mock_get_db:
        
        mock_db = mock_get_db.return_value
        mock_db.query.return_value.filter.return_value.first.return_value = ai_run
        
        response = client.get(f"/api/v1/ai/hint/{ai_run.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "pending"
        assert "hint" not in data


def test_get_ai_hint_not_found(sample_user):
    """Test getting non-existent AI hint"""
    with patch('app.api.v1.ai.get_current_user', return_value=sample_user), \
         patch('app.api.v1.ai.get_db') as mock_get_db:
        
        mock_db = mock_get_db.return_value
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        response = client.get(f"/api/v1/ai/hint/{uuid.uuid4()}")
        
        assert response.status_code == 404
        assert "AI run not found" in response.json()["detail"]


@patch('app.api.v1.ai.generate_ai_hint_task')
def test_generate_ai_hint_task_success(mock_task, sample_user, sample_user_quest):
    """Test AI hint generation task success"""
    ai_run = AIRun(
        id=uuid.uuid4(),
        user_id=sample_user.id,
        quest_id=sample_user_quest.quest_id,
        user_quest_id=sample_user_quest.id,
        prompt="Test prompt",
        status="pending"
    )
    
    with patch('app.api.v1.ai.SessionLocal') as mock_session_local:
        mock_db = mock_session_local.return_value
        mock_db.query.return_value.filter.return_value.first.return_value = ai_run
        mock_db.commit = AsyncMock()
        mock_db.close = AsyncMock()
        
        # Import and call the function
        from app.api.v1.ai import generate_ai_hint_task
        import asyncio
        
        # Mock the Groq client
        with patch('app.services.groq_client.groq_client.generate_hint') as mock_generate:
            mock_generate.return_value = {
                "hint": "Test hint",
                "risk": "low",
                "param": "slippage: 0.5%"
            }
            
            asyncio.run(generate_ai_hint_task(str(ai_run.id), {"quest_step": 1}))
            
            # Verify the AI run was updated
            assert ai_run.status == "completed"
            assert ai_run.response == {
                "hint": "Test hint",
                "risk": "low",
                "param": "slippage: 0.5%"
            }


@patch('app.api.v1.ai.generate_ai_hint_task')
def test_generate_ai_hint_task_failure(mock_task, sample_user, sample_user_quest):
    """Test AI hint generation task failure"""
    ai_run = AIRun(
        id=uuid.uuid4(),
        user_id=sample_user.id,
        quest_id=sample_user_quest.quest_id,
        user_quest_id=sample_user_quest.id,
        prompt="Test prompt",
        status="pending"
    )
    
    with patch('app.api.v1.ai.SessionLocal') as mock_session_local:
        mock_db = mock_session_local.return_value
        mock_db.query.return_value.filter.return_value.first.return_value = ai_run
        mock_db.commit = AsyncMock()
        mock_db.close = AsyncMock()
        
        # Import and call the function
        from app.api.v1.ai import generate_ai_hint_task
        import asyncio
        
        # Mock the Groq client to raise an exception
        with patch('app.services.groq_client.groq_client.generate_hint') as mock_generate:
            mock_generate.side_effect = Exception("API Error")
            
            asyncio.run(generate_ai_hint_task(str(ai_run.id), {"quest_step": 1}))
            
            # Verify the AI run was marked as failed
            assert ai_run.status == "failed"
            assert "error" in ai_run.response
