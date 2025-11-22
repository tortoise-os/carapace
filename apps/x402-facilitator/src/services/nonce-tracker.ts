/**
 * Nonce replay protection service
 *
 * Tracks used nonces to prevent replay attacks
 */

import { LRUCache } from "lru-cache"
import { config } from "../config"
import { logger } from "./logger"

interface NonceEntry {
  timestamp: number
  address: string
}

/**
 * In-memory nonce cache with automatic expiry
 * For production with multiple instances, use Redis
 */
const nonceCache = new LRUCache<string, NonceEntry>({
  max: 10000, // Store up to 10k recent nonces
  ttl: config.maxPaymentAgeMs, // Auto-expire after maxPaymentAgeMs
  updateAgeOnGet: false,
})

/**
 * Check if nonce has been used
 */
export function isNonceUsed(nonce: string, address: string): boolean {
  const entry = nonceCache.get(nonce)

  if (!entry) {
    return false
  }

  // Check if nonce is for same address (additional security)
  if (entry.address !== address) {
    logger.warn(
      { nonce, originalAddress: entry.address, attemptedAddress: address },
      "Nonce reuse detected from different address"
    )
    return true
  }

  logger.warn({ nonce, address }, "Nonce replay attempt detected")
  return true
}

/**
 * Mark nonce as used
 */
export function markNonceAsUsed(nonce: string, address: string): void {
  nonceCache.set(nonce, {
    timestamp: Date.now(),
    address,
  })

  logger.debug({ nonce, address }, "Nonce marked as used")
}

/**
 * Get cache statistics for monitoring
 */
export function getNonceStats() {
  return {
    size: nonceCache.size,
    maxSize: 10000,
    hitRate: nonceCache.calculatedSize / (nonceCache.size || 1),
  }
}

/**
 * Clear all nonces (for testing only)
 */
export function clearNonces(): void {
  nonceCache.clear()
  logger.info("Nonce cache cleared")
}
