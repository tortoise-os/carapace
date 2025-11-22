# Monorepo-aware Dockerfile for x402-facilitator
# Build from monorepo root with: docker build -f apps/x402-facilitator/Dockerfile -t x402-facilitator .

FROM oven/bun:1.3.1 AS base
WORKDIR /workspace

# Install dependencies (full monorepo for workspace resolution)
FROM base AS install
# Copy workspace configuration
COPY package.json bun.lock ./
COPY packages/x402-types/package.json ./packages/x402-types/package.json
COPY apps/x402-facilitator/package.json ./apps/x402-facilitator/package.json

# Install all workspace dependencies
RUN bun install

# Build workspace dependencies
COPY packages/x402-types ./packages/x402-types
RUN cd packages/x402-types && bun run build 2>/dev/null || true

# Build application
FROM base AS build
COPY --from=install /workspace/node_modules ./node_modules
COPY --from=install /workspace/packages ./packages
COPY package.json bun.lock ./
COPY apps/x402-facilitator ./apps/x402-facilitator

# Build the facilitator app
WORKDIR /workspace/apps/x402-facilitator
ENV NODE_ENV=production
RUN bun run build

# Production stage - minimal image with only runtime files
FROM oven/bun:1.3.1-slim AS release
WORKDIR /app

# Copy built application and production dependencies
COPY --from=build /workspace/apps/x402-facilitator/dist ./dist
COPY --from=build /workspace/apps/x402-facilitator/package.json ./
COPY --from=build /workspace/node_modules ./node_modules

# Use bun user (already exists in base image)
USER bun

# Expose correct port for x402-facilitator
EXPOSE 3606

# Health check with correct port
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD bun run -e "fetch('http://localhost:3606/health').then(r => r.ok ? process.exit(0) : process.exit(1))"

# Run the built application
CMD ["bun", "run", "dist/index.js"]
