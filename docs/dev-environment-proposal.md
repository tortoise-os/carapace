# Development Environment Management Proposal

## Current State Analysis

### Existing Setup
- **Task Runner**: go-task (Taskfile.yml) - already configured with 50+ tasks
- **Docker**: Docker Compose for infrastructure (postgres, redis, grafana, prometheus)
- **Sui Network**: Run separately via `sui start --force-regenesis` (not in Docker)
- **Development Servers**:
  - Next.js web app (port 3000)
  - Express API (port 3501)
  - Currently started manually or via `task dev`

### Current Issues
1. **No unified process management** - Services run in separate terminal windows
2. **Manual coordination required** - Developer must start/stop services individually
3. **No visibility into running processes** - Hard to see which services are up
4. **Resource leaks** - Background processes may not clean up properly
5. **Inconsistent startup order** - Dependencies may not be ready when needed

## Proposed Solutions

We have **three viable approaches** for managing the development environment:

### Option 1: Taskfile + Process Manager (Overmind/Hivemind) ⭐ RECOMMENDED

**Architecture**:
```
Taskfile.yml (orchestration)
    ↓
Procfile (process definitions)
    ↓
Overmind/Hivemind (process management)
    ↓
Individual Services (sui, docker, web, api)
```

**Implementation**:
- Create a `Procfile` defining all development processes
- Use Overmind (Go) or Hivemind (Go) to manage processes
- Keep Taskfile.yml for build/deploy/test tasks
- Separate concerns: Task for workflows, Procfile for runtime

**Pros**:
- ✅ Clear separation of concerns (build vs runtime)
- ✅ Overmind/Hivemind are from Go ecosystem (Rust-compatible philosophy)
- ✅ Single-pane-of-glass view of all running services
- ✅ Process restart without killing everything
- ✅ Color-coded logs with service labels
- ✅ Graceful shutdown of all services
- ✅ Compatible with existing Docker Compose
- ✅ Works with Next.js dev server

**Cons**:
- ❌ Requires installing Overmind/Hivemind (`brew install overmind` or `brew install hivemind`)
- ❌ Additional tool to learn (though very simple)
- ❌ One more config file (Procfile)

**Compatibility**:
- ✅ Docker Compose: Uses `docker compose up` as a process
- ✅ Next.js: Runs as a process via `bun run dev`
- ✅ Sui: Runs `sui start` as a managed process
- ✅ API: Runs Express API as a managed process

---

### Option 2: Enhanced Taskfile with Parallel Tasks

**Architecture**:
```
Taskfile.yml (everything)
    ↓
Parallel task execution
    ↓
Individual Services
```

**Implementation**:
```yaml
tasks:
  dev:all:
    desc: Start all services in parallel
    deps:
      - task: docker:up
    cmds:
      - task: dev:sui &
      - task: dev:api &
      - task: dev:web &
      - wait
```

**Pros**:
- ✅ No additional tools required
- ✅ Everything in Taskfile.yml
- ✅ Simple to understand

**Cons**:
- ❌ Poor visibility (logs mixed together)
- ❌ Hard to restart individual services
- ❌ No graceful shutdown
- ❌ Background processes can leak
- ❌ No process status visibility
- ❌ Task is not designed for long-running processes

**Compatibility**:
- ✅ Works with all existing services
- ⚠️ But management is manual and error-prone

---

### Option 3: Docker Compose for Everything

**Architecture**:
```
Docker Compose (everything)
    ↓
Containerized Services
    ↓
Individual Services (all in containers)
```

**Implementation**:
- Add Sui node to Docker Compose
- Containerize Next.js dev server
- Containerize API dev server
- All services defined in docker-compose.yml

**Pros**:
- ✅ Single tool for all services
- ✅ Consistent environment
- ✅ Production-like setup
- ✅ Easy port management

**Cons**:
- ❌ Slower hot-reload for Next.js (volume mounting overhead)
- ❌ Sui in Docker has platform compatibility issues (noted in current config)
- ❌ More complex debugging (exec into containers)
- ❌ Overkill for development
- ❌ Resource intensive (multiple containers)
- ❌ File watching issues on macOS

