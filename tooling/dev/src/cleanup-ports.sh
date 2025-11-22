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

# Check new ports (3600-3699 range)
kill_port 3600 "Carapace API"
kill_port 3601 "Next.js Web"
kill_port 3602 "PostgreSQL"
kill_port 3603 "Redis"
kill_port 3604 "Grafana"
kill_port 3605 "Prometheus"
kill_port 3610 "Sui Localnet RPC"
kill_port 3611 "Sui Faucet"

echo ""
echo "Checking old ports (migration cleanup)..."
kill_port 3000 "Old Next.js Web"
kill_port 3001 "Old Reserve"
kill_port 3500 "Old API"
kill_port 3501 "Old API/Web"
kill_port 3502 "Old PostgreSQL"
kill_port 3503 "Old Redis"
kill_port 3504 "Old Grafana"
kill_port 3505 "Old Prometheus"
kill_port 9000 "Old Sui localnet"

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
lsof -i -P | grep -E ":(3600|3601|3602|3603|3604|3605|3610|3611)" | grep LISTEN || echo "All Carapace ports are free!"
echo ""
echo "✅ Cleanup complete!"
