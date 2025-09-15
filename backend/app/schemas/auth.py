from pydantic import BaseModel
from typing import Optional


class NonceRequest(BaseModel):
    address: str


class VerifyRequest(BaseModel):
    address: str
    signature: str
    nonce: str


class AuthResponse(BaseModel):
    token: str
    user: dict
    
    class Config:
        orm_mode = True
