from sqlalchemy import Column, String, DateTime, BigInteger, ForeignKey
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class Leaderboard(Base):
    __tablename__ = "leaderboard"
    
    user_id = Column(String, ForeignKey("users.id"), primary_key=True)
    xp = Column(BigInteger, default=0)
    badges = Column(JSON, nullable=True)  # List of badge names
    updated_at = Column(DateTime, default=func.now())
    
    def __repr__(self):
        return f"<Leaderboard(user_id={self.user_id}, xp={self.xp})>"
