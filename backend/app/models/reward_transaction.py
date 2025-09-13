from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class RewardTransaction(Base):
    __tablename__ = "reward_transactions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    quest_id = Column(String, ForeignKey("quests.id"), nullable=True)
    user_quest_id = Column(String, ForeignKey("user_quests.id"), nullable=True)
    txid = Column(String, nullable=True)
    status = Column(String, default="pending")  # 'pending', 'confirmed', 'failed'
    created_at = Column(DateTime, default=func.now())
    
    def __repr__(self):
        return f"<RewardTransaction(id={self.id}, user_id={self.user_id}, txid={self.txid}, status={self.status})>"
