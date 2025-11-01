# TortoiseOS Carapace Documentation Index

**Last Updated**: 2025-11-01
**Repository**: carapace
**Purpose**: AMM/DEX protocol on Sui blockchain with flash loan capabilities

---

## 📖 Documentation Structure

This repository uses TortoiseOS standardized documentation approach with:
- **Timestamps** for versioning
- **Clear deprecation** markers
- **Organized by type** (architecture, guides, operations, roadmaps)
- **Package-specific docs** in package directories

---

## 📂 Directory Organization

### Root Documentation (`/docs`)
```
docs/
├── INDEX.md          # This file - documentation index
├── README.md         # Documentation overview
├── current/          # Active, current documentation
├── archive/          # Historical/deprecated docs (timestamped)
├── guides/           # How-to guides and tutorials
├── architecture/     # Architecture and competitive analysis
├── operations/       # Operational guides (audit, security, deployment)
└── roadmaps/         # Product roadmaps and planning
```

---

## 📚 Current Documentation

### Getting Started
| Document | Location | Description | Status |
|----------|----------|-------------|--------|
| [GETTING_STARTED.md](./guides/GETTING_STARTED.md) | guides/ | Getting started guide | ⚠️ NEEDS REVIEW |
| [QUICKSTART.md](./guides/QUICKSTART.md) | guides/ | Quick start guide | ⚠️ NEEDS REVIEW |
| [CLEAN_BUILD.md](./guides/CLEAN_BUILD.md) | guides/ | Clean build instructions | ✅ CURRENT |

### Architecture
| Document | Location | Description | Status |
|----------|----------|-------------|--------|
| [PERCOLATOR_RESEARCH.md](./architecture/PERCOLATOR_RESEARCH.md) | architecture/ | Percolator perpetual futures research | ✅ CURRENT |
| [SUI_DEFI_REFERENCES.md](./architecture/SUI_DEFI_REFERENCES.md) | architecture/ | Sui DeFi protocol references | ✅ CURRENT |
| [SUI_DEFI_COMPETITIVE_LANDSCAPE.md](./architecture/SUI_DEFI_COMPETITIVE_LANDSCAPE.md) | architecture/ | Competitive analysis of Sui DeFi ecosystem | ✅ CURRENT |

### Roadmaps & Planning
| Document | Location | Description | Status |
|----------|----------|-------------|--------|
| [TODO_PERCOLATOR.md](./roadmaps/TODO_PERCOLATOR.md) | roadmaps/ | Percolator implementation TODOs | ⚠️ NEEDS REVIEW |
| [TODO_THIS_WEEK.md](./roadmaps/TODO_THIS_WEEK.md) | roadmaps/ | Weekly task tracking | ⚠️ NEEDS REVIEW |
| [IMPLEMENTATION_CHECKLIST.md](./roadmaps/IMPLEMENTATION_CHECKLIST.md) | roadmaps/ | Implementation tracking | ⚠️ NEEDS REVIEW |
| [P0_IMPLEMENTATION_PLAN.md](./roadmaps/P0_IMPLEMENTATION_PLAN.md) | roadmaps/ | Priority 0 implementation plan | ✅ CURRENT |

### Deployment & Operations
| Document | Location | Description | Status |
|----------|----------|-------------|--------|
| [TESTNET_DEPLOYMENT.md](./guides/TESTNET_DEPLOYMENT.md) | guides/ | Testnet deployment guide | ✅ CURRENT |
| [TROUBLESHOOTING.md](./guides/TROUBLESHOOTING.md) | guides/ | Common issues and solutions | ✅ CURRENT |
| [SECURITY_AUDIT_GUIDE.md](./operations/SECURITY_AUDIT_GUIDE.md) | operations/ | Security audit preparation | ✅ CURRENT |
| [AUDIT_PREPARATION_CHECKLIST.md](./operations/AUDIT_PREPARATION_CHECKLIST.md) | operations/ | Audit preparation checklist | ✅ CURRENT |

---

## 🗄️ Archived Documentation

Historical documentation in `/docs/archive/` (timestamped):

| Date | Document | Reason |
|------|----------|--------|
| 2025-11-01 | [QUICK_START.md](./archive/2025-11-01_QUICK_START.md) | Duplicate of QUICKSTART.md |
| 2025-11-01 | [DEPLOYMENT.md](./archive/2025-11-01_DEPLOYMENT.md) | Superseded by TESTNET_DEPLOYMENT.md |
| 2025-11-01 | [IMPLEMENTATION_PLAN.md](./archive/2025-11-01_IMPLEMENTATION_PLAN.md) | Superseded by ROADMAP.md |
| 2025-11-01 | [PORT_MAPPING.md](./archive/2025-11-01_PORT_MAPPING.md) | One-time migration document |
| 2025-11-01 | [TWITTER_THREAD.md](./archive/2025-11-01_TWITTER_THREAD.md) | Marketing material |
| 2025-11-01 | [UI_IMPROVEMENTS.md](./archive/2025-11-01_UI_IMPROVEMENTS.md) | Outdated UI notes |
| 2025-11-01 | [BUILD_SUMMARY.md](./archive/2025-11-01_BUILD_SUMMARY.md) | Historical snapshot |
| 2025-11-01 | [SESSION_SUMMARY.md](./archive/2025-11-01_SESSION_SUMMARY.md) | Historical snapshot |
| 2025-11-01 | [PORT_MIGRATION_SUMMARY.md](./archive/2025-11-01_PORT_MIGRATION_SUMMARY.md) | Historical snapshot |

---

## 🏷️ Documentation Conventions

### Timestamps
All timestamped documentation uses format: `YYYY-MM-DD_FILENAME.md`

Example: `2025-11-01_BUILD_SUMMARY.md`

