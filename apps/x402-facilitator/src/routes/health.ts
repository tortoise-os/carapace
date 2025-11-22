/**
 * GET /health - Health check endpoint with wallet balance monitoring
 */

import { Elysia } from "elysia"
import { config } from "../config"
import { logger } from "../services/logger"
import { getFacilitatorKeypair, suiClient } from "../services/sui-client"

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy"
  version: string
  timestamp: number
  uptime: number
  facilitator?: {
    address: string
    balanceSUI: number
    alert?: string
  }
}

const startTime = Date.now()

export const healthRoute = new Elysia().get("/health", async (): Promise<HealthStatus> => {
  try {
    // Get facilitator address and balance
    const facilitatorKeypair = getFacilitatorKeypair()
    const address = facilitatorKeypair.getPublicKey().toSuiAddress()

    const balance = await suiClient.getBalance({
      owner: address,
      coinType: "0x2::sui::SUI",
    })

    const balanceSUI = Number(balance.totalBalance) / 1_000_000_000
    const isHealthy = balanceSUI >= config.minWalletBalanceSUI

    if (!isHealthy) {
      logger.warn(
        { balanceSUI, minBalance: config.minWalletBalanceSUI, address },
        "Facilitator wallet balance below threshold"
      )
    }

    return {
      status: isHealthy ? "healthy" : "degraded",
      version: "0.1.0",
      timestamp: Date.now(),
      uptime: Date.now() - startTime,
      facilitator: {
        address,
        balanceSUI,
        alert: !isHealthy
          ? `Low balance: ${balanceSUI.toFixed(4)} SUI (minimum: ${config.minWalletBalanceSUI} SUI)`
          : undefined,
      },
    }
  } catch (error) {
    logger.error({ error }, "Health check failed")
    return {
      status: "unhealthy",
      version: "0.1.0",
      timestamp: Date.now(),
      uptime: Date.now() - startTime,
    }
  }
})
