FROM oven/bun:1.3.1 AS base
WORKDIR /app

# Install dependencies
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Copy production dependencies
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Build stage
FROM base AS build
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Type check and build
ENV NODE_ENV=production
RUN bun run build

# Production stage
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json .

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs
USER nodejs

# Expose port
EXPOSE 3402

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD bun run -e "fetch('http://localhost:3402/health').then(r => r.ok ? process.exit(0) : process.exit(1))"

# Run
CMD ["bun", "run", "dist/index.js"]
