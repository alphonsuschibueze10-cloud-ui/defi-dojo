#!/bin/bash

# Production startup script for Render deployment

# Set environment variables
export PYTHONPATH="${PYTHONPATH}:/opt/render/project/src/backend"

# Create database tables if they don't exist
python -c "
from app.core.database import engine, Base
from app.core.config import settings
print('Creating database tables...')
Base.metadata.create_all(bind=engine)
print('Database tables created successfully!')
"

# Start the application
echo "Starting DeFi Dojo API server..."
uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1
