"""
Pytest configuration and fixtures for DeFi Dojo backend tests
"""

import pytest
import asyncio
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import tempfile
import os
import uuid

from app.main import app
from app.core.database import get_db, Base
from app.models.user import User
from app.models.quest import Quest, UserQuest
from app.models.ai_run import AIRun
from app.models.reward_transaction import RewardTransaction
from app.core.security import create_access_token


# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test."""
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create session
    session = TestingSessionLocal()
    
    try:
        yield session
    finally:
        session.close()
        # Drop tables
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database override."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


@pytest.fixture
def sample_user():
    """Create a sample user for testing."""
    return User(
        id=uuid.uuid4(),
        wallet_address="SP123456789",
        display_name="Test User"
    )


@pytest.fixture
def sample_quest():
    """Create a sample quest for testing."""
    return Quest(
        id=uuid.uuid4(),
        slug="test-quest",
        title="Test Quest",
        description="A test quest for DeFi Dojo",
        difficulty=1,
        reward_json={"xp": 50, "badge": "test-badge", "badge_id": 1},
        active=True
    )


@pytest.fixture
def sample_user_quest(sample_user, sample_quest):
    """Create a sample user quest for testing."""
    return UserQuest(
        id=uuid.uuid4(),
        user_id=sample_user.id,
        quest_id=sample_quest.id,
        state="started",
        server_seed="test-seed-123"
    )


@pytest.fixture
def sample_ai_run(sample_user, sample_quest, sample_user_quest):
    """Create a sample AI run for testing."""
    return AIRun(
        id=uuid.uuid4(),
        user_id=sample_user.id,
        quest_id=sample_quest.id,
        user_quest_id=sample_user_quest.id,
        prompt="Test prompt",
        status="pending"
    )


@pytest.fixture
def sample_reward_transaction(sample_user, sample_user_quest):
    """Create a sample reward transaction for testing."""
    return RewardTransaction(
        id=uuid.uuid4(),
        user_id=sample_user.id,
        user_quest_id=sample_user_quest.id,
        status="pending"
    )


@pytest.fixture
def auth_token(sample_user):
    """Create an auth token for testing."""
    data = {"sub": str(sample_user.id)}
    return create_access_token(data)


@pytest.fixture
def authenticated_client(client, auth_token):
    """Create an authenticated test client."""
    client.headers.update({"Authorization": f"Bearer {auth_token}"})
    return client


@pytest.fixture
def mock_groq_client():
    """Mock Groq client for testing."""
    from unittest.mock import AsyncMock, MagicMock
    
    mock_client = MagicMock()
    mock_client.chat_completion = AsyncMock(return_value={
        "choices": [{"message": {"content": "Test response"}}]
    })
    mock_client.generate_hint = AsyncMock(return_value={
        "hint": "Test hint",
        "risk": "low",
        "param": "slippage: 0.5%"
    })
    
    return mock_client


@pytest.fixture
def mock_redis():
    """Mock Redis client for testing."""
    from unittest.mock import MagicMock
    
    mock_redis = MagicMock()
    mock_redis.get = MagicMock(return_value=None)
    mock_redis.set = MagicMock(return_value=True)
    mock_redis.delete = MagicMock(return_value=True)
    mock_redis.exists = MagicMock(return_value=False)
    
    return mock_redis


@pytest.fixture
def mock_celery():
    """Mock Celery for testing."""
    from unittest.mock import MagicMock
    
    mock_celery = MagicMock()
    mock_celery.send_task = MagicMock(return_value=MagicMock(id="test-task-id"))
    
    return mock_celery


@pytest.fixture(autouse=True)
def cleanup_test_files():
    """Clean up test files after each test."""
    yield
    
    # Clean up any test files
    test_files = ["test.db", "test.db-journal"]
    for file in test_files:
        if os.path.exists(file):
            try:
                os.remove(file)
            except:
                pass


# Test markers
def pytest_configure(config):
    """Configure pytest markers."""
    config.addinivalue_line("markers", "unit: Unit tests")
    config.addinivalue_line("markers", "integration: Integration tests")
    config.addinivalue_line("markers", "slow: Slow tests")
    config.addinivalue_line("markers", "auth: Authentication tests")
    config.addinivalue_line("markers", "quests: Quest-related tests")
    config.addinivalue_line("markers", "ai: AI-related tests")
    config.addinivalue_line("markers", "rewards: Reward-related tests")
    config.addinivalue_line("markers", "leaderboard: Leaderboard tests")
    config.addinivalue_line("markers", "websocket: WebSocket tests")
    config.addinivalue_line("markers", "core: Core functionality tests")
    config.addinivalue_line("markers", "main: Main application tests")
    config.addinivalue_line("markers", "services: Service layer tests")


# Async test support
@pytest.fixture(scope="session")
def anyio_backend():
    """Use asyncio backend for anyio."""
    return "asyncio"
