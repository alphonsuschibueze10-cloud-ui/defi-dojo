import pytest
from unittest.mock import patch, MagicMock
from app.core.security import (
    generate_nonce, store_nonce, verify_nonce, 
    create_access_token, verify_token, verify_stacks_signature
)
from app.core.database import get_db, engine, Base
from app.core.config import settings
from datetime import datetime, timedelta
import uuid


def test_generate_nonce():
    """Test nonce generation"""
    nonce1 = generate_nonce()
    nonce2 = generate_nonce()
    
    # Nonces should be different
    assert nonce1 != nonce2
    
    # Nonces should be 64 characters (32 bytes hex)
    assert len(nonce1) == 64
    assert len(nonce2) == 64
    
    # Nonces should be hexadecimal
    assert all(c in '0123456789abcdef' for c in nonce1)
    assert all(c in '0123456789abcdef' for c in nonce2)


def test_store_and_verify_nonce():
    """Test storing and verifying nonces"""
    address = "SP123456789"
    nonce = "test_nonce_123"
    
    # Store nonce
    store_nonce(address, nonce)
    
    # Verify correct nonce
    assert verify_nonce(address, nonce) is True
    
    # Verify incorrect nonce
    assert verify_nonce(address, "wrong_nonce") is False
    
    # Verify nonce for different address
    assert verify_nonce("SP999999999", nonce) is False


def test_nonce_expiration():
    """Test nonce expiration"""
    address = "SP123456789"
    nonce = "test_nonce_123"
    
    # Store nonce
    store_nonce(address, nonce)
    
    # Verify nonce exists
    assert verify_nonce(address, nonce) is True
    
    # Mock time to be in the future (past expiration)
    with patch('app.core.security.datetime') as mock_datetime:
        mock_datetime.utcnow.return_value = datetime.utcnow() + timedelta(minutes=10)
        
        # Nonce should be expired
        assert verify_nonce(address, nonce) is False


def test_create_access_token():
    """Test access token creation"""
    data = {"sub": "test_user_id", "role": "user"}
    
    token = create_access_token(data)
    
    assert isinstance(token, str)
    assert len(token) > 0
    
    # Token should be different for different data
    data2 = {"sub": "test_user_id_2", "role": "user"}
    token2 = create_access_token(data2)
    assert token != token2


def test_create_access_token_with_expires_delta():
    """Test access token creation with custom expiration"""
    data = {"sub": "test_user_id"}
    expires_delta = timedelta(minutes=60)
    
    token = create_access_token(data, expires_delta)
    
    assert isinstance(token, str)
    assert len(token) > 0


def test_verify_token_success():
    """Test successful token verification"""
    data = {"sub": "test_user_id", "role": "user"}
    token = create_access_token(data)
    
    payload = verify_token(token)
    
    assert payload is not None
    assert payload["sub"] == "test_user_id"
    assert payload["role"] == "user"
    assert "exp" in payload


def test_verify_token_invalid():
    """Test token verification with invalid token"""
    invalid_token = "invalid.token.here"
    
    payload = verify_token(invalid_token)
    
    assert payload is None


def test_verify_token_expired():
    """Test token verification with expired token"""
    data = {"sub": "test_user_id"}
    # Create token with very short expiration
    expires_delta = timedelta(seconds=-1)  # Already expired
    token = create_access_token(data, expires_delta)
    
    payload = verify_token(token)
    
    assert payload is None


def test_verify_stacks_signature_valid():
    """Test valid Stacks signature verification"""
    address = "SP123456789"
    message = "test_message"
    signature = "valid_signature"
    
    result = verify_stacks_signature(address, message, signature)
    
    assert result is True


def test_verify_stacks_signature_invalid_address():
    """Test Stacks signature verification with invalid address"""
    address = "invalid_address"
    message = "test_message"
    signature = "valid_signature"
    
    result = verify_stacks_signature(address, message, signature)
    
    assert result is False


