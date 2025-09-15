"""
Simple FastAPI app for deployment compatibility
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os

# Create FastAPI app
app = FastAPI(
    title="DeFi Dojo API",
    description="AI-powered DeFi gaming platform on Stacks",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to DeFi Dojo API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy", 
        "environment": os.getenv("ENVIRONMENT", "development")
    }

@app.get("/api/v1/quests/public")
async def get_public_quests():
    """Get public quests"""
    return [
        {
            "id": "liquidity-kata",
            "slug": "liquidity-kata",
            "title": "Liquidity Kata",
            "description": "Master the art of providing liquidity to DeFi pools",
            "difficulty": 1,
            "reward_json": {"xp": 100},
            "active": True
        },
        {
            "id": "yield-sprint",
            "slug": "yield-sprint", 
            "title": "Yield Sprint",
            "description": "Optimize your yield farming strategies",
            "difficulty": 2,
            "reward_json": {"xp": 200},
            "active": True
        }
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
