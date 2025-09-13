import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import get_db
from app.core.security import generate_nonce, store_nonce, verify_nonce

client = TestClient(app)


def test_get_nonce():
    """Test nonce generation endpoint"""
    response = client.post("/api/v1/auth/nonce", json={"address": "SP123456789"})
    assert response.status_code == 200
    data = response.json()
    assert "nonce" in data
    assert len(data["nonce"]) == 64  # 32 bytes hex


def test_verify_signature():
    """Test signature verification endpoint"""
    # First get a nonce
    nonce_response = client.post("/api/v1/auth/nonce", json={"address": "SP123456789"})
    nonce = nonce_response.json()["nonce"]
    
    # Verify signature (using mock signature for testing)
    response = client.post("/api/v1/auth/verify", json={
        "address": "SP123456789",
        "signature": "mock_signature",
        "nonce": nonce
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    assert "user" in data
    assert data["user"]["wallet_address"] == "SP123456789"


def test_verify_invalid_nonce():
    """Test signature verification with invalid nonce"""
    response = client.post("/api/v1/auth/verify", json={
        "address": "SP123456789",
        "signature": "mock_signature",
        "nonce": "invalid_nonce"
    })
    
    assert response.status_code == 400
    assert "Invalid or expired nonce" in response.json()["detail"]


def test_verify_invalid_signature():
    """Test signature verification with invalid signature"""
    # First get a nonce
    nonce_response = client.post("/api/v1/auth/nonce", json={"address": "SP123456789"})
    nonce = nonce_response.json()["nonce"]
    
    # Verify with empty signature
    response = client.post("/api/v1/auth/verify", json={
        "address": "SP123456789",
        "signature": "",
        "nonce": nonce
    })
    
    assert response.status_code == 400
    assert "Invalid signature" in response.json()["detail"]
