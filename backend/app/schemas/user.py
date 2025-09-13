from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserResponse(BaseModel):
    id: str
    wallet_address: str
    display_name: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