### Status Markers
- ✅ **CURRENT** - Active, up-to-date documentation
- ⚠️ **NEEDS REVIEW** - May be outdated, needs verification
- 🔄 **ARCHIVED** - Historical record, not for current use
- 📝 **DRAFT** - Work in progress

### Linking
Always use relative paths:
```markdown
[Architecture Guide](./architecture/PERCOLATOR_RESEARCH.md)
[Deployment Guide](./guides/TESTNET_DEPLOYMENT.md)
```

---

## 🔍 Finding Documentation

### By Topic

**Getting Started**
- New developer? → [GETTING_STARTED.md](./guides/GETTING_STARTED.md)
- Quick setup? → [QUICKSTART.md](./guides/QUICKSTART.md)
- Clean build? → [CLEAN_BUILD.md](./guides/CLEAN_BUILD.md)

**Architecture**
- Percolator research? → [PERCOLATOR_RESEARCH.md](./architecture/PERCOLATOR_RESEARCH.md)
- Sui DeFi landscape? → [SUI_DEFI_COMPETITIVE_LANDSCAPE.md](./architecture/SUI_DEFI_COMPETITIVE_LANDSCAPE.md)
- Protocol references? → [SUI_DEFI_REFERENCES.md](./architecture/SUI_DEFI_REFERENCES.md)

**Deployment**
- Deploy to testnet? → [TESTNET_DEPLOYMENT.md](./guides/TESTNET_DEPLOYMENT.md)
- Troubleshooting? → [TROUBLESHOOTING.md](./guides/TROUBLESHOOTING.md)

**Security**
- Prepare for audit? → [SECURITY_AUDIT_GUIDE.md](./operations/SECURITY_AUDIT_GUIDE.md)
- Audit checklist? → [AUDIT_PREPARATION_CHECKLIST.md](./operations/AUDIT_PREPARATION_CHECKLIST.md)

**Planning**
- Implementation plan? → [P0_IMPLEMENTATION_PLAN.md](./roadmaps/P0_IMPLEMENTATION_PLAN.md)
- Current TODOs? → [TODO_THIS_WEEK.md](./roadmaps/TODO_THIS_WEEK.md)

**Historical**
- Past decisions? → [/docs/archive/](./archive/)

### By Directory

- **`current/`** (1 file) - Active documentation for core concepts
- **`guides/`** (5 files) - Step-by-step how-to guides
- **`architecture/`** (3 files) - Architecture and competitive analysis
- **`operations/`** (2 files) - Security, audit, deployment operations
- **`archive/`** (9 files) - Historical documents with timestamps
- **`roadmaps/`** (4 files) - Planning and implementation roadmaps

---

## 📝 Contributing Documentation

### Creating New Documentation

1. **Determine type** (guide, architecture, operations, roadmap)
2. **Place in appropriate directory**:
   - Current active docs → `/docs/current/`
   - How-to guides → `/docs/guides/`
   - Architecture → `/docs/architecture/`
   - Operations → `/docs/operations/`
   - Roadmaps → `/docs/roadmaps/`
3. **Add timestamp if appropriate** (for versioned content)
4. **Update this INDEX.md**
5. **Add status marker** (CURRENT, DRAFT, etc.)

### Deprecating Documentation

1. **Move to `/docs/archive/`** with timestamp prefix
2. **Add deprecation marker** to title (🔄 ARCHIVED)
3. **Update INDEX.md** to mark as archived
4. **Add link to replacement** document if applicable
5. **Update any documents** that link to the deprecated doc

### Updating Documentation

1. **Update the document**
2. **Update "Last Updated"** timestamp in document header
3. **If major changes**, consider creating new timestamped version
4. **Update INDEX.md** if file moved or renamed

---

## 🔗 Quick Links

### Essential Reading
- 📘 [Getting Started](./guides/GETTING_STARTED.md)
- 🏗️ [Percolator Research](./architecture/PERCOLATOR_RESEARCH.md)
- 🚀 [Testnet Deployment](./guides/TESTNET_DEPLOYMENT.md)
- 🔒 [Security Audit Guide](./operations/SECURITY_AUDIT_GUIDE.md)

### For Contributors
- 💻 [Quick Start](./guides/QUICKSTART.md)
- 🔧 [Troubleshooting](./guides/TROUBLESHOOTING.md)
- 🧹 [Clean Build](./guides/CLEAN_BUILD.md)

### For Maintainers
- 🏗️ [Architecture & Research](./architecture/)
- 📋 [Implementation Roadmaps](./roadmaps/)
- 🔒 [Security & Audit](./operations/)

---

## 📧 Documentation Maintainers

For questions or suggestions about documentation:
- Create an issue with `[docs]` prefix
- Tag: `documentation`
- Repository: [tortoise-os/carapace](https://github.com/tortoise-os/carapace)

---

## 🚀 TortoiseOS Ecosystem

This is the **Carapace (AMM/DEX) repository**. For other documentation:
- **Foundation** (bun-move): `../bun-move/docs/INDEX.md`
- **Hatch** (Trading): `../hatch/docs/INDEX.md`
- **Turtle-net** (Network): `../turtle-net/docs/INDEX.md`

---

## 📊 Documentation Statistics

- **Total Documents**: 24 files
- **Current/Active**: 9 files
- **Guides**: 5 files
- **Architecture**: 3 files
- **Operations**: 2 files
- **Roadmaps**: 4 files
- **Archived**: 9 files
- **Last Organized**: 2025-11-01

---

**Navigation**: [Home](../README.md) | [Current](./current/) | [Guides](./guides/) | [Architecture](./architecture/) | [Operations](./operations/) | [Roadmaps](./roadmaps/) | [Archive](./archive/)

**Last Updated**: 2025-11-01
