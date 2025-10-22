# Carapace Documentation Index

**Last Updated**: 2025-10-22
**Maintainer**: Documentation Team

> This index tracks all documentation in the Carapace project, including active, archived, and deprecated documents.

---

## Quick Navigation

- [Active Documentation](#active-documentation)
- [Recently Updated](#recently-updated)
- [Deprecated / Archived](#deprecated--archived)
- [Directory Structure](#directory-structure)

---

## Active Documentation

### Core Project Documents (Root)
| Document | Status | Last Updated | Description |
|----------|--------|--------------|-------------|
| `README.md` | ✅ Active | 2025-10-22 | Main project overview and setup |
| `ROADMAP.md` | ✅ Active | 2025-10-22 | Comprehensive Phase 1 roadmap with all features |
| `FUNCTIONAL_STATUS.md` | ✅ Active | 2025-10-22 | Honest functional assessment (no time estimates) |

### Research & Analysis (`docs/research/`)
| Document | Status | Last Updated | Description |
|----------|--------|--------------|-------------|
| `PERCOLATOR_RESEARCH.md` | ✅ Active | TBD | Percolator perpetual futures research |
| `SUI_DEFI_REFERENCES.md` | ✅ Active | TBD | Sui DeFi protocol references (Avocado, Cetus, Navi, Turbos, AI Kit) |
| `SUI_DEFI_COMPETITIVE_LANDSCAPE.md` | ✅ Active | TBD | Competitive analysis of Sui DeFi ecosystem |

### Planning & Tasks (`docs/planning/`)
| Document | Status | Last Updated | Description |
|----------|--------|--------------|-------------|
| `TODO_PERCOLATOR.md` | ⚠️  Review | TBD | Percolator implementation TODOs |
| `TODO_THIS_WEEK.md` | ⚠️  Review | TBD | Weekly task tracking |
| `IMPLEMENTATION_CHECKLIST.md` | ⚠️  Review | TBD | Implementation tracking |

### Guides & How-To (`docs/guides/`)
| Document | Status | Last Updated | Description |
|----------|--------|--------------|-------------|
| `GETTING_STARTED.md` | ⚠️  Needs Review | TBD | Getting started guide |
| `QUICKSTART.md` | ⚠️  Needs Review | TBD | Quick start guide |
| `TESTNET_DEPLOYMENT.md` | ✅ Active | TBD | Testnet deployment guide |
| `TROUBLESHOOTING.md` | ✅ Active | TBD | Common issues and solutions |
| `CLEAN_BUILD.md` | ✅ Active | TBD | Clean build instructions |

### Security & Audit (`docs/security/`)
| Document | Status | Last Updated | Description |
|----------|--------|--------------|-------------|
| `SECURITY_AUDIT_GUIDE.md` | ✅ Active | TBD | Comprehensive security audit preparation |
| `AUDIT_PREPARATION_CHECKLIST.md` | ✅ Active | TBD | Audit preparation checklist |

### Status Reports (`docs/status/`)
| Document | Status | Last Updated | Description |
|----------|--------|--------------|-------------|
| `BUILD_SUMMARY.md` | 📦 Archive | TBD | Build summary snapshot |
| `SESSION_SUMMARY.md` | 📦 Archive | TBD | Session work summary |
| `PORT_MIGRATION_SUMMARY.md` | 📦 Archive | TBD | Port migration details |

---

## Recently Updated

| Date | Document | Changes |
|------|----------|---------|
| 2025-10-22 | `FUNCTIONAL_STATUS.md` | Created comprehensive functional assessment without time estimates |
| 2025-10-22 | `ROADMAP.md` | Last updated roadmap |
| 2025-10-22 | `docs/INDEX.md` | Created documentation index |

---

## Deprecated / Archived

### Archived (`docs/archive/`)
Documents that are outdated but kept for historical reference.

| Document | Archived Date | Reason | Replacement |
|----------|--------------|--------|-------------|
| `QUICK_START.md` | TBD | Duplicate of QUICKSTART.md | Use `docs/guides/QUICKSTART.md` |
| `DEPLOYMENT.md` | TBD | Superseded by TESTNET_DEPLOYMENT.md | Use `docs/guides/TESTNET_DEPLOYMENT.md` |
| `IMPLEMENTATION_PLAN.md` | TBD | Superseded by ROADMAP.md + FUNCTIONAL_STATUS.md | Use `ROADMAP.md` and `FUNCTIONAL_STATUS.md` |
| `PORT_MAPPING.md` | TBD | One-time migration doc | Archived for reference |
| `TWITTER_THREAD.md` | TBD | Marketing material | Moved to archive |
| `UI_IMPROVEMENTS.md` | TBD | Outdated UI notes | Superseded by roadmap |

### To Be Reviewed
Documents that need assessment for current vs deprecated status.

| Document | Status | Action Needed |
|----------|--------|---------------|
| `TODO_PERCOLATOR.md` | ⚠️  Review | Merge with ROADMAP.md Phase 1J or archive |
| `TODO_THIS_WEEK.md` | ⚠️  Review | Determine if actively maintained or archive |
| `IMPLEMENTATION_CHECKLIST.md` | ⚠️  Review | Merge with FUNCTIONAL_STATUS.md or archive |

---

## Directory Structure

```
carapace/
├── README.md                          # Main project overview
├── ROADMAP.md                         # Complete Phase 1 roadmap
├── FUNCTIONAL_STATUS.md               # Current functional status (2025-10-22)
│
├── docs/
│   ├── INDEX.md                       # This file - documentation index
│   │
│   ├── research/                      # Research and analysis
│   │   ├── PERCOLATOR_RESEARCH.md
│   │   ├── SUI_DEFI_REFERENCES.md
│   │   └── SUI_DEFI_COMPETITIVE_LANDSCAPE.md
│   │
│   ├── planning/                      # Planning and task tracking
│   │   ├── TODO_PERCOLATOR.md
│   │   ├── TODO_THIS_WEEK.md
│   │   └── IMPLEMENTATION_CHECKLIST.md
│   │
│   ├── guides/                        # How-to guides and tutorials
│   │   ├── GETTING_STARTED.md
│   │   ├── QUICKSTART.md
│   │   ├── TESTNET_DEPLOYMENT.md
│   │   ├── TROUBLESHOOTING.md
│   │   └── CLEAN_BUILD.md
│   │
│   ├── security/                      # Security and audit docs
│   │   ├── SECURITY_AUDIT_GUIDE.md
│   │   └── AUDIT_PREPARATION_CHECKLIST.md
│   │
│   ├── status/                        # Status reports and snapshots
│   │   ├── BUILD_SUMMARY.md
│   │   ├── SESSION_SUMMARY.md
│   │   └── PORT_MIGRATION_SUMMARY.md
│   │
│   └── archive/                       # Deprecated/outdated docs
│       ├── QUICK_START.md
│       ├── DEPLOYMENT.md
│       ├── IMPLEMENTATION_PLAN.md
│       ├── PORT_MAPPING.md
│       ├── TWITTER_THREAD.md
│       └── UI_IMPROVEMENTS.md
│
├── move/
│   └── README.md                      # Move contract documentation
│
└── tooling/
    └── demo/
        └── graphics/
            └── README.md              # Graphics demo documentation
```

---

## Document Metadata Standard

All documents should include this metadata header:

```markdown
---
title: Document Title
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: active | review | deprecated | archived
category: guide | research | planning | status | security
author: Team/Person
---
```

---

## Maintenance Guidelines

### When to Archive
- Document is outdated or superseded by newer docs
- Information is no longer relevant to current project state
- Content has been merged into other documents

### When to Mark as "Needs Review"
- Document hasn't been updated in >30 days
- Unclear if content is still accurate
- Multiple similar documents exist

### When to Update
- Project structure changes
- New features added
- Process changes
- Security updates

### Periodic Review Schedule
- **Weekly**: Review planning and task documents
- **Monthly**: Review guides and how-to docs
- **Quarterly**: Review research and status reports
- **Annually**: Archive outdated documents

---

## Contributing to Documentation

1. **Create new docs** in the appropriate directory
2. **Add metadata header** at the top of each document
3. **Update INDEX.md** with new document entry
4. **Use timestamps** for all date references (YYYY-MM-DD format)
5. **Link related docs** using relative paths
6. **Archive old versions** when creating replacements

---

## Quick Reference

### Find Current Status
→ `FUNCTIONAL_STATUS.md` (root)

### Find Roadmap
→ `ROADMAP.md` (root)

### Start Development
→ `docs/guides/GETTING_STARTED.md`

### Deploy to Testnet
→ `docs/guides/TESTNET_DEPLOYMENT.md`

### Research Sui DeFi
→ `docs/research/SUI_DEFI_REFERENCES.md`

### Prepare for Audit
→ `docs/security/SECURITY_AUDIT_GUIDE.md`

---

**Index Version**: 1.0
**Last Index Update**: 2025-10-22