def test_verify_stacks_signature_empty_params():
    """Test Stacks signature verification with empty parameters"""
    # Empty address
    result = verify_stacks_signature("", "message", "signature")
    assert result is False
    
    # Empty message
    result = verify_stacks_signature("SP123456789", "", "signature")
    assert result is False
    
    # Empty signature
    result = verify_stacks_signature("SP123456789", "message", "")
    assert result is False
    
    # All empty
    result = verify_stacks_signature("", "", "")
    assert result is False


def test_verify_stacks_signature_non_stacks_address():
    """Test Stacks signature verification with non-Stacks address"""
    address = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"  # Bitcoin address
    message = "test_message"
    signature = "valid_signature"
    
    result = verify_stacks_signature(address, message, signature)
    
    assert result is False


def test_verify_stacks_signature_stacks_address():
    """Test Stacks signature verification with valid Stacks address"""
    address = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"  # Valid Stacks address
    message = "test_message"
    signature = "valid_signature"
    
    result = verify_stacks_signature(address, message, signature)
    
    assert result is True


def test_database_connection():
    """Test database connection"""
    # Test that we can get a database session
    db_gen = get_db()
    db = next(db_gen)
    
    assert db is not None
    
    # Clean up
    try:
        next(db_gen)
    except StopIteration:
        pass


def test_database_engine():
    """Test database engine configuration"""
    assert engine is not None
    assert str(engine.url).startswith("sqlite")


def test_settings_configuration():
    """Test settings configuration"""
    assert settings.database_url is not None
    assert settings.jwt_secret is not None
    assert settings.jwt_algorithm == "HS256"
    assert settings.jwt_expire_minutes == 30
    assert settings.environment in ["development", "production"]
    assert isinstance(settings.cors_origins, list)
    assert len(settings.cors_origins) > 0


def test_settings_default_values():
    """Test settings default values"""
    assert settings.jwt_algorithm == "HS256"
    assert settings.jwt_expire_minutes == 30
    assert settings.stacks_api_url == "https://stacks-node-api.testnet.stacks.co"


def test_nonce_store_cleanup():
    """Test that expired nonces are cleaned up"""
    from app.core.security import nonce_store
    
    # Clear the store
    nonce_store.clear()
    
    # Add some nonces
    store_nonce("SP111111111", "nonce1")
    store_nonce("SP222222222", "nonce2")
    
    # Verify they exist
    assert len(nonce_store) == 2
    assert verify_nonce("SP111111111", "nonce1") is True
    assert verify_nonce("SP222222222", "nonce2") is True
    
    # Mock time to expire one nonce
    with patch('app.core.security.datetime') as mock_datetime:
        mock_datetime.utcnow.return_value = datetime.utcnow() + timedelta(minutes=10)
        
        # Try to verify expired nonce (should clean up)
        assert verify_nonce("SP111111111", "nonce1") is False
        
        # Store should be cleaned up
        assert "SP111111111" not in nonce_store
        assert "SP222222222" in nonce_store


def test_token_payload_structure():
    """Test that token payload has correct structure"""
    data = {"sub": "test_user_id", "custom_field": "custom_value"}
    token = create_access_token(data)
    
    payload = verify_token(token)
    
    assert payload is not None
    assert "sub" in payload
    assert "exp" in payload
    assert "custom_field" in payload
    assert payload["sub"] == "test_user_id"
    assert payload["custom_field"] == "custom_value"


def test_multiple_nonces_same_address():
    """Test handling multiple nonces for same address"""
    address = "SP123456789"
    
    # Store first nonce
    nonce1 = "first_nonce"
    store_nonce(address, nonce1)
    
    # Store second nonce (should replace first)
    nonce2 = "second_nonce"
    store_nonce(address, nonce2)
    
    # First nonce should be invalid
    assert verify_nonce(address, nonce1) is False
    
    # Second nonce should be valid
    assert verify_nonce(address, nonce2) is True


def test_database_session_cleanup():
    """Test that database sessions are properly cleaned up"""
    # Get a database session
    db_gen = get_db()
    db = next(db_gen)
    
    # Verify session is active
    assert db is not None
    
    # Complete the generator (should trigger cleanup)
    try:
        next(db_gen)
    except StopIteration:
        pass
    
    # Session should be closed (we can't easily test this without mocking)
    # but the generator should complete without error
