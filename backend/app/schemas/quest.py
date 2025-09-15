from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class QuestResponse(BaseModel):
    id: str
    slug: str
    title: str
    description: Optional[str]
    difficulty: int
    reward_json: Optional[Dict[str, Any]]
    active: bool
    
    class Config:
        orm_mode = True


class QuestStartRequest(BaseModel):
    pass  # No additional data needed


class QuestStartResponse(BaseModel):
    user_quest_id: str
    state: str
    server_seed: str


class QuestActionRequest(BaseModel):
    user_quest_id: str
    action: str
    payload: Dict[str, Any]
    signature: Optional[str] = None


class QuestActionResponse(BaseModel):
    progress: Dict[str, Any]
    score: Optional[float]
    state: str


class QuestStatusResponse(BaseModel):
    user_quest_id: str
    state: str
    progress: Optional[Dict[str, Any]]
    score: Optional[float]
    last_updated: datetime
    
    class Config:
        orm_mode = True
