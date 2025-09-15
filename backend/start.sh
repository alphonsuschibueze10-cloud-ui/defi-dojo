#!/bin/bash

# Production startup script for Render deployment

# Set environment variables
export PYTHONPATH="${PYTHONPATH}:/opt/render/project/src/backend"

# Start the application
echo "Starting DeFi Dojo API server..."
uvicorn app.simple_main:app --host 0.0.0.0 --port $PORT --workers 1
