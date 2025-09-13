from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class AIRun(Base):
    __tablename__ = "ai_runs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    quest_id = Column(String, ForeignKey("quests.id"), nullable=True)
    user_quest_id = Column(String, ForeignKey("user_quests.id"), nullable=True)
    prompt = Column(Text, nullable=False)
    response = Column(JSON, nullable=True)
    model = Column(String, default="gpt-4o-mini")
    status = Column(String, default="pending")  # 'pending', 'completed', 'failed'
    created_at = Column(DateTime, default=func.now())
    
    def __repr__(self):
        return f"<AIRun(id={self.id}, user_id={self.user_id}, status={self.status})>"
