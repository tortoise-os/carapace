#!/usr/bin/env bash
set -euo pipefail

# Organize Carapace Documentation Script
# Standardizes documentation structure to match TortoiseOS conventions

COLOR_RESET='\033[0m'
COLOR_GREEN='\033[0;32m'
COLOR_BLUE='\033[0;34m'
COLOR_YELLOW='\033[1;33m'

print_header() {
    echo -e "${COLOR_BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLOR_RESET}"
    echo -e "${COLOR_BLUE}  $1${COLOR_RESET}"
    echo -e "${COLOR_BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLOR_RESET}"
}

print_success() {
    echo -e "${COLOR_GREEN}✓${COLOR_RESET} $1"
}

print_info() {
    echo -e "${COLOR_BLUE}ℹ${COLOR_RESET} $1"
}

print_move() {
    echo -e "${COLOR_YELLOW}→${COLOR_RESET} $1"
}

DOCS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../docs" && pwd)"

print_header "Standardizing Carapace Documentation Structure"
echo ""
print_info "Converting from old structure to standardized TortoiseOS structure"
echo ""

# Create standardized structure
mkdir -p "${DOCS_DIR}"/{current,archive,guides,architecture,operations,roadmaps}

print_info "Documentation directory: ${DOCS_DIR}"
echo ""

# ARCHITECTURE - Research becomes architecture (competitive analysis & system research)
print_header "Moving ARCHITECTURE documentation"
if [ -d "${DOCS_DIR}/research" ]; then
    for file in "${DOCS_DIR}"/research/*.md; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            mv "$file" "${DOCS_DIR}/architecture/"
            print_move "research/${filename} → architecture/${filename}"
        fi
    done
    rmdir "${DOCS_DIR}/research" 2>/dev/null || true
fi
echo ""

# ROADMAPS - Planning becomes roadmaps
print_header "Moving ROADMAPS (planning) documentation"
if [ -d "${DOCS_DIR}/planning" ]; then
    for file in "${DOCS_DIR}"/planning/*.md; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            mv "$file" "${DOCS_DIR}/roadmaps/"
            print_move "planning/${filename} → roadmaps/${filename}"
        fi
    done
    rmdir "${DOCS_DIR}/planning" 2>/dev/null || true
fi
echo ""

# GUIDES - Already correct, no changes needed
print_header "GUIDES documentation"
print_info "guides/ already matches standard structure - no changes needed"
echo ""

# OPERATIONS - Security becomes operations
print_header "Moving OPERATIONS (security) documentation"
if [ -d "${DOCS_DIR}/security" ]; then
    for file in "${DOCS_DIR}"/security/*.md; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            mv "$file" "${DOCS_DIR}/operations/"
            print_move "security/${filename} → operations/${filename}"
        fi
    done
    rmdir "${DOCS_DIR}/security" 2>/dev/null || true
fi
echo ""

# ARCHIVE - Add timestamps to status/ and archive/ contents
print_header "Moving ARCHIVE (status + old archive) documentation"
TODAY=$(date +%Y-%m-%d)

# Move status/ to archive/ with timestamps (these are historical snapshots)
if [ -d "${DOCS_DIR}/status" ]; then
    for file in "${DOCS_DIR}"/status/*.md; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            mv "$file" "${DOCS_DIR}/archive/${TODAY}_${filename}"
            print_move "status/${filename} → archive/${TODAY}_${filename}"
        fi
    done
    rmdir "${DOCS_DIR}/status" 2>/dev/null || true
fi

# Add timestamps to existing archive/ files
for file in "${DOCS_DIR}"/archive/*.md; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        # Only add timestamp if not already timestamped
        if [[ ! "$filename" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}_ ]]; then
            mv "$file" "${DOCS_DIR}/archive/${TODAY}_${filename}"
            print_move "archive/${filename} → archive/${TODAY}_${filename}"
        fi
    fi
done
echo ""

# CURRENT - Move key docs from root
print_header "Moving CURRENT documentation"
# DOCUMENTATION_ORGANIZATION.md stays as a current doc
if [ -f "${DOCS_DIR}/DOCUMENTATION_ORGANIZATION.md" ]; then
    mv "${DOCS_DIR}/DOCUMENTATION_ORGANIZATION.md" "${DOCS_DIR}/current/"
    print_move "DOCUMENTATION_ORGANIZATION.md → current/"
fi
echo ""

# Create .gitkeep if directories are empty
print_header "Creating placeholders for empty directories"
for dir in current architecture operations roadmaps; do
    if [ -z "$(ls -A "${DOCS_DIR}/${dir}" 2>/dev/null)" ]; then
        touch "${DOCS_DIR}/${dir}/.gitkeep"
        print_success "Created ${dir}/.gitkeep"
    fi
done
echo ""

# Summary
print_header "Documentation organization complete!"
echo ""
echo "Standardized structure:"
echo "  ${DOCS_DIR}/"
echo "  ├── INDEX.md              (stays in root)"
echo "  ├── README.md             (stays in root)"
echo "  ├── current/              $(ls "${DOCS_DIR}"/current/*.md 2>/dev/null | wc -l | tr -d ' ') files"
echo "  ├── guides/               $(ls "${DOCS_DIR}"/guides/*.md 2>/dev/null | wc -l | tr -d ' ') files"
echo "  ├── architecture/         $(ls "${DOCS_DIR}"/architecture/*.md 2>/dev/null | wc -l | tr -d ' ') files"
echo "  ├── operations/           $(ls "${DOCS_DIR}"/operations/*.md 2>/dev/null | wc -l | tr -d ' ') files"
echo "  ├── archive/              $(ls "${DOCS_DIR}"/archive/*.md 2>/dev/null | wc -l | tr -d ' ') files"
echo "  └── roadmaps/             $(ls "${DOCS_DIR}"/roadmaps/*.md 2>/dev/null | wc -l | tr -d ' ') files"
echo ""

print_success "Carapace documentation now matches TortoiseOS standard structure!"
echo ""
