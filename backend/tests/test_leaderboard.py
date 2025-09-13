import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app
from app.models.user import User
from app.models.quest import UserQuest
import uuid

client = TestClient(app)


@pytest.fixture
def sample_users():
    """Create sample users"""
    return [
        User(
            id=uuid.uuid4(),
            wallet_address="SP111111111",
            display_name="User 1"
        ),
        User(
            id=uuid.uuid4(),
            wallet_address="SP222222222",
            display_name="User 2"
        ),
        User(
            id=uuid.uuid4(),
            wallet_address="SP333333333",
            display_name="User 3"
        )
    ]


@pytest.fixture
def sample_user_quests(sample_users):
    """Create sample user quests with scores"""
    return [
        UserQuest(
            id=uuid.uuid4(),
            user_id=sample_users[0].id,
            quest_id=uuid.uuid4(),
            state="completed",
            score=100.0
        ),
        UserQuest(
            id=uuid.uuid4(),
            user_id=sample_users[0].id,
            quest_id=uuid.uuid4(),
            state="completed",
            score=50.0
        ),
        UserQuest(
            id=uuid.uuid4(),
            user_id=sample_users[1].id,
            quest_id=uuid.uuid4(),
            state="completed",
            score=75.0
        ),
        UserQuest(
            id=uuid.uuid4(),
            user_id=sample_users[2].id,
            quest_id=uuid.uuid4(),
            state="completed",
            score=25.0
        )
    ]


def test_get_leaderboard_success(sample_users, sample_user_quests):
    """Test successful leaderboard retrieval"""
    with patch('app.api.v1.leaderboard.get_db') as mock_get_db:
        mock_db = mock_get_db.return_value
        
        # Mock the subquery for user XP
        mock_subquery = MagicMock()
        mock_subquery.c.total_xp = "total_xp"
        mock_subquery.c.quest_count = "quest_count"
        mock_subquery.c.user_id = "user_id"
        
        # Mock the main query result
        mock_result = [
            (sample_users[0].id, sample_users[0].wallet_address, sample_users[0].display_name, 150.0, 2),
            (sample_users[1].id, sample_users[1].wallet_address, sample_users[1].display_name, 75.0, 1),
            (sample_users[2].id, sample_users[2].wallet_address, sample_users[2].display_name, 25.0, 1)
        ]
        
        mock_db.query.return_value.join.return_value.order_by.return_value.limit.return_value.all.return_value = mock_result
        
        # Mock the badges query
        mock_db.query.return_value.filter.return_value.all.return_value = [
            (uuid.uuid4(),),
            (uuid.uuid4(),)
        ]
        
        response = client.get("/api/v1/leaderboard/?limit=10")
        
        assert response.status_code == 200
        data = response.json()
        assert "entries" in data
        assert "total" in data
        assert "updated_at" in data
        assert len(data["entries"]) == 3
        
        # Check that entries are ordered by XP (highest first)
        assert data["entries"][0]["xp"] == 150
        assert data["entries"][1]["xp"] == 75
        assert data["entries"][2]["xp"] == 25


def test_get_leaderboard_with_limit(sample_users, sample_user_quests):
    """Test leaderboard with custom limit"""
    with patch('app.api.v1.leaderboard.get_db') as mock_get_db:
        mock_db = mock_get_db.return_value
        
        # Mock the subquery for user XP
        mock_subquery = MagicMock()
        mock_subquery.c.total_xp = "total_xp"
        mock_subquery.c.quest_count = "quest_count"
        mock_subquery.c.user_id = "user_id"
        
        # Mock the main query result (only 2 users)
        mock_result = [
            (sample_users[0].id, sample_users[0].wallet_address, sample_users[0].display_name, 150.0, 2),
            (sample_users[1].id, sample_users[1].wallet_address, sample_users[1].display_name, 75.0, 1)
        ]
        
        mock_db.query.return_value.join.return_value.order_by.return_value.limit.return_value.all.return_value = mock_result
        
        # Mock the badges query
        mock_db.query.return_value.filter.return_value.all.return_value = [
            (uuid.uuid4(),),
            (uuid.uuid4(),)
        ]
        
        response = client.get("/api/v1/leaderboard/?limit=2")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["entries"]) == 2


def test_get_leaderboard_empty(sample_users):
    """Test leaderboard with no completed quests"""
    with patch('app.api.v1.leaderboard.get_db') as mock_get_db:
        mock_db = mock_get_db.return_value
        
        # Mock empty result
        mock_db.query.return_value.join.return_value.order_by.return_value.limit.return_value.all.return_value = []
        
        response = client.get("/api/v1/leaderboard/")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["entries"]) == 0
        assert data["total"] == 0


