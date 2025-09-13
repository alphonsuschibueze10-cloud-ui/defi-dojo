from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./defidojo.db"
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    
    # API Keys
    groq_api_key: str
    hiro_api_key: Optional[str] = None
    
    # Stacks
    stacks_api_url: str = "https://stacks-node-api.testnet.stacks.co"
    
    # JWT
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 30
    
    # Environment
    environment: str = "development"
    debug: bool = True
    
    # CORS
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    class Config:
        env_file = ".env"


settings = Settings()
