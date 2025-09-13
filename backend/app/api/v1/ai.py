from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.schemas.ai import AIHintRequest, AIHintResponse
from app.models.user import User
from app.models.quest import UserQuest
from app.models.ai_run import AIRun
from app.services.groq_client import groq_client
import uuid

router = APIRouter()


@router.post("/hint", response_model=AIHintResponse)
async def request_ai_hint(
    request: AIHintRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Request AI hint for a quest"""
    
    # Verify user quest exists
    user_quest = db.query(UserQuest).filter(
        UserQuest.id == request.user_quest_id,
        UserQuest.user_id == current_user.id
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
    
    # Create AI run record
    ai_run = AIRun(
        user_id=current_user.id,
        quest_id=user_quest.quest_id,
        user_quest_id=user_quest.id,
        prompt="",  # Will be filled by background task
        status="pending"
    )
    
    db.add(ai_run)
    db.commit()
    db.refresh(ai_run)
    
    # Queue background task to generate hint
    background_tasks.add_task(
        generate_ai_hint_task,
        str(ai_run.id),
        request.context
    )
    
    return AIHintResponse(
        ai_run_id=str(ai_run.id),
        status="queued"
    )


@router.get("/hint/{ai_run_id}", response_model=AIHintResponse)
async def get_ai_hint(
    ai_run_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI hint result"""
    
    ai_run = db.query(AIRun).filter(
        AIRun.id == ai_run_id,
        AIRun.user_id == current_user.id
    ).first()
    
    if not ai_run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI run not found"
        )
    
    if ai_run.status == "completed" and ai_run.response:
        return AIHintResponse(
            ai_run_id=str(ai_run.id),
            status=ai_run.status,
            hint=ai_run.response.get("hint"),
            risk=ai_run.response.get("risk"),
            param=ai_run.response.get("param")
        )
    elif ai_run.status == "failed":
        return AIHintResponse(
            ai_run_id=str(ai_run.id),
            status=ai_run.status,
            hint="I'm having trouble connecting right now. Please try again later."
        )
    else:
        return AIHintResponse(
            ai_run_id=str(ai_run.id),
            status=ai_run.status
        )


async def generate_ai_hint_task(ai_run_id: str, context: dict):
    """Background task to generate AI hint"""
    from app.core.database import SessionLocal
    
    db = SessionLocal()
    try:
        # Get AI run record
        ai_run = db.query(AIRun).filter(AIRun.id == ai_run_id).first()
        if not ai_run:
            return
        
        # Build prompt
        prompt = groq_client._build_hint_prompt(context)
        ai_run.prompt = prompt
        
        # Generate hint using Groq
        try:
            result = await groq_client.generate_hint(context)
            ai_run.response = result
            ai_run.status = "completed"
        except Exception as e:
            ai_run.response = {"error": str(e)}
            ai_run.status = "failed"
        
        db.commit()
        
    except Exception as e:
        print(f"Error in generate_ai_hint_task: {e}")
        if ai_run:
            ai_run.status = "failed"
            ai_run.response = {"error": str(e)}
            db.commit()
    finally:
        db.close()