def test_get_user_rank_success(sample_users, sample_user_quests):
    """Test getting specific user's rank"""
    target_user = sample_users[1]  # User with 75 XP
    
    with patch('app.api.v1.leaderboard.get_db') as mock_get_db:
        mock_db = mock_get_db.return_value
        
        # Mock user XP calculation
        mock_db.query.return_value.filter.return_value.scalar.return_value = 75.0
        
        # Mock higher XP count (users with more than 75 XP)
        mock_db.query.return_value.join.return_value.filter.return_value.group_by.return_value.having.return_value.count.return_value = 1
        
        # Mock user info
        mock_db.query.return_value.filter.return_value.first.return_value = target_user
        
        # Mock completed quests
        mock_db.query.return_value.filter.return_value.all.return_value = [
            UserQuest(id=uuid.uuid4(), quest_id=uuid.uuid4(), state="completed")
        ]
        
        response = client.get(f"/api/v1/leaderboard/user/{target_user.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == str(target_user.id)
        assert data["display_name"] == target_user.display_name
        assert data["wallet_address"] == target_user.wallet_address
        assert data["xp"] == 75
        assert data["rank"] == 2  # Second place
        assert data["completed_quests"] == 1


def test_get_user_rank_not_found():
    """Test getting rank for non-existent user"""
    with patch('app.api.v1.leaderboard.get_db') as mock_get_db:
        mock_db = mock_get_db.return_value
        
        # Mock user XP calculation
        mock_db.query.return_value.filter.return_value.scalar.return_value = 0
        
        # Mock higher XP count
        mock_db.query.return_value.join.return_value.filter.return_value.group_by.return_value.having.return_value.count.return_value = 0
        
        # Mock user not found
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        response = client.get(f"/api/v1/leaderboard/user/{uuid.uuid4()}")
        
        assert response.status_code == 200
        data = response.json()
        assert "error" in data
        assert data["error"] == "User not found"


def test_get_user_rank_no_xp(sample_users):
    """Test getting rank for user with no XP"""
    target_user = sample_users[0]
    
    with patch('app.api.v1.leaderboard.get_db') as mock_get_db:
        mock_db = mock_get_db.return_value
        
        # Mock user XP calculation (no XP)
        mock_db.query.return_value.filter.return_value.scalar.return_value = 0
        
        # Mock higher XP count
        mock_db.query.return_value.join.return_value.filter.return_value.group_by.return_value.having.return_value.count.return_value = 0
        
        # Mock user info
        mock_db.query.return_value.filter.return_value.first.return_value = target_user
        
        # Mock completed quests (none)
        mock_db.query.return_value.filter.return_value.all.return_value = []
        
        response = client.get(f"/api/v1/leaderboard/user/{target_user.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["xp"] == 0
        assert data["rank"] == 1  # First place (only user)
        assert data["completed_quests"] == 0


def test_get_leaderboard_invalid_limit():
    """Test leaderboard with invalid limit parameter"""
    response = client.get("/api/v1/leaderboard/?limit=0")
    assert response.status_code == 422  # Validation error


def test_get_leaderboard_high_limit():
    """Test leaderboard with limit exceeding maximum"""
    response = client.get("/api/v1/leaderboard/?limit=1000")
    assert response.status_code == 422  # Validation error


def test_get_leaderboard_default_limit(sample_users, sample_user_quests):
    """Test leaderboard with default limit (no limit parameter)"""
    with patch('app.api.v1.leaderboard.get_db') as mock_get_db:
        mock_db = mock_get_db.return_value
        
        # Mock the subquery for user XP
        mock_subquery = MagicMock()
        mock_subquery.c.total_xp = "total_xp"
        mock_subquery.c.quest_count = "quest_count"
        mock_subquery.c.user_id = "user_id"
        
        # Mock the main query result
        mock_result = [
            (sample_users[0].id, sample_users[0].wallet_address, sample_users[0].display_name, 150.0, 2)
        ]
        
        mock_db.query.return_value.join.return_value.order_by.return_value.limit.return_value.all.return_value = mock_result
        
        # Mock the badges query
        mock_db.query.return_value.filter.return_value.all.return_value = [
            (uuid.uuid4(),)
        ]
        
        response = client.get("/api/v1/leaderboard/")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["entries"]) == 1
