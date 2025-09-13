from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey, Numeric
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid


class Quest(Base):
    __tablename__ = "quests"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    slug = Column(String, unique=True, nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    difficulty = Column(Integer, default=1)
    reward_json = Column(JSON, nullable=True)  # { xp: 50, badge: "liquidity-kata" }
    game_rules = Column(JSON, nullable=True)  # deterministic rules for server validation
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    user_quests = relationship("UserQuest", back_populates="quest")
    
    def __repr__(self):
        return f"<Quest(id={self.id}, slug={self.slug}, title={self.title})>"


class UserQuest(Base):
    __tablename__ = "user_quests"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    quest_id = Column(String, ForeignKey("quests.id"), nullable=False)
    state = Column(String, default="started")  # 'started', 'completed', 'failed'
    progress = Column(JSON, nullable=True)
    score = Column(Numeric, nullable=True)
    server_seed = Column(String, nullable=True)  # for deterministic simulation
    last_updated = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User")
    quest = relationship("Quest", back_populates="user_quests")
    
    def __repr__(self):
        return f"<UserQuest(id={self.id}, user_id={self.user_id}, quest_id={self.quest_id}, state={self.state})>"
