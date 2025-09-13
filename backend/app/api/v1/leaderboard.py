from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.schemas.leaderboard import LeaderboardResponse, LeaderboardEntry
from app.models.user import User
from app.models.quest import UserQuest
from app.models.leaderboard import Leaderboard as LeaderboardModel

router = APIRouter()


@router.get("/", response_model=LeaderboardResponse)
async def get_leaderboard(
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get leaderboard of top players"""
    
    # Calculate XP for each user from completed quests
    user_xp_query = db.query(
        UserQuest.user_id,
        func.sum(UserQuest.score).label('total_xp'),
        func.count(UserQuest.id).label('quest_count')
    ).filter(
        UserQuest.state == "completed"
    ).group_by(UserQuest.user_id).subquery()
    
    # Get leaderboard entries with user info
    leaderboard_entries = db.query(
        User.id,
        User.wallet_address,
        User.display_name,
        user_xp_query.c.total_xp,
        user_xp_query.c.quest_count
    ).join(
        user_xp_query, User.id == user_xp_query.c.user_id
    ).order_by(
        desc(user_xp_query.c.total_xp)
    ).limit(limit).all()
    
    # Convert to response format
    entries = []
    for rank, (user_id, wallet_address, display_name, total_xp, quest_count) in enumerate(leaderboard_entries, 1):
        # Get badges from completed quests
        badges = db.query(UserQuest.quest_id).filter(
            UserQuest.user_id == user_id,
            UserQuest.state == "completed"
        ).all()
        
        badge_names = [f"quest_{quest_id}" for quest_id, in badges]
        
        entries.append(LeaderboardEntry(
            user_id=str(user_id),
            display_name=display_name,
            wallet_address=wallet_address,
            xp=int(total_xp or 0),
            badges=badge_names,
            rank=rank
        ))
    
    return LeaderboardResponse(
        entries=entries,
        total=len(entries),
        updated_at=datetime.now().isoformat()
    )


@router.get("/user/{user_id}")
async def get_user_rank(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Get specific user's rank and stats"""
    
    # Calculate user's total XP
    user_xp = db.query(func.sum(UserQuest.score)).filter(
        UserQuest.user_id == user_id,
        UserQuest.state == "completed"
    ).scalar() or 0
    
    # Count users with higher XP
    higher_xp_count = db.query(func.count(User.id)).join(
        UserQuest, User.id == UserQuest.user_id
    ).filter(
        UserQuest.state == "completed"
    ).group_by(User.id).having(
        func.sum(UserQuest.score) > user_xp
    ).count()
    
    rank = higher_xp_count + 1
    
    # Get user info
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"error": "User not found"}
    
    # Get completed quests
    completed_quests = db.query(UserQuest).filter(
        UserQuest.user_id == user_id,
        UserQuest.state == "completed"
    ).all()
    
    badges = [f"quest_{uq.quest_id}" for uq in completed_quests]
    
    return {
        "user_id": str(user_id),
        "display_name": user.display_name,
        "wallet_address": user.wallet_address,
        "xp": int(user_xp),
        "rank": rank,
        "badges": badges,
        "completed_quests": len(completed_quests)
    }
