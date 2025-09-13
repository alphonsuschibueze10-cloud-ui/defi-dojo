from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import generate_nonce, store_nonce, verify_nonce, verify_stacks_signature, create_access_token
from app.schemas.auth import NonceRequest, VerifyRequest, AuthResponse
from app.models.user import User
import uuid

router = APIRouter()


@router.post("/nonce")
async def get_nonce(request: NonceRequest):
    """Generate nonce for wallet authentication"""
    nonce = generate_nonce()
    store_nonce(request.address, nonce)
    return {"nonce": nonce}


@router.post("/verify", response_model=AuthResponse)
async def verify_signature(request: VerifyRequest, db: Session = Depends(get_db)):
    """Verify wallet signature and create user session"""
    
    # Verify nonce
    if not verify_nonce(request.address, request.nonce):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired nonce"
        )
    
    # Verify signature
    if not verify_stacks_signature(request.address, request.nonce, request.signature):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid signature"
        )
    
    # Get or create user
    user = db.query(User).filter(User.wallet_address == request.address).first()
    if not user:
        user = User(
            wallet_address=request.address,
            display_name=f"User_{request.address[:8]}"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Create JWT token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return AuthResponse(
        token=access_token,
        user={
            "id": str(user.id),
            "wallet_address": user.wallet_address,
            "display_name": user.display_name
        }
    )
