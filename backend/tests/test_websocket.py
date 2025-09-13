import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app
from app.websocket.manager import ConnectionManager
from app.core.security import verify_token
import json

client = TestClient(app)


@pytest.fixture
def mock_token_payload():
    """Mock JWT token payload"""
    return {
        "sub": "test-user-id",
        "exp": 1234567890
    }


def test_websocket_connection_success(mock_token_payload):
    """Test successful WebSocket connection"""
    with patch('app.websocket.routes.verify_token', return_value=mock_token_payload):
        with client.websocket_connect("/ws?token=valid_token") as websocket:
            # Should receive welcome message
            data = websocket.receive_text()
            message = json.loads(data)
            assert message["type"] == "connected"
            assert "Connected to DeFi Dojo real-time updates" in message["message"]


def test_websocket_connection_invalid_token():
    """Test WebSocket connection with invalid token"""
    with patch('app.websocket.routes.verify_token', return_value=None):
        with pytest.raises(Exception):  # WebSocket should close with error
            with client.websocket_connect("/ws?token=invalid_token") as websocket:
                pass


def test_websocket_connection_missing_token():
    """Test WebSocket connection without token"""
    with pytest.raises(Exception):  # WebSocket should close with error
        with client.websocket_connect("/ws") as websocket:
            pass


def test_websocket_connection_invalid_payload():
    """Test WebSocket connection with invalid token payload"""
    with patch('app.websocket.routes.verify_token', return_value={"invalid": "payload"}):
        with pytest.raises(Exception):  # WebSocket should close with error
            with client.websocket_connect("/ws?token=invalid_payload_token") as websocket:
                pass


def test_websocket_ping_pong(mock_token_payload):
    """Test WebSocket ping-pong functionality"""
    with patch('app.websocket.routes.verify_token', return_value=mock_token_payload):
        with client.websocket_connect("/ws?token=valid_token") as websocket:
            # Receive welcome message
            websocket.receive_text()
            
            # Send ping
            ping_message = {
                "type": "ping",
                "timestamp": "1234567890"
            }
            websocket.send_text(json.dumps(ping_message))
            
            # Should receive pong
            data = websocket.receive_text()
            message = json.loads(data)
            assert message["type"] == "pong"
            assert message["timestamp"] == "1234567890"


def test_websocket_tx_status_connection_success(mock_token_payload):
    """Test successful transaction status WebSocket connection"""
    with patch('app.websocket.routes.verify_token', return_value=mock_token_payload):
        with client.websocket_connect("/ws/tx-status?token=valid_token") as websocket:
            # Should receive welcome message
            data = websocket.receive_text()
            message = json.loads(data)
            assert message["type"] == "tx_status_connected"
            assert "Connected to transaction status updates" in message["message"]


def test_websocket_tx_status_subscribe(mock_token_payload):
    """Test transaction status subscription"""
    with patch('app.websocket.routes.verify_token', return_value=mock_token_payload):
        with client.websocket_connect("/ws/tx-status?token=valid_token") as websocket:
            # Receive welcome message
            websocket.receive_text()
            
            # Subscribe to transaction
            subscribe_message = {
                "type": "subscribe_tx",
                "txid": "test_transaction_id"
            }
            websocket.send_text(json.dumps(subscribe_message))
            
            # Should receive subscription confirmation
            data = websocket.receive_text()
            message = json.loads(data)
            assert message["type"] == "tx_subscribed"
            assert message["txid"] == "test_transaction_id"
            assert "Subscribed to updates" in message["message"]


def test_connection_manager_connect():
    """Test ConnectionManager connect method"""
    manager = ConnectionManager()
    
    # Mock WebSocket
    mock_websocket = MagicMock()
    user_id = "test-user"
    
    # Test connection
    import asyncio
    asyncio.run(manager.connect(mock_websocket, user_id))
    
    # Verify user is in active connections
    assert user_id in manager.active_connections
    assert mock_websocket in manager.active_connections[user_id]


