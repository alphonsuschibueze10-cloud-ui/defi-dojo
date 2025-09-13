from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from app.websocket.manager import manager
from app.core.security import verify_token
import json

router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...)
):
    """WebSocket endpoint for real-time updates"""
    
    # Verify JWT token
    payload = verify_token(token)
    if not payload:
        await websocket.close(code=1008, reason="Invalid token")
        return
    
    user_id = payload.get("sub")
    if not user_id:
        await websocket.close(code=1008, reason="Invalid token payload")
        return
    
    # Connect user
    await manager.connect(websocket, user_id)
    
    try:
        # Send welcome message
        await manager.send_personal_message({
            "type": "connected",
            "message": "Connected to DeFi Dojo real-time updates"
        }, user_id)
        
        # Keep connection alive and handle incoming messages
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            if message.get("type") == "ping":
                await manager.send_personal_message({
                    "type": "pong",
                    "timestamp": message.get("timestamp")
                }, user_id)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket, user_id)


@router.websocket("/ws/tx-status")
async def tx_status_websocket(
    websocket: WebSocket,
    token: str = Query(...)
):
    """WebSocket endpoint for transaction status updates"""
    
    # Verify JWT token
    payload = verify_token(token)
    if not payload:
        await websocket.close(code=1008, reason="Invalid token")
        return
    
    user_id = payload.get("sub")
    if not user_id:
        await websocket.close(code=1008, reason="Invalid token payload")
        return
    
    # Connect user
    await manager.connect(websocket, user_id)
    
    try:
        await manager.send_personal_message({
            "type": "tx_status_connected",
            "message": "Connected to transaction status updates"
        }, user_id)
        
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle transaction status requests
            if message.get("type") == "subscribe_tx":
                txid = message.get("txid")
                if txid:
                    # In a real implementation, you'd subscribe to tx updates
                    await manager.send_personal_message({
                        "type": "tx_subscribed",
                        "txid": txid,
                        "message": f"Subscribed to updates for transaction {txid}"
                    }, user_id)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
    except Exception as e:
        print(f"Transaction WebSocket error: {e}")
        manager.disconnect(websocket, user_id)
