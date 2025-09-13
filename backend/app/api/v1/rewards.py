from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.schemas.rewards import RewardPrepareRequest, RewardPrepareResponse, RewardExecuteRequest, RewardExecuteResponse, RewardStatusResponse
from app.models.user import User
from app.models.quest import UserQuest, Quest
from app.models.reward_transaction import RewardTransaction
import uuid
import httpx
from app.core.config import settings

router = APIRouter()


@router.post("/prepare", response_model=RewardPrepareResponse)
async def prepare_reward(
    request: RewardPrepareRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Prepare reward minting payload for completed quest"""
    
    # Get user quest instance
    user_quest = db.query(UserQuest).filter(
        UserQuest.id == request.user_quest_id,
        UserQuest.user_id == current_user.id,
        UserQuest.state == "completed"
    ).first()
    
    if not user_quest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Completed quest not found"
        )
    
    # Check if reward already prepared
    existing_reward = db.query(RewardTransaction).filter(
        RewardTransaction.user_quest_id == user_quest.id,
        RewardTransaction.status.in_(["pending", "confirmed"])
    ).first()
    
    if existing_reward:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reward already prepared for this quest"
        )
    
    # Get quest reward info
    quest = user_quest.quest
    reward_json = quest.reward_json or {}
    
    # Generate mint payload
    mint_payload_id = str(uuid.uuid4())
    
    # Create unsigned transaction payload
    unsigned_tx = {
        "contract": "SP000000000000000000002Q6VF78.dojo-badge",  # Example contract
        "function": "mint-badge",
        "args": [
            f"0x{current_user.wallet_address}",
            reward_json.get("badge_id", 1)
        ],
        "fee": 1000,
        "nonce": 0  # Will be set by wallet
    }
    
    # Create reward transaction record
    reward_tx = RewardTransaction(
        user_id=current_user.id,
        quest_id=quest.id,
        user_quest_id=user_quest.id,
        status="pending"
    )
    
    db.add(reward_tx)
    db.commit()
    db.refresh(reward_tx)
    
    return RewardPrepareResponse(
        mint_payload_id=mint_payload_id,
        unsigned_tx=unsigned_tx,
        instructions=f"Sign this transaction to mint your {reward_json.get('badge', 'quest')} badge and earn {reward_json.get('xp', 0)} XP!"
    )


@router.post("/execute", response_model=RewardExecuteResponse)
async def execute_reward(
    request: RewardExecuteRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Execute reward minting with signed transaction or txid"""
    
    # Get reward transaction
    reward_tx = db.query(RewardTransaction).filter(
        RewardTransaction.user_id == current_user.id,
        RewardTransaction.status == "pending"
    ).first()
    
    if not reward_tx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No pending reward transaction found"
        )
    
    if request.signed_tx:
        # If signed transaction provided, we'd broadcast it here
        # For now, we'll simulate success
        reward_tx.status = "confirmed"
        reward_tx.txid = f"simulated_tx_{uuid.uuid4().hex[:16]}"
        
    elif request.txid:
        # Verify transaction via Stacks API
        reward_tx.txid = request.txid
        reward_tx.status = "pending"  # Will be verified by background task
        
        # Queue background task to verify transaction
        background_tasks.add_task(
            verify_transaction_task,
            str(reward_tx.id),
            request.txid
        )
    
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either signed_tx or txid must be provided"
        )
    
    db.commit()
    
    return RewardExecuteResponse(
        status=reward_tx.status,
        txid=reward_tx.txid
    )


@router.get("/status", response_model=RewardStatusResponse)
async def get_reward_status(
    txid: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check reward transaction status"""
    
    reward_tx = db.query(RewardTransaction).filter(
        RewardTransaction.txid == txid,
        RewardTransaction.user_id == current_user.id
    ).first()
    
    if not reward_tx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # Check transaction status via Stacks API
    confirmed = await verify_transaction_status(txid)
    
    if confirmed and reward_tx.status == "pending":
        reward_tx.status = "confirmed"
        db.commit()
    
    return RewardStatusResponse(
        txid=txid,
        status=reward_tx.status,
        confirmed=confirmed
    )


async def verify_transaction_task(reward_tx_id: str, txid: str):
    """Background task to verify transaction"""
    from app.core.database import SessionLocal
    
    db = SessionLocal()
    try:
        reward_tx = db.query(RewardTransaction).filter(RewardTransaction.id == reward_tx_id).first()
        if not reward_tx:
            return
        
        # Verify transaction
        confirmed = await verify_transaction_status(txid)
        
        if confirmed:
            reward_tx.status = "confirmed"
        else:
            reward_tx.status = "failed"
        
        db.commit()
        
    except Exception as e:
        print(f"Error in verify_transaction_task: {e}")
        if reward_tx:
            reward_tx.status = "failed"
            db.commit()
    finally:
        db.close()


async def verify_transaction_status(txid: str) -> bool:
    """Verify transaction status via Stacks API"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.stacks_api_url}/v2/transactions/{txid}",
                timeout=10.0
            )
            
            if response.status_code == 200:
                tx_data = response.json()
                return tx_data.get("tx_status") == "success"
            
    except Exception as e:
        print(f"Error verifying transaction {txid}: {e}")
    
    return False
