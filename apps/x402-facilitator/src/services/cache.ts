/**
 * Balance caching service for performance optimization
 */

import { LRUCache } from "lru-cache"
import { logger } from "./logger"

interface BalanceEntry {
	balance: string
	sufficient: boolean
	timestamp: number
}

/**
 * Cache for balance checks
 * TTL: 5 seconds (balance can change quickly)
 * Max entries: 1000 addresses
 */
export const balanceCache = new LRUCache<string, BalanceEntry>({
	max: 1000,
	ttl: 5000, // 5 seconds
	updateAgeOnGet: false,
})

/**
 * Generate cache key for balance check
 */
function getCacheKey(address: string, requiredAmount: string): string {
	return `${address}:${requiredAmount}`
}

/**
 * Get cached balance if available
 */
export function getCachedBalance(
	address: string,
	requiredAmount: string,
): { sufficient: boolean; balance: string } | null {
	const key = getCacheKey(address, requiredAmount)
	const entry = balanceCache.get(key)

	if (entry) {
		logger.debug({ address, requiredAmount, cached: true }, "Balance cache hit")
		return {
			sufficient: entry.sufficient,
			balance: entry.balance,
		}
	}

	logger.debug({ address, requiredAmount, cached: false }, "Balance cache miss")
	return null
}

/**
 * Store balance in cache
 */
export function setCachedBalance(
	address: string,
	requiredAmount: string,
	balance: string,
	sufficient: boolean,
): void {
	const key = getCacheKey(address, requiredAmount)
	balanceCache.set(key, {
		balance,
		sufficient,
		timestamp: Date.now(),
	})

	logger.debug({ address, requiredAmount, balance, sufficient }, "Balance cached")
}

/**
 * Invalidate cache for an address
 * Call this after successful settlement to ensure fresh balance check
 */
export function invalidateBalanceCache(address: string): void {
	// Remove all entries for this address
	const keys = Array.from(balanceCache.keys())
	const addressKeys = keys.filter((key) => key.startsWith(`${address}:`))

	for (const key of addressKeys) {
		balanceCache.delete(key)
	}

	logger.debug({ address, keysInvalidated: addressKeys.length }, "Balance cache invalidated")
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
	return {
		size: balanceCache.size,
		maxSize: balanceCache.max,
		ttl: 5000,
	}
}
