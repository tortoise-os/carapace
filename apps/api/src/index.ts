/**
 * Carapace API Server
 * Using Elysia.js - https://elysiajs.com
 */

import { CarapaceSDK } from "@carapace/sdk"
import { cors } from "@elysiajs/cors"
import { Elysia } from "elysia"
import { config } from "./config"
import { testConnection } from "./db/client"
import { createAnalyticsPlugin } from "./routes/analytics"
import { createPoolDiscoveryPlugin } from "./routes/pool-discovery"
import { createPoolPlugin } from "./routes/pools"
import { createPositionsPlugin } from "./routes/positions"
import { createTokensPlugin } from "./routes/tokens"
import { createTransactionPlugin } from "./routes/transactions"
import { createTransactionHistoryPlugin } from "./routes/transactions-history"
import { PoolDiscoveryService } from "./services/pool-discovery"

// Initialize SDK
const sdk = new CarapaceSDK({
  network: config.sui.network,
  rpcUrl: config.sui.rpcUrl,
  packageIds: config.sui.packageIds,
})

// Start server
async function start() {
  try {
    // Test database connection (non-fatal)
    const dbConnected = await testConnection()
    if (!dbConnected) {
      console.log("⚠️  Running in mock mode - database unavailable")
    }

    // Initialize and start pool discovery service
    console.log("🔍 Initializing pool discovery service...")
    const poolDiscovery = new PoolDiscoveryService(sdk)
    await poolDiscovery.start(60000) // Scan every 60 seconds

    // Create Elysia app with pool discovery
    console.log("📝 Creating Elysia app...")
    const app = new Elysia()
      .use(
        cors({
          origin: config.cors.origin,
          credentials: config.cors.credentials,
        })
      )
      .decorate("sdk", sdk)
      .decorate("poolDiscovery", poolDiscovery)
      .get("/health", () => ({
        status: "ok",
        timestamp: new Date().toISOString(),
      }))
      .use(createPoolPlugin(sdk))
      .use(createPoolDiscoveryPlugin(poolDiscovery))
      .use(createTransactionPlugin)
      .use(createAnalyticsPlugin)
      .use(createPositionsPlugin)
      // biome-ignore lint/suspicious/noExplicitAny: Type compatibility between SuiJsonRpcClient and SuiClient
      .use(createTokensPlugin(sdk.client as any))
      // biome-ignore lint/suspicious/noExplicitAny: Type compatibility between SuiJsonRpcClient and SuiClient
      .use(createTransactionHistoryPlugin(sdk.client as any))
      .onError(({ code, error, set }) => {
        console.error("Error:", error)

        if (code === "VALIDATION") {
          set.status = 400
          return {
            success: false,
            error: "Validation error",
            details: error.message,
          }
        }

        if (code === "NOT_FOUND") {
          set.status = 404
          return {
            success: false,
            error: "Not found",
          }
        }

        set.status = 500
        return {
          success: false,
          error: (error as Error).message || "Internal server error",
        }
      })

    console.log("🚀 Starting server on port", config.server.port)
    app.listen(config.server.port, () => {
      console.log(`
🐢 Carapace API Server (Elysia.js)

Environment: ${config.server.env}
Network: ${config.sui.network}
Port: ${config.server.port}
Package ID: ${config.sui.packageIds.carapace}
Mode: ${dbConnected ? "Database" : "Mock Data"}
Pool Discovery: Enabled (scanning every 60s)

Server running at http://${config.server.host}:${config.server.port}
      `)
    })
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

start()
