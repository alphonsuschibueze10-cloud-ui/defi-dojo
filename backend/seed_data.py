"""
Seed script to populate the database with initial quest data
"""
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.core.database import Base
from app.models.quest import Quest
import json

# Create tables
Base.metadata.create_all(bind=engine)

def seed_quests():
    """Seed initial quest data"""
    db = SessionLocal()
    
    try:
        # Check if quests already exist
        if db.query(Quest).first():
            print("Quests already seeded")
            return
        
        # Define initial quests
        quests_data = [
            {
                "slug": "liquidity-kata",
                "title": "Liquidity Kata",
                "description": "Master the art of providing liquidity to DeFi pools. Learn to add liquidity to STX/sBTC pairs and understand impermanent loss.",
                "difficulty": 1,
                "reward_json": {
                    "xp": 50,
                    "badge": "liquidity-kata",
                    "badge_id": 1
                },
                "game_rules": {
                    "type": "liquidity-kata",
                    "steps": [
                        {
                            "action": "simulate_add_liquidity",
                            "params": {"pair": "STX/sBTC", "min_amount": 1}
                        },
                        {
                            "action": "predict_price_move",
                            "params": {"window_minutes": 15}
                        }
                    ],
                    "scoring": {"correctness": 0.6, "efficiency": 0.4},
                    "max_score": 100
                },
                "active": True
            },
            {
                "slug": "yield-sprint",
                "title": "Yield Sprint",
                "description": "Race to maximize your yield farming returns. Learn to identify high-yield opportunities and manage risk.",
                "difficulty": 2,
                "reward_json": {
                    "xp": 75,
                    "badge": "yield-sprint",
                    "badge_id": 2
                },
                "game_rules": {
                    "type": "yield-sprint",
                    "steps": [
                        {
                            "action": "analyze_yield_opportunities",
                            "params": {"min_apy": 5}
                        },
                        {
                            "action": "calculate_risk_reward",
                            "params": {"max_risk": 0.3}
                        }
                    ],
                    "scoring": {"apy_achieved": 0.4, "risk_management": 0.6},
                    "max_score": 100
                },
                "active": True
            },
            {
                "slug": "arbitrage-master",
                "title": "Arbitrage Master",
                "description": "Become a master of price differences across exchanges. Learn to spot and execute profitable arbitrage opportunities.",
                "difficulty": 3,
                "reward_json": {
                    "xp": 100,
                    "badge": "arbitrage-master",
                    "badge_id": 3
                },
                "game_rules": {
                    "type": "arbitrage-master",
                    "steps": [
                        {
                            "action": "identify_price_differences",
                            "params": {"min_spread": 0.01}
                        },
                        {
                            "action": "execute_arbitrage",
                            "params": {"max_slippage": 0.005}
                        }
                    ],
                    "scoring": {"profit_margin": 0.7, "execution_speed": 0.3},
                    "max_score": 100
                },
                "active": True
            },
            {
                "slug": "defi-ninja",
                "title": "DeFi Ninja",
                "description": "Master advanced DeFi strategies including flash loans, complex swaps, and protocol interactions.",
                "difficulty": 4,
                "reward_json": {
                    "xp": 150,
                    "badge": "defi-ninja",
                    "badge_id": 4
                },
                "game_rules": {
                    "type": "defi-ninja",
                    "steps": [
                        {
                            "action": "flash_loan_strategy",
                            "params": {"max_gas": 500000}
                        },
                        {
                            "action": "multi_hop_swap",
                            "params": {"max_hops": 3}
                        }
                    ],
                    "scoring": {"gas_efficiency": 0.3, "profit_optimization": 0.7},
                    "max_score": 100
                },
                "active": True
            }
        ]
        
        # Create quest objects
        for quest_data in quests_data:
            quest = Quest(**quest_data)
            db.add(quest)
        
        db.commit()
        print(f"Seeded {len(quests_data)} quests")
        
    except Exception as e:
        print(f"Error seeding quests: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_quests()
