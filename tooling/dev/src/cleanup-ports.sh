#!/bin/bash
set -e

echo "🧹 Carapace Port Cleanup Script"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to kill process on port
kill_port() {
    local port=$1
    local name=$2

    pid=$(lsof -ti :$port 2>/dev/null || echo "")

    if [ -n "$pid" ]; then
        echo -e "${YELLOW}Found $name on port $port (PID: $pid)${NC}"
        read -p "Kill this process? (y/n): " confirm
        if [ "$confirm" = "y" ]; then
            kill $pid 2>/dev/null || kill -9 $pid
            echo -e "${GREEN}✓ Killed process on port $port${NC}"
        else
            echo -e "${YELLOW}⊘ Skipped port $port${NC}"
        fi
    else
        echo -e "${GREEN}✓ Port $port is free${NC}"
    fi
}

echo "Checking application ports..."
echo ""

# Check each port
kill_port 3000 "Next.js Web"
kill_port 3001 "Reserve (unused)"
kill_port 3500 "Carapace API (future)"
kill_port 3501 "Carapace API (current)"

echo ""
echo "Checking Sui port..."
kill_port 9000 "Sui localnet"

echo ""
echo "Checking Docker infrastructure ports..."
kill_port 3502 "PostgreSQL"
kill_port 3503 "Redis"
kill_port 3504 "Grafana"
kill_port 3505 "Prometheus"

echo ""
echo "================================"
echo ""

# Check Docker containers
echo "Checking Docker containers..."
if command -v docker &> /dev/null; then
    CONTAINERS=$(docker ps -a --filter "name=bun-eth-" --format "{{.Names}}" 2>/dev/null || echo "")

    if [ -n "$CONTAINERS" ]; then
        echo -e "${YELLOW}Found old Docker containers from different project:${NC}"
        echo "$CONTAINERS"
        echo ""
        read -p "Remove these containers? (y/n): " confirm
        if [ "$confirm" = "y" ]; then
            docker rm -f $CONTAINERS
            echo -e "${GREEN}✓ Removed old containers${NC}"
        else
            echo -e "${YELLOW}⊘ Kept old containers${NC}"
        fi
    else
        echo -e "${GREEN}✓ No conflicting Docker containers${NC}"
    fi
else
    echo -e "${YELLOW}⊘ Docker not found, skipping container check${NC}"
fi

echo ""
echo "================================"
echo ""
echo "Current port status:"
lsof -i -P | grep -E ":(3000|3001|3500|3501|3502|3503|3504|3505|9000)" | grep LISTEN || echo "All application ports are free!"
echo ""
echo "✅ Cleanup complete!"
