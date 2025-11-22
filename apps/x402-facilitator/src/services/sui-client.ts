/**
 * Sui blockchain client service with retry logic and circuit breaker
 */

import { SuiClient } from "@mysten/sui/client"
import { Ed25519Keypair, Ed25519PublicKey } from "@mysten/sui/keypairs/ed25519"
import { circuitBreaker, ConsecutiveBreaker, ExponentialBackoff, handleAll, retry } from "cockatiel"
import pRetry from "p-retry"
import { config } from "../config"
import { logger } from "./logger"

/**
 * Global Sui client instance
 */
export const suiClient = new SuiClient({ url: config.suiRpcUrl })

/**
 * Circuit breaker for RPC calls
 * Opens after 5 consecutive failures, half-opens after 10 seconds
 */
const breaker = circuitBreaker(handleAll, {
  halfOpenAfter: 10000, // 10 seconds
  breaker: new ConsecutiveBreaker(5), // Open after 5 failures
})

/**
 * Retry policy with exponential backoff
 */
const retryPolicy = retry(handleAll, {
  maxAttempts: 3,
  backoff: new ExponentialBackoff(),
})

/**
 * Sui client with resilience (circuit breaker + retry)
 * Circuit breaker wraps retry logic
 */
export const resilientSuiClient = {
  getBalance: (params: Parameters<typeof suiClient.getBalance>[0]) =>
    breaker.execute(() =>
      retryPolicy.execute(() => suiClient.getBalance(params))
    ),

  signAndExecuteTransaction: (params: Parameters<typeof suiClient.signAndExecuteTransaction>[0]) =>
    breaker.execute(() =>
      retryPolicy.execute(() => suiClient.signAndExecuteTransaction(params))
    ),

  // Add other methods as needed
}

// Log circuit breaker state changes
breaker.onStateChange((state) => {
  logger.warn({ state }, "Circuit breaker state changed")
})

breaker.onBreak(() => {
  logger.error("Circuit breaker opened - RPC is failing")
})

breaker.onHalfOpen(() => {
  logger.info("Circuit breaker half-open - testing RPC")
})

breaker.onReset(() => {
  logger.info("Circuit breaker closed - RPC is healthy")
})

/**
 * Facilitator keypair for gas sponsorship
 */
let facilitatorKeypair: Ed25519Keypair | null = null

/**
 * Get facilitator keypair (lazy initialization)
 */
export function getFacilitatorKeypair(): Ed25519Keypair {
  if (!facilitatorKeypair) {
    if (!config.facilitatorPrivateKey) {
      throw new Error("FACILITATOR_PRIVATE_KEY not configured")
    }

    // Decode from base64 or hex
    const keyData = config.facilitatorPrivateKey.startsWith("suiprivkey")
      ? config.facilitatorPrivateKey
      : Buffer.from(config.facilitatorPrivateKey, "base64")

    facilitatorKeypair = Ed25519Keypair.fromSecretKey(keyData)
  }

  return facilitatorKeypair
}

/**
 * Get Sui address from public key
 */
export function getAddressFromPublicKey(publicKeyBase64: string): string {
  const publicKeyBytes = Buffer.from(publicKeyBase64, "base64")
  const publicKey = new Ed25519PublicKey(new Uint8Array(publicKeyBytes))
  return publicKey.toSuiAddress()
}

/**
 * Check if address has sufficient balance (with retry logic)
 */
export async function checkBalance(
  address: string,
  requiredAmount: string
): Promise<{ sufficient: boolean; balance: string }> {
  try {
    // Check cache first
    const { getCachedBalance, setCachedBalance } = await import("./cache")
    const cached = getCachedBalance(address, requiredAmount)
    if (cached) {
      return cached
    }

    // Use resilient client with circuit breaker
    const balanceResult = await resilientSuiClient.getBalance({
      owner: address,
      coinType: "0x2::sui::SUI",
    })

    const balance = BigInt(balanceResult.totalBalance)
    const required = BigInt(requiredAmount)
    const sufficient = balance >= required

    const result = {
      sufficient,
      balance: balanceResult.totalBalance,
    }

    // Cache the result
    setCachedBalance(address, requiredAmount, result.balance, result.sufficient)

    return result
  } catch (error) {
    logger.error({ error, address }, "Balance check failed after retries")
    return {
      sufficient: false,
      balance: "0",
    }
  }
}
