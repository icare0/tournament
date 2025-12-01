#!/bin/bash

# ==============================================
# Tournament Platform - Test Runner
# ==============================================

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Running tests...${NC}"
echo ""

# Run backend tests
echo -e "${BLUE}Backend Tests:${NC}"
npm run test

echo ""
echo -e "${BLUE}Backend Test Coverage:${NC}"
npm run test:cov

echo ""
echo -e "${GREEN}✅ All tests completed${NC}"
