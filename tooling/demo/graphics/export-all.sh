#!/bin/bash

# Export all TortoiseOS graphics as PNG images
# Requires: playwright (run: bun add -D playwright && bunx playwright install)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXPORT_DIR="$SCRIPT_DIR/exports"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐢 TortoiseOS Graphics Exporter${NC}"
echo ""

# Create exports directory
mkdir -p "$EXPORT_DIR"

# Check if playwright is installed
if ! command -v bunx &> /dev/null; then
    echo "❌ Bun not found. Please install Bun first: https://bun.sh"
    exit 1
fi

echo "📦 Checking for Playwright..."
if ! bun pm ls | grep -q "playwright"; then
    echo "Installing Playwright..."
    bun add -D playwright
    bunx playwright install chromium
fi

echo ""
echo "🎨 Exporting graphics..."
echo ""

# Export each graphic with specific dimensions
export_graphic() {
    local file=$1
    local width=$2
    local height=$3
    local name=$(basename "$file" .html)

    echo -e "  📸 Exporting ${GREEN}${name}.png${NC} (${width}x${height})"

    bunx playwright screenshot "$file" "$EXPORT_DIR/${name}.png" \
        --viewport-size="${width},${height}" \
        --full-page \
        2>/dev/null
}

# Export all graphics with optimized dimensions
export_graphic "$SCRIPT_DIR/00-hero.html" 1200 1200
export_graphic "$SCRIPT_DIR/01-architecture.html" 1200 900
export_graphic "$SCRIPT_DIR/02-roadmap.html" 1400 1200
export_graphic "$SCRIPT_DIR/03-tech-stack.html" 1200 1000
export_graphic "$SCRIPT_DIR/04-features.html" 1300 1200
export_graphic "$SCRIPT_DIR/05-stats.html" 1200 1200

echo ""
echo -e "${GREEN}✅ All graphics exported successfully!${NC}"
echo ""
echo "📁 Files saved to: $EXPORT_DIR"
echo ""
ls -lh "$EXPORT_DIR"/*.png | awk '{print "   " $9 " (" $5 ")"}'
echo ""
echo "🐦 Ready to post on Twitter!"
echo ""
