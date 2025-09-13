import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

# For password hashing (if needed later)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Store nonces temporarily (in production, use Redis)
nonce_store = {}


def generate_nonce() -> str:
    """Generate a random nonce for wallet authentication"""
    return secrets.token_hex(32)


def store_nonce(address: str, nonce: str) -> None:
    """Store nonce for address with expiration"""
    nonce_store[address] = {
        "nonce": nonce,
        "expires": datetime.utcnow() + timedelta(minutes=5)
    }


def verify_nonce(address: str, nonce: str) -> bool:
    """Verify nonce for address"""
    if address not in nonce_store:
        return False
    
    stored_data = nonce_store[address]
    if datetime.utcnow() > stored_data["expires"]:
        del nonce_store[address]
        return False
    
    return stored_data["nonce"] == nonce


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.jwt_expire_minutes)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    return encoded_jwt


def verify_token(token: str) -> Optional[dict]:
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        return payload
    except JWTError:
        return None


def verify_stacks_signature(address: str, message: str, signature: str) -> bool:
    """
    Verify Stacks wallet signature
    Note: This is a simplified implementation. In production, you'd want to use
    proper Stacks signature verification libraries or call a microservice.
    """
    # For now, we'll do basic validation
    # In production, implement proper signature verification
    if not address or not message or not signature:
        return False
    
    # Basic format validation
    if not address.startswith("SP") and not address.startswith("ST"):
        return False
    
    # For demo purposes, accept any signature that's not empty
    # TODO: Implement proper signature verification
    return len(signature) > 0
