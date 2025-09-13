from fastapi import APIRouter
from .auth import router as auth_router
from .quests import router as quests_router
from .ai import router as ai_router
from .rewards import router as rewards_router
from .leaderboard import router as leaderboard_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(quests_router, prefix="/quests", tags=["quests"])
api_router.include_router(ai_router, prefix="/ai", tags=["ai"])
api_router.include_router(rewards_router, prefix="/rewards", tags=["rewards"])
api_router.include_router(leaderboard_router, prefix="/leaderboard", tags=["leaderboard"])
