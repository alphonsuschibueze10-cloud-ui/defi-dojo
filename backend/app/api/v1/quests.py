from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import secrets
import json
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.schemas.quest import QuestResponse, QuestStartRequest, QuestStartResponse, QuestActionRequest, QuestActionResponse, QuestStatusResponse
from app.models.user import User
from app.models.quest import Quest, UserQuest

router = APIRouter()


@router.get("/", response_model=List[QuestResponse])
async def list_quests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all active quests"""
    quests = db.query(Quest).filter(Quest.active == True).all()
    return quests


@router.get("/public", response_model=List[QuestResponse])
async def list_public_quests(db: Session = Depends(get_db)):
    """List all active quests for guest users"""
    quests = db.query(Quest).filter(Quest.active == True).all()
    return quests


@router.post("/{quest_id}/start", response_model=QuestStartResponse)
async def start_quest(
    quest_id: str,
    request: QuestStartRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start a quest instance for the current user"""
    
    # Check if quest exists and is active
    quest = db.query(Quest).filter(Quest.id == quest_id, Quest.active == True).first()
    if not quest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quest not found or inactive"
        )
    
    # Check if user already has an active quest instance
    existing_quest = db.query(UserQuest).filter(
        UserQuest.user_id == current_user.id,
        UserQuest.quest_id == quest_id,
        UserQuest.state.in_(["started", "ongoing"])
    ).first()
    
    if existing_quest:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quest already started"
        )
    
    # Generate server seed for deterministic simulation
    server_seed = secrets.token_hex(32)
    
    # Create user quest instance
    user_quest = UserQuest(
        user_id=current_user.id,
        quest_id=quest.id,
        state="started",
        server_seed=server_seed,
        progress={}
    )
    
    db.add(user_quest)
    db.commit()
    db.refresh(user_quest)
    
    return QuestStartResponse(
        user_quest_id=str(user_quest.id),
        state=user_quest.state,
        server_seed=server_seed
    )


@router.post("/{quest_id}/action", response_model=QuestActionResponse)
async def submit_action(
    quest_id: str,
    request: QuestActionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit an action for a quest"""
    
    # Get user quest instance
    user_quest = db.query(UserQuest).filter(
        UserQuest.id == request.user_quest_id,
        UserQuest.user_id == current_user.id,
        UserQuest.quest_id == quest_id
    ).first()
    
    if not user_quest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quest instance not found"
        )
    
    if user_quest.state not in ["started", "ongoing"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quest is not active"
        )
    
    # Get quest rules
    quest = user_quest.quest
    game_rules = quest.game_rules or {}
    
    # Validate action against game rules
    score, new_progress, new_state = validate_quest_action(
        action=request.action,
        payload=request.payload,
        game_rules=game_rules,
        current_progress=user_quest.progress or {},
        server_seed=user_quest.server_seed
    )
    
    # Update user quest
    user_quest.progress = new_progress
    user_quest.score = score
    user_quest.state = new_state
    
    db.commit()
    db.refresh(user_quest)
    
    return QuestActionResponse(
        progress=new_progress,
        score=score,
        state=new_state
    )


@router.get("/{user_quest_id}/status", response_model=QuestStatusResponse)
async def get_quest_status(
    user_quest_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get status of a user quest instance"""
    
    user_quest = db.query(UserQuest).filter(
        UserQuest.id == user_quest_id,
        UserQuest.user_id == current_user.id
    ).first()
    
    if not user_quest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quest instance not found"
        )
    
    return QuestStatusResponse(
        user_quest_id=str(user_quest.id),
        state=user_quest.state,
        progress=user_quest.progress,
        score=user_quest.score,
        last_updated=user_quest.last_updated
    )


def validate_quest_action(action: str, payload: dict, game_rules: dict, current_progress: dict, server_seed: str) -> tuple[float, dict, str]:
    """
    Validate quest action against game rules and return score, progress, and state
    This is a simplified implementation - in production, you'd have more sophisticated validation
    """
    
    # Default response
    score = 0.0
    new_progress = current_progress.copy()
    new_state = "ongoing"
    
    # Example validation for liquidity kata quest
    if action == "simulate_add_liquidity":
        # Validate required parameters
        if "pair" in payload and "amount" in payload:
            pair = payload["pair"]
            amount = payload["amount"]
            
            # Simple scoring based on amount and pair
            if pair == "STX/sBTC" and amount >= 1:
                score = 80.0
                new_progress["liquidity_added"] = True
                new_progress["pair"] = pair
                new_progress["amount"] = amount
                
                # Check if quest is complete
                if game_rules.get("type") == "liquidity-kata":
                    new_state = "completed"
                    score = 100.0
    
    elif action == "predict_price_move":
        # Validate price prediction
        if "prediction" in payload and "confidence" in payload:
            prediction = payload["prediction"]
            confidence = payload["confidence"]
            
            # Simple scoring based on confidence
            score = min(confidence * 20, 100.0)
            new_progress["price_predicted"] = True
            new_progress["prediction"] = prediction
            new_progress["confidence"] = confidence
    
    elif action == "submit_tx_proof":
        # For real on-chain actions, validate transaction
        if "txid" in payload:
            txid = payload["txid"]
            # In production, verify txid via Stacks API
            new_progress["tx_submitted"] = True
            new_progress["txid"] = txid
            score = 100.0
            new_state = "completed"
    
    return score, new_progress, new_state