def test_connection_manager_disconnect():
    """Test ConnectionManager disconnect method"""
    manager = ConnectionManager()
    
    # Mock WebSocket
    mock_websocket = MagicMock()
    user_id = "test-user"
    
    # Connect first
    import asyncio
    asyncio.run(manager.connect(mock_websocket, user_id))
    
    # Then disconnect
    manager.disconnect(mock_websocket, user_id)
    
    # Verify user is removed from active connections
    assert user_id not in manager.active_connections


def test_connection_manager_send_personal_message():
    """Test ConnectionManager send personal message"""
    manager = ConnectionManager()
    
    # Mock WebSocket
    mock_websocket = MagicMock()
    user_id = "test-user"
    
    # Connect
    import asyncio
    asyncio.run(manager.connect(mock_websocket, user_id))
    
    # Send message
    message = {"type": "test", "content": "hello"}
    asyncio.run(manager.send_personal_message(message, user_id))
    
    # Verify send_text was called
    mock_websocket.send_text.assert_called_once()


def test_connection_manager_send_personal_message_no_connection():
    """Test ConnectionManager send personal message to non-existent user"""
    manager = ConnectionManager()
    
    # Send message to non-existent user
    message = {"type": "test", "content": "hello"}
    import asyncio
    asyncio.run(manager.send_personal_message(message, "non-existent-user"))
    
    # Should not raise an error


def test_connection_manager_broadcast():
    """Test ConnectionManager broadcast message"""
    manager = ConnectionManager()
    
    # Mock WebSockets
    mock_websocket1 = MagicMock()
    mock_websocket2 = MagicMock()
    user_id1 = "user1"
    user_id2 = "user2"
    
    # Connect both users
    import asyncio
    asyncio.run(manager.connect(mock_websocket1, user_id1))
    asyncio.run(manager.connect(mock_websocket2, user_id2))
    
    # Broadcast message
    message = {"type": "broadcast", "content": "hello everyone"}
    asyncio.run(manager.broadcast(message))
    
    # Verify both WebSockets received the message
    mock_websocket1.send_text.assert_called_once()
    mock_websocket2.send_text.assert_called_once()


def test_connection_manager_cleanup_dead_connections():
    """Test ConnectionManager cleanup of dead connections"""
    manager = ConnectionManager()
    
    # Mock WebSocket that raises exception
    mock_websocket = MagicMock()
    mock_websocket.send_text.side_effect = Exception("Connection closed")
    user_id = "test-user"
    
    # Connect
    import asyncio
    asyncio.run(manager.connect(mock_websocket, user_id))
    
    # Send message (should trigger cleanup)
    message = {"type": "test", "content": "hello"}
    asyncio.run(manager.send_personal_message(message, user_id))
    
    # Verify user is removed from active connections
    assert user_id not in manager.active_connections


def test_websocket_invalid_json():
    """Test WebSocket with invalid JSON message"""
    with patch('app.websocket.routes.verify_token', return_value=mock_token_payload):
        with client.websocket_connect("/ws?token=valid_token") as websocket:
            # Receive welcome message
            websocket.receive_text()
            
            # Send invalid JSON
            websocket.send_text("invalid json")
            
            # Should handle gracefully (no crash)
            # The WebSocket will continue to work


def test_websocket_unknown_message_type(mock_token_payload):
    """Test WebSocket with unknown message type"""
    with patch('app.websocket.routes.verify_token', return_value=mock_token_payload):
        with client.websocket_connect("/ws?token=valid_token") as websocket:
            # Receive welcome message
            websocket.receive_text()
            
            # Send unknown message type
            unknown_message = {
                "type": "unknown_type",
                "data": "test"
            }
            websocket.send_text(json.dumps(unknown_message))
            
            # Should handle gracefully (no response expected)
            # The WebSocket will continue to work
