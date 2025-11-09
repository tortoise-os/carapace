/**
 * Cache Service - Simple in-memory cache with TTL
 * Can be extended to use Redis in production
 */

import Redis from "ioredis";
import { config } from "../config";

interface CacheEntry<T> {
	value: T;
	expiresAt: number;
}

export class CacheService {
	private memoryCache = new Map<string, CacheEntry<any>>();
	private redis: Redis | null = null;
	private useRedis = false;

	constructor() {
		// Try to connect to Redis
		this.initRedis();
	}

	private async initRedis() {
		try {
			this.redis = new Redis(config.redis.url, {
				maxRetriesPerRequest: 3,
				retryStrategy: (times: number) => {
					if (times > 3) {
						console.log("⚠️  Redis connection failed, using in-memory cache");
						return null;
					}
					return Math.min(times * 100, 2000);
				},
			});

			this.redis.on("connect", () => {
				console.log("✅ Redis connected");
				this.useRedis = true;
			});

			this.redis.on("error", (error) => {
				console.error("Redis error:", error.message);
				this.useRedis = false;
			});

			// Test connection
			await this.redis.ping();
		} catch (error) {
			console.log("⚠️  Redis not available, using in-memory cache");
			this.redis = null;
			this.useRedis = false;
		}
	}

	/**
	 * Get value from cache
	 */
	async get<T>(key: string): Promise<T | null> {
		// Try Redis first if available
		if (this.useRedis && this.redis) {
			try {
				const value = await this.redis.get(key);
				if (value) {
					return JSON.parse(value) as T;
				}
			} catch (error) {
				console.error("Redis get error:", error);
				// Fall back to memory cache
			}
		}

		// Fall back to memory cache
		const entry = this.memoryCache.get(key);
		if (!entry) return null;

		// Check if expired
		if (Date.now() > entry.expiresAt) {
			this.memoryCache.delete(key);
			return null;
		}

		return entry.value as T;
	}

	/**
	 * Set value in cache with TTL (in seconds)
	 */
	async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
		// Try Redis first if available
		if (this.useRedis && this.redis) {
			try {
				await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
			} catch (error) {
				console.error("Redis set error:", error);
				// Fall back to memory cache
			}
		}

		// Also set in memory cache as backup
		this.memoryCache.set(key, {
			value,
			expiresAt: Date.now() + ttlSeconds * 1000,
		});
	}

	/**
	 * Delete value from cache
	 */
	async delete(key: string): Promise<void> {
		if (this.useRedis && this.redis) {
			try {
				await this.redis.del(key);
			} catch (error) {
				console.error("Redis delete error:", error);
			}
		}

		this.memoryCache.delete(key);
	}

	/**
	 * Clear all cache
	 */
	async clear(): Promise<void> {
		if (this.useRedis && this.redis) {
			try {
				await this.redis.flushdb();
			} catch (error) {
				console.error("Redis clear error:", error);
			}
		}

		this.memoryCache.clear();
	}

	/**
	 * Get or set value (cache-aside pattern)
	 */
	async getOrSet<T>(
		key: string,
		factory: () => Promise<T>,
		ttlSeconds: number,
	): Promise<T> {
		// Try to get from cache
		const cached = await this.get<T>(key);
		if (cached !== null) {
			return cached;
		}

		// If not in cache, fetch and store
		const value = await factory();
		await this.set(key, value, ttlSeconds);
		return value;
	}

	/**
	 * Clean up expired entries from memory cache
	 */
	cleanup(): void {
		const now = Date.now();
		for (const [key, entry] of this.memoryCache.entries()) {
			if (now > entry.expiresAt) {
				this.memoryCache.delete(key);
			}
		}
	}

	/**
	 * Close connections
	 */
	async close(): Promise<void> {
		if (this.redis) {
			await this.redis.quit();
		}
	}
}

// Singleton instance
export const cacheService = new CacheService();

// Clean up memory cache every 5 minutes
setInterval(
	() => {
		cacheService.cleanup();
	},
	5 * 60 * 1000,
);
