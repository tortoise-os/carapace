/**
 * Sui x402 Facilitator Service
 *
 * A production-ready payment facilitator for the x402 protocol on Sui blockchain.
 * Built with Elysia (Bun-native) for maximum performance.
 */

import { swagger } from "@elysiajs/swagger"
import { Elysia } from "elysia"
import { config, validateConfig } from "./config"
import { healthRoute } from "./routes/health"
import { metricsRoute } from "./routes/metrics"
import { settleRoute } from "./routes/settle"
import { supportedRoute } from "./routes/supported"
import { verifyRoute } from "./routes/verify"
import { logger } from "./services/logger"
import { rateLimitMiddleware } from "./middleware/rate-limiter"

/**
 * Check if origin is allowed
 */
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false
  return config.allowedOrigins.some((allowed) => {
    if (allowed === "*") return true
    if (allowed === origin) return true
    // Support wildcard subdomains like *.example.com
    if (allowed.startsWith("*.")) {
      const domain = allowed.slice(2)
      return origin.endsWith(domain)
    }
    return false
  })
}

/**
 * Create Elysia app instance with production security
 */
export function createApp() {
  return (
    new Elysia()
      // OpenAPI documentation
      .use(
        swagger({
          documentation: {
            info: {
              title: "x402 Payment Facilitator API",
              version: "0.1.0",
              description: "HTTP 402 payment facilitator for Sui blockchain. Enables gasless transactions through payment protocol.",
              contact: {
                name: "Carapace Team",
                url: "https://github.com/tortoise-os/carapace",
              },
              license: {
                name: "MIT",
                url: "https://opensource.org/licenses/MIT",
              },
            },
            tags: [
              { name: "health", description: "Health check endpoints" },
              { name: "payments", description: "Payment verification and settlement" },
              { name: "info", description: "Service information" },
              { name: "metrics", description: "Prometheus metrics" },
            ],
            servers: [
              {
                url: "http://localhost:3606",
                description: "Development server",
              },
            ],
          },
          path: "/docs",
          exclude: ["/docs", "/docs/json"],
        })
      )

      // Request timeout (30 seconds)
      .onRequest(async ({ request }) => {
        const timeoutMs = 30000
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Request timeout")), timeoutMs)
        })

        // Add timeout to request
        ;(request as any).timeoutPromise = timeoutPromise
      })

      // Request size limit (1MB)
      .onParse(({ request }) => {
        const contentLength = request.headers.get("content-length")
        if (contentLength && Number.parseInt(contentLength, 10) > 1024 * 1024) {
          throw new Error("Request body too large")
        }
      })

      // CORS middleware (configurable origins)
      .onRequest(({ request, set }) => {
        const origin = request.headers.get("origin")

        if (origin && isOriginAllowed(origin)) {
          set.headers["Access-Control-Allow-Origin"] = origin
          set.headers["Access-Control-Allow-Credentials"] = "true"
        }

        set.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        set.headers["Access-Control-Allow-Headers"] = "Content-Type, X-Payment, X-Request-ID"
        set.headers["Access-Control-Max-Age"] = "86400" // 24 hours

        // Handle preflight
        if (request.method === "OPTIONS") {
          return new Response(null, { status: 204 })
        }
      })

      // Request ID and logging middleware
      .derive(({ request }) => {
        const requestId = request.headers.get("x-request-id") || crypto.randomUUID()
        const url = new URL(request.url)
        const ip = request.headers.get("x-forwarded-for") || request.headers.get("cf-connecting-ip") || "unknown"

        logger.info(
          {
            requestId,
            method: request.method,
            path: url.pathname,
            ip,
          },
          "Request received"
        )

        return { requestId, startTime: Date.now() }
      })

      // Response logging with duration
      .onAfterHandle(({ requestId, startTime, set }) => {
        const duration = Date.now() - startTime
        set.headers["X-Request-ID"] = requestId
        set.headers["X-Response-Time"] = `${duration}ms`

        logger.info(
          {
            requestId,
            duration,
            status: set.status,
          },
          "Request completed"
        )
      })

      // Rate limiting middleware
      .onBeforeHandle((context) => {
        const isBlocked = rateLimitMiddleware(context)
        if (isBlocked) {
          return {
            error: "Too many requests",
            message: "Rate limit exceeded. Please try again later.",
            retryAfter: context.set.headers["X-RateLimit-Reset"],
          }
        }
      })

      // Error handling
      .onError(({ code, error, set, request }) => {
        const requestId = request.headers.get("x-request-id") || crypto.randomUUID()
        logger.error({ error, code, requestId }, "Request failed")

        if (code === "VALIDATION") {
          set.status = 422 // Changed from 400 to 422 for consistency
          return {
            error: "Validation error",
            details: config.nodeEnv === "production" ? "Invalid request format" : error.message,
          }
        }

        if (code === "NOT_FOUND") {
          set.status = 404
          return {
            error: "Not found",
          }
        }

        // Don't leak internal errors in production
        set.status = 500
        return {
          error: "Internal server error",
          requestId,
        }
      })

      // Routes
      .use(healthRoute)
      .use(verifyRoute)
      .use(settleRoute)
      .use(supportedRoute)
      .use(metricsRoute)

      // Root endpoint
      .get("/", () => ({
        name: "Sui x402 Facilitator",
        version: "0.1.0",
        endpoints: {
          health: "GET /health",
          verify: "POST /verify",
          settle: "POST /settle",
          supported: "GET /supported",
        },
        documentation: "https://github.com/coinbase/x402",
      }))
  )
}

/**
 * Start the server (only if run directly)
 */
if (import.meta.main) {
  try {
    // Validate configuration
    validateConfig()

    // Create and start app
    const app = createApp()

    const server = app.listen(config.port, () => {
      logger.info({ port: config.port, nodeEnv: config.nodeEnv }, "Server started")
      console.log("╔════════════════════════════════════════════════════╗")
      console.log("║   Sui x402 Facilitator                             ║")
      console.log("╠════════════════════════════════════════════════════╣")
      console.log(`║   Port:     ${config.port.toString().padEnd(40)} ║`)
      console.log(`║   Network:  ${config.suiRpcUrl.padEnd(40)} ║`)
      console.log(`║   Env:      ${config.nodeEnv.padEnd(40)} ║`)
      console.log(`║   Status:   Healthy                                ║`)
      console.log("╚════════════════════════════════════════════════════╝")
      console.log()
      console.log("Endpoints:")
      console.log(`  GET  http://localhost:${config.port}/health`)
      console.log(`  POST http://localhost:${config.port}/verify`)
      console.log(`  POST http://localhost:${config.port}/settle`)
      console.log(`  GET  http://localhost:${config.port}/supported`)
      console.log()
    })

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info({ signal }, "Shutdown signal received, closing server gracefully")

      try {
        await server.stop()
        logger.info("Server closed successfully")
        process.exit(0)
      } catch (error) {
        logger.error({ error }, "Error during shutdown")
        process.exit(1)
      }
    }

    process.on("SIGTERM", () => shutdown("SIGTERM"))
    process.on("SIGINT", () => shutdown("SIGINT"))
  } catch (error) {
    logger.error({ error }, "Failed to start server")
    process.exit(1)
  }
}