**Compatibility**:
- ⚠️ Next.js: Slower hot-reload, needs volume mounting
- ❌ Sui: Platform compatibility issues (why it's not in Docker now)
- ✅ API: Works well
- ✅ Infrastructure: Already working

---

## Recommended Approach: Option 1 (Taskfile + Overmind)

### Why This Is Best for Sui/Rust Ecosystem

1. **Go Tools Philosophy**: Both Task and Overmind are written in Go, which shares similar values with Rust:
   - Single binary, no dependencies
   - Fast execution
   - Cross-platform
   - Minimal resource usage

2. **Separation of Concerns**:
   - `Taskfile.yml`: Build, test, deploy workflows
   - `Procfile`: Runtime process management
   - This matches Rust's philosophy of doing one thing well

3. **Developer Experience**:
   - One command: `overmind start` (or `task dev:all`)
   - Clear logs for each service
   - Easy to restart individual processes: `overmind restart web`
   - Clean shutdown: `overmind quit` or Ctrl+C

4. **Production Alignment**:
   - Procfile is industry standard (used by Heroku, etc.)
   - Easy to translate to production deployment
   - Infrastructure as code

### Proposed Structure

```
carapace/
├── Taskfile.yml           # Build, test, deploy tasks (existing)
├── Procfile              # Development processes (new)
├── docker-compose.yml     # Infrastructure services (existing)
└── scripts/
    └── dev-check.sh      # Health check script (new)
```

### Procfile Example

```procfile
# Infrastructure
docker: cd tooling/docker && docker compose up

# Sui Network
sui: sui start --force-regenesis --with-faucet

# Application Services
api: cd apps/api && bun run dev
web: cd apps/web && bun run dev

# Optional: Indexer (when ready)
# indexer: cd apps/indexer && bun run dev
```

### Enhanced Taskfile.yml

```yaml
tasks:
  # New unified dev command
  dev:all:
    desc: Start all development services with Overmind
    deps:
      - task: dev:check
    cmds:
      - overmind start

  dev:check:
    desc: Check prerequisites before starting
    cmds:
      - |
        command -v overmind >/dev/null 2>&1 || {
          echo "❌ Overmind not installed"
          echo "Install with: brew install overmind"
          exit 1
        }
      - |
        command -v sui >/dev/null 2>&1 || {
          echo "❌ Sui CLI not installed"
          echo "Install from: https://docs.sui.io/build/install"
          exit 1
        }

  dev:stop:
    desc: Stop all development services
    cmds:
      - overmind quit || echo "Overmind not running"

  dev:restart:
    desc: Restart a specific service
    cmds:
      - overmind restart {{.CLI_ARGS}}

  dev:connect:
    desc: Connect to a running service
    cmds:
      - overmind connect {{.CLI_ARGS}}

  # Keep existing tasks for individual services
  # ... rest of existing tasks ...
```

### Developer Workflow

```bash
# First time setup
task setup

# Start all services
task dev:all
# OR directly: overmind start

# View aggregated logs with color coding
# (automatic, no command needed)

# Restart just the web app
overmind restart web
# OR: task dev:restart web

# Connect to a specific service's terminal
overmind connect api

# Stop everything
task dev:stop
# OR: overmind quit
# OR: Ctrl+C (graceful shutdown)

# Check status
overmind status
```

### Migration Path

1. **Phase 1** (Week 1): Add Procfile, update Taskfile
2. **Phase 2** (Week 2): Team testing, gather feedback
3. **Phase 3** (Week 3): Update documentation, onboard team
4. **Phase 4** (Week 4): Deprecate old `task dev` in favor of `task dev:all`

## Alternative: Hivemind vs Overmind

Both are very similar, written in Go, but have slight differences:

### Overmind
- **Pros**: More features (tmux integration, port detection)
- **Cons**: Requires tmux dependency
- **Install**: `brew install overmind tmux`
- **Better for**: Complex setups, power users

### Hivemind
- **Pros**: Zero dependencies (pure Go), simpler
- **Cons**: Fewer features
- **Install**: `brew install hivemind`
- **Better for**: Simple setups, minimalists

**Recommendation**: Start with **Hivemind** for simplicity, can upgrade to Overmind later if needed.

## Resources & References

- [Overmind GitHub](https://github.com/DarthSim/overmind)
- [Hivemind GitHub](https://github.com/DarthSim/hivemind)
- [Procfile Format](https://devcenter.heroku.com/articles/procfile)
- [Task (go-task)](https://taskfile.dev/)
- [Sui Local Network](https://docs.sui.io/guides/developer/getting-started/local-network)

## Questions for Discussion

1. **Tool preference**: Overmind or Hivemind?
2. **Backward compatibility**: Keep `task dev` as alias to `task dev:all`?
3. **Service grouping**: Should we have separate Procfiles for different stacks (frontend-only, full-stack, etc.)?
4. **Port management**: Standardize port ranges (3000-3099 for apps, 3100-3199 for tools, etc.)?
5. **Health checks**: Should we wait for services to be healthy before considering startup complete?

## Next Steps

If approved, I can:
1. Create the Procfile with all current services
2. Update Taskfile.yml with new dev commands
3. Add health check scripts
4. Update README.md with new workflow
5. Create troubleshooting guide for common issues

---

**Decision Required**: Please approve Option 1 or suggest modifications before implementation.
