from pydantic import BaseModel
from typing import Optional, Dict, Any


class AIHintRequest(BaseModel):
    user_id: str
    user_quest_id: str
    context: Dict[str, Any]


class AIHintResponse(BaseModel):
    ai_run_id: str
    status: str
    hint: Optional[str] = None
    risk: Optional[str] = None
    param: Optional[str] = None
