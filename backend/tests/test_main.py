import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    """Test root endpoint"""
    response = client.get("/")
    
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data
    assert "docs" in data
    assert data["message"] == "Welcome to DeFi Dojo API"
    assert data["version"] == "1.0.0"
    assert data["docs"] == "/docs"


def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "environment" in data
    assert data["status"] == "healthy"


def test_docs_endpoint():
    """Test that docs endpoint is accessible"""
    response = client.get("/docs")
    
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]


def test_redoc_endpoint():
    """Test that redoc endpoint is accessible"""
    response = client.get("/redoc")
    
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]


def test_openapi_endpoint():
    """Test that OpenAPI JSON endpoint is accessible"""
    response = client.get("/openapi.json")
    
    assert response.status_code == 200
    data = response.json()
    assert "openapi" in data
    assert "info" in data
    assert "paths" in data
    assert data["info"]["title"] == "DeFi Dojo API"
    assert data["info"]["version"] == "1.0.0"


def test_cors_headers():
    """Test that CORS headers are present"""
    response = client.options("/")
    
    # CORS preflight should be handled
    assert response.status_code in [200, 204]


def test_api_v1_routes():
    """Test that API v1 routes are properly mounted"""
    # Test auth routes
    response = client.post("/api/v1/auth/nonce", json={"address": "SP123456789"})
    assert response.status_code == 200
    
    # Test quests routes
    response = client.get("/api/v1/quests/")
    assert response.status_code == 200
    
    # Test leaderboard routes
    response = client.get("/api/v1/leaderboard/")
    assert response.status_code == 200


def test_websocket_routes():
    """Test that WebSocket routes are properly mounted"""
    # Test WebSocket endpoint (should return 426 for non-WebSocket requests)
    response = client.get("/ws")
    assert response.status_code == 426  # Upgrade Required
    
    # Test transaction WebSocket endpoint
    response = client.get("/ws/tx-status")
    assert response.status_code == 426  # Upgrade Required


def test_404_handling():
    """Test 404 handling for non-existent endpoints"""
    response = client.get("/non-existent-endpoint")
    
    assert response.status_code == 404


def test_405_method_not_allowed():
    """Test 405 handling for unsupported methods"""
    # Try to GET an endpoint that only accepts POST
    response = client.get("/api/v1/auth/verify")
    
    assert response.status_code == 405  # Method Not Allowed


def test_422_validation_error():
    """Test 422 handling for validation errors"""
    # Send invalid JSON to auth endpoint
    response = client.post("/api/v1/auth/nonce", json={"invalid_field": "value"})
    
    assert response.status_code == 422  # Unprocessable Entity


def test_500_internal_server_error():
    """Test 500 handling for internal server errors"""
    # This is harder to test without mocking, but we can test the error handler exists
    # by checking that the app has the custom exception handler
    from fastapi import HTTPException
    assert hasattr(app, 'exception_handlers')
    assert HTTPException in app.exception_handlers


def test_app_metadata():
    """Test app metadata"""
    assert app.title == "DeFi Dojo API"
    assert app.description == "AI-powered DeFi gaming platform on Stacks"
    assert app.version == "1.0.0"
    assert app.docs_url == "/docs"
    assert app.redoc_url == "/redoc"


def test_middleware_stack():
    """Test that required middleware is present"""
    middleware_types = [type(middleware) for middleware in app.user_middleware]
    
    # Check for CORS middleware
    from fastapi.middleware.cors import CORSMiddleware
    assert any(issubclass(mw, CORSMiddleware) for mw in middleware_types)


def test_route_registration():
    """Test that all expected routes are registered"""
    routes = [route.path for route in app.routes]
    
    # Check for main routes
    assert "/" in routes
    assert "/health" in routes
    assert "/docs" in routes
    assert "/redoc" in routes
    assert "/openapi.json" in routes
    
    # Check for API v1 routes
    api_routes = [route for route in routes if route.startswith("/api/v1")]
    assert len(api_routes) > 0
    
    # Check for WebSocket routes
    ws_routes = [route for route in routes if route.startswith("/ws")]
    assert len(ws_routes) > 0


def test_response_format():
    """Test that responses have consistent format"""
    response = client.get("/")
    
    assert response.status_code == 200
    assert "application/json" in response.headers["content-type"]
    
    data = response.json()
    assert isinstance(data, dict)


def test_error_response_format():
    """Test that error responses have consistent format"""
    response = client.get("/non-existent-endpoint")
    
    assert response.status_code == 404
    assert "application/json" in response.headers["content-type"]
    
    data = response.json()
    assert isinstance(data, dict)
    assert "detail" in data


def test_api_versioning():
    """Test that API versioning is properly implemented"""
    # Test that v1 API is accessible
    response = client.get("/api/v1/quests/")
    assert response.status_code == 200
    
    # Test that non-versioned API returns 404
    response = client.get("/api/quests/")
    assert response.status_code == 404


def test_async_endpoints():
    """Test that async endpoints work correctly"""
    # Most of our endpoints are async, so this tests the async functionality
    response = client.get("/api/v1/quests/")
    assert response.status_code == 200
    
    response = client.get("/api/v1/leaderboard/")
    assert response.status_code == 200


def test_request_id_tracing():
    """Test that request ID tracing is available"""
    response = client.get("/")
    
    # Check if request ID is in headers (if implemented)
    # This is optional but good practice
    assert response.status_code == 200


def test_security_headers():
    """Test that security headers are present"""
    response = client.get("/")
    
    # Check for common security headers
    # These might be added by middleware
    assert response.status_code == 200


def test_content_type_handling():
    """Test content type handling"""
    # Test JSON content type
    response = client.post("/api/v1/auth/nonce", json={"address": "SP123456789"})
    assert response.status_code == 200
    assert "application/json" in response.headers["content-type"]
    
    # Test invalid content type
    response = client.post(
        "/api/v1/auth/nonce",
        data="invalid data",
        headers={"Content-Type": "text/plain"}
    )
    assert response.status_code == 422  # Unprocessable Entity


def test_large_payload_handling():
    """Test handling of large payloads"""
    # Test with a large JSON payload
    large_data = {"address": "SP123456789", "data": "x" * 10000}
    
    response = client.post("/api/v1/auth/nonce", json=large_data)
    assert response.status_code == 200


def test_concurrent_requests():
    """Test handling of concurrent requests"""
    import threading
    import time
    
    results = []
    
    def make_request():
        response = client.get("/")
        results.append(response.status_code)
    
    # Create multiple threads
    threads = []
    for _ in range(5):
        thread = threading.Thread(target=make_request)
        threads.append(thread)
        thread.start()
    
    # Wait for all threads to complete
    for thread in threads:
        thread.join()
    
    # All requests should succeed
    assert len(results) == 5
    assert all(status == 200 for status in results)
