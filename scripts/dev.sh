#!/bin/bash

# ==============================================
# Tournament Platform - Development Mode
# ==============================================

set -e

echo "🚀 Starting Tournament Platform in Development Mode..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Running setup first...${NC}"
    ./scripts/setup.sh
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down services...${NC}"
    kill 0
}

trap cleanup EXIT INT TERM

# Start backend
echo -e "${BLUE}🔧 Starting Backend API on port 3000...${NC}"
npm run start:dev &
BACKEND_PID=$!

# Wait a bit for backend to initialize
sleep 3

# Start frontend
echo -e "${BLUE}🎨 Starting Frontend on port 3001...${NC}"
cd frontend
npm run dev -- -p 3001 &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}✅ Development servers started!${NC}"
echo ""
echo -e "${BLUE}Access your application:${NC}"
echo "  Frontend: http://localhost:3001"
echo "  Backend API: http://localhost:3000/api/v1"
echo "  API Docs: http://localhost:3000/api"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Wait for all background processes
wait
