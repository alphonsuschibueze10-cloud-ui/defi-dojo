import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from app.main import app
from app.models.user import User
from app.models.quest import Quest, UserQuest
from app.models.reward_transaction import RewardTransaction
import uuid

client = TestClient(app)


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
        reward_json={"xp": 50, "badge": "test-badge", "badge_id": 1},
        active=True
    )


@pytest.fixture
def sample_user_quest(sample_user, sample_quest):
    """Create a sample completed user quest"""
    return UserQuest(
        id=uuid.uuid4(),
        user_id=sample_user.id,
        quest_id=sample_quest.id,
        state="completed",
        score=100.0
    )


def test_prepare_reward_success(sample_user, sample_user_quest, sample_quest):
    """Test successful reward preparation"""
    with patch('app.api.v1.rewards.get_current_user', return_value=sample_user), \
         patch('app.api.v1.rewards.get_db') as mock_get_db:
        
        mock_db = mock_get_db.return_value
        mock_db.query.return_value.filter.return_value.first.return_value = sample_user_quest
        mock_db.query.return_value.filter.return_value.first.return_value = None  # No existing reward
        mock_db.add = AsyncMock()
        mock_db.commit = AsyncMock()
        mock_db.refresh = AsyncMock()
        
        # Mock the quest relationship
        sample_user_quest.quest = sample_quest
        
        response = client.post("/api/v1/rewards/prepare", json={
            "user_quest_id": str(sample_user_quest.id)
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "mint_payload_id" in data
        assert "unsigned_tx" in data
        assert "instructions" in data
        assert data["unsigned_tx"]["function"] == "mint-badge"


def test_prepare_reward_quest_not_found(sample_user):
    """Test reward preparation with non-existent quest"""
    with patch('app.api.v1.rewards.get_current_user', return_value=sample_user), \
         patch('app.api.v1.rewards.get_db') as mock_get_db:
        
        mock_db = mock_get_db.return_value
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        response = client.post("/api/v1/rewards/prepare", json={
            "user_quest_id": str(uuid.uuid4())
        })
        
        assert response.status_code == 404
        assert "Completed quest not found" in response.json()["detail"]


def test_prepare_reward_quest_not_completed(sample_user, sample_user_quest):
    """Test reward preparation for non-completed quest"""
    sample_user_quest.state = "started"
    
    with patch('app.api.v1.rewards.get_current_user', return_value=sample_user), \
         patch('app.api.v1.rewards.get_db') as mock_get_db:
        
        mock_db = mock_get_db.return_value
        mock_db.query.return_value.filter.return_value.first.return_value = sample_user_quest
        
        response = client.post("/api/v1/rewards/prepare", json={
            "user_quest_id": str(sample_user_quest.id)
        })
        
        assert response.status_code == 404
        assert "Completed quest not found" in response.json()["detail"]


def test_prepare_reward_already_prepared(sample_user, sample_user_quest):
    """Test reward preparation when already prepared"""
    existing_reward = RewardTransaction(
        id=uuid.uuid4(),
        user_id=sample_user.id,
        user_quest_id=sample_user_quest.id,
        status="pending"
    )
    
    with patch('app.api.v1.rewards.get_current_user', return_value=sample_user), \
         patch('app.api.v1.rewards.get_db') as mock_get_db:
        
        mock_db = mock_get_db.return_value
        # First query returns the user quest, second returns existing reward
        mock_db.query.return_value.filter.return_value.first.side_effect = [sample_user_quest, existing_reward]
        
        response = client.post("/api/v1/rewards/prepare", json={
            "user_quest_id": str(sample_user_quest.id)
        })
        
        assert response.status_code == 400
        assert "Reward already prepared" in response.json()["detail"]


def test_execute_reward_with_signed_tx(sample_user):
    """Test reward execution with signed transaction"""
    reward_tx = RewardTransaction(
        id=uuid.uuid4(),
        user_id=sample_user.id,
        status="pending"
    )
    
    with patch('app.api.v1.rewards.get_current_user', return_value=sample_user), \
         patch('app.api.v1.rewards.get_db') as mock_get_db, \
         patch('app.api.v1.rewards.background_tasks') as mock_bg_tasks:
        
        mock_db = mock_get_db.return_value
        mock_db.query.return_value.filter.return_value.first.return_value = reward_tx
        mock_db.commit = AsyncMock()
        
        response = client.post("/api/v1/rewards/execute", json={
            "signed_tx": "signed_transaction_data",
            "mint_payload_id": "test_payload_id"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "confirmed"
        assert "txid" in data


def test_execute_reward_with_txid(sample_user):
    """Test reward execution with transaction ID"""
    reward_tx = RewardTransaction(
        id=uuid.uuid4(),
        user_id=sample_user.id,
        status="pending"
    )
    
    with patch('app.api.v1.rewards.get_current_user', return_value=sample_user), \
         patch('app.api.v1.rewards.get_db') as mock_get_db, \
         patch('app.api.v1.rewards.background_tasks') as mock_bg_tasks:
        
        mock_db = mock_get_db.return_value
        mock_db.query.return_value.filter.return_value.first.return_value = reward_tx
        mock_db.commit = AsyncMock()
        
        response = client.post("/api/v1/rewards/execute", json={
            "txid": "test_transaction_id",
            "mint_payload_id": "test_payload_id"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "pending"
        assert data["txid"] == "test_transaction_id"


def test_execute_reward_no_pending_reward(sample_user):
    """Test reward execution with no pending reward"""
    with patch('app.api.v1.rewards.get_current_user', return_value=sample_user), \
         patch('app.api.v1.rewards.get_db') as mock_get_db:
        
        mock_db = mock_get_db.return_value
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        response = client.post("/api/v1/rewards/execute", json={
            "signed_tx": "signed_transaction_data",
            "mint_payload_id": "test_payload_id"
        })
        
        assert response.status_code == 404
        assert "No pending reward transaction found" in response.json()["detail"]


def test_execute_reward_missing_params(sample_user):
    """Test reward execution with missing parameters"""
    reward_tx = RewardTransaction(
        id=uuid.uuid4(),
        user_id=sample_user.id,
        status="pending"
    )
    
    with patch('app.api.v1.rewards.get_current_user', return_value=sample_user), \
         patch('app.api.v1.rewards.get_db') as mock_get_db:
        
        mock_db = mock_get_db.return_value
        mock_db.query.return_value.filter.return_value.first.return_value = reward_tx
        
        response = client.post("/api/v1/rewards/execute", json={
            "mint_payload_id": "test_payload_id"
        })
        
        assert response.status_code == 400
        assert "Either signed_tx or txid must be provided" in response.json()["detail"]


def test_get_reward_status_success(sample_user):
    """Test getting reward status successfully"""
    reward_tx = RewardTransaction(
        id=uuid.uuid4(),
        user_id=sample_user.id,
        txid="test_txid",
        status="confirmed"
    )
    
    with patch('app.api.v1.rewards.get_current_user', return_value=sample_user), \
         patch('app.api.v1.rewards.get_db') as mock_get_db, \
         patch('app.api.v1.rewards.verify_transaction_status', return_value=True) as mock_verify:
        
        mock_db = mock_get_db.return_value
        mock_db.query.return_value.filter.return_value.first.return_value = reward_tx
        mock_db.commit = AsyncMock()
        
        response = client.get("/api/v1/rewards/status?txid=test_txid")
        
        assert response.status_code == 200
        data = response.json()
        assert data["txid"] == "test_txid"
        assert data["status"] == "confirmed"
        assert data["confirmed"] is True


def test_get_reward_status_not_found(sample_user):
    """Test getting reward status for non-existent transaction"""
    with patch('app.api.v1.rewards.get_current_user', return_value=sample_user), \
         patch('app.api.v1.rewards.get_db') as mock_get_db:
        
        mock_db = mock_get_db.return_value
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        response = client.get("/api/v1/rewards/status?txid=nonexistent_txid")
        
        assert response.status_code == 404
        assert "Transaction not found" in response.json()["detail"]


@patch('app.api.v1.rewards.verify_transaction_status')
def test_verify_transaction_task_success(mock_verify, sample_user):
    """Test transaction verification task success"""
    reward_tx = RewardTransaction(
        id=uuid.uuid4(),
        user_id=sample_user.id,
        txid="test_txid",
        status="pending"
    )
    
    mock_verify.return_value = True
    
    with patch('app.api.v1.rewards.SessionLocal') as mock_session_local:
        mock_db = mock_session_local.return_value
        mock_db.query.return_value.filter.return_value.first.return_value = reward_tx
        mock_db.commit = AsyncMock()
        mock_db.close = AsyncMock()
        
        from app.api.v1.rewards import verify_transaction_task
        import asyncio
        
        asyncio.run(verify_transaction_task(str(reward_tx.id), "test_txid"))
        
        assert reward_tx.status == "confirmed"


@patch('app.api.v1.rewards.verify_transaction_status')
def test_verify_transaction_task_failure(mock_verify, sample_user):
    """Test transaction verification task failure"""
    reward_tx = RewardTransaction(
        id=uuid.uuid4(),
        user_id=sample_user.id,
        txid="test_txid",
        status="pending"
    )
    
    mock_verify.return_value = False
    
    with patch('app.api.v1.rewards.SessionLocal') as mock_session_local:
        mock_db = mock_session_local.return_value
        mock_db.query.return_value.filter.return_value.first.return_value = reward_tx
        mock_db.commit = AsyncMock()
        mock_db.close = AsyncMock()
        
        from app.api.v1.rewards import verify_transaction_task
        import asyncio
        
        asyncio.run(verify_transaction_task(str(reward_tx.id), "test_txid"))
        
        assert reward_tx.status == "failed"


@patch('app.api.v1.rewards.httpx.AsyncClient')
def test_verify_transaction_status_success(mock_client):
    """Test transaction status verification success"""
    mock_response = AsyncMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"tx_status": "success"}
    mock_client.return_value.__aenter__.return_value.get.return_value = mock_response
    
    from app.api.v1.rewards import verify_transaction_status
    import asyncio
    
    result = asyncio.run(verify_transaction_status("test_txid"))
    assert result is True


@patch('app.api.v1.rewards.httpx.AsyncClient')
def test_verify_transaction_status_failure(mock_client):
    """Test transaction status verification failure"""
    mock_response = AsyncMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"tx_status": "failed"}
    mock_client.return_value.__aenter__.return_value.get.return_value = mock_response
    
    from app.api.v1.rewards import verify_transaction_status
    import asyncio
    
    result = asyncio.run(verify_transaction_status("test_txid"))
    assert result is False


@patch('app.api.v1.rewards.httpx.AsyncClient')
def test_verify_transaction_status_exception(mock_client):
    """Test transaction status verification with exception"""
    mock_client.return_value.__aenter__.return_value.get.side_effect = Exception("Network error")
    
    from app.api.v1.rewards import verify_transaction_status
    import asyncio
    
    result = asyncio.run(verify_transaction_status("test_txid"))
    assert result is False
