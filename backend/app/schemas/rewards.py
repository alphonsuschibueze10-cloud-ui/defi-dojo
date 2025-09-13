from pydantic import BaseModel
from typing import Optional, Dict, Any


class RewardPrepareRequest(BaseModel):
    user_quest_id: str


class RewardPrepareResponse(BaseModel):
    mint_payload_id: str
    unsigned_tx: Dict[str, Any]
    instructions: str


class RewardExecuteRequest(BaseModel):
    signed_tx: Optional[str] = None
    txid: Optional[str] = None
    mint_payload_id: str


class RewardExecuteResponse(BaseModel):
    status: str
    txid: Optional[str] = None


class RewardStatusResponse(BaseModel):
    txid: str
    status: str
    confirmed: bool
