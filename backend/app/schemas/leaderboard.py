from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class LeaderboardEntry(BaseModel):
    user_id: str
    display_name: Optional[str]
    wallet_address: str
    xp: int
    badges: Optional[List[str]] = []
    rank: int


class LeaderboardResponse(BaseModel):
    entries: List[LeaderboardEntry]
    total: int
    updated_at: str
