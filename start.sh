#!/bin/bash

# FinGuard AI - Unified Start Script

echo "🤖 Starting AI Engine (FastAPI) on port 5000..."
cd /app/ai-engine
uvicorn main:app --host 0.0.0.0 --port 5000 &

# Give the engine a moment to spin up
sleep 3

echo "🛡️  Starting API Gateway & Frontend on port ${PORT:-4000}..."
cd /app/api-gateway
# AI_ENGINE_URL should be set to http://localhost:5000 for internal container communication
export AI_ENGINE_URL=http://localhost:5000
node dist/server.js
