from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    wallet_address = Column(String, unique=True, nullable=False, index=True)
    display_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=func.now())
    
    def __repr__(self):
        return f"<User(id={self.id}, wallet_address={self.wallet_address})>"
