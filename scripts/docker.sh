#!/bin/bash

# ==============================================
# Tournament Platform - Docker Management
# ==============================================

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to display usage
usage() {
    echo "Usage: $0 {up|down|restart|logs|clean}"
    echo ""
    echo "Commands:"
    echo "  up        - Start all containers"
    echo "  down      - Stop all containers"
    echo "  restart   - Restart all containers"
    echo "  logs      - Show logs from all containers"
    echo "  clean     - Remove all containers, volumes, and images"
    exit 1
}

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed.${NC}"
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ docker-compose is not installed.${NC}"
    exit 1
fi

# Main script
case "$1" in
    up)
        echo -e "${BLUE}🐳 Starting Docker containers...${NC}"
        docker-compose up -d
        echo ""
        echo -e "${GREEN}✅ Containers started!${NC}"
        echo ""
        echo -e "${BLUE}Access your application:${NC}"
        echo "  Frontend: http://localhost:3001"
        echo "  Backend API: http://localhost:3000/api/v1"
        echo "  API Docs: http://localhost:3000/api"
        echo "  PostgreSQL: localhost:5432"
        echo "  Redis: localhost:6379"
        echo ""
        echo "View logs with: $0 logs"
        ;;

    down)
        echo -e "${YELLOW}🛑 Stopping Docker containers...${NC}"
        docker-compose down
        echo -e "${GREEN}✅ Containers stopped${NC}"
        ;;

    restart)
        echo -e "${YELLOW}🔄 Restarting Docker containers...${NC}"
        docker-compose restart
        echo -e "${GREEN}✅ Containers restarted${NC}"
        ;;

    logs)
        echo -e "${BLUE}📋 Showing container logs...${NC}"
        docker-compose logs -f
        ;;

    clean)
        echo -e "${RED}🧹 Cleaning up Docker resources...${NC}"
        read -p "This will remove ALL containers, volumes, and images. Continue? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker-compose down -v --rmi all
            echo -e "${GREEN}✅ Cleanup completed${NC}"
        else
            echo -e "${YELLOW}Cleanup cancelled${NC}"
        fi
        ;;

    *)
        usage
        ;;
esac
