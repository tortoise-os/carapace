/**
 * Rate limiting middleware for x402 facilitator
 *
 * Implements sliding window rate limiting per IP address
 */

import type { Context } from 'elysia';
import { config } from '../config';
import { logger } from '../services/logger';

interface RateLimitEntry {
	count: number;
	resetAt: number;
}

// Store rate limit data in memory
// In production, use Redis for distributed rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every minute
setInterval(() => {
	const now = Date.now();
	for (const [key, entry] of rateLimitStore.entries()) {
		if (now > entry.resetAt) {
			rateLimitStore.delete(key);
		}
	}
}, 60000);

/**
 * Get client IP address from request
 */
function getClientIp(request: Request): string {
	// Check common headers for real IP (when behind proxy/CDN)
	const forwardedFor = request.headers.get('x-forwarded-for');
	if (forwardedFor) {
		return forwardedFor.split(',')[0].trim();
	}

	const realIp = request.headers.get('x-real-ip');
	if (realIp) {
		return realIp;
	}

	const cfConnectingIp = request.headers.get('cf-connecting-ip');
	if (cfConnectingIp) {
		return cfConnectingIp;
	}

	// Fallback to localhost for development
	return 'localhost';
}

/**
 * Check if request should be rate limited
 */
export function checkRateLimit(
	context: Context,
): { allowed: boolean; remaining: number; resetAt: number } {
	const ip = getClientIp(context.request);
	const now = Date.now();
	const windowMs = config.rateLimitWindowMs;
	const maxRequests = config.rateLimitMaxRequests;

	let entry = rateLimitStore.get(ip);

	// Create new entry if doesn't exist or window expired
	if (!entry || now > entry.resetAt) {
		entry = {
			count: 0,
			resetAt: now + windowMs,
		};
		rateLimitStore.set(ip, entry);
	}

	// Increment counter
	entry.count += 1;

	const allowed = entry.count <= maxRequests;
	const remaining = Math.max(0, maxRequests - entry.count);

	if (!allowed) {
		logger.warn(
			{
				ip,
				count: entry.count,
				limit: maxRequests,
				path: new URL(context.request.url).pathname,
			},
			'Rate limit exceeded',
		);
	}

	return {
		allowed,
		remaining,
		resetAt: entry.resetAt,
	};
}

/**
 * Apply rate limiting to request
 * Returns true if request should be blocked
 */
export function rateLimitMiddleware(context: Context): boolean {
	const { allowed, remaining, resetAt } = checkRateLimit(context);

	// Add rate limit headers
	context.set.headers['X-RateLimit-Limit'] = config.rateLimitMaxRequests.toString();
	context.set.headers['X-RateLimit-Remaining'] = remaining.toString();
	context.set.headers['X-RateLimit-Reset'] = resetAt.toString();

	if (!allowed) {
		context.set.status = 429;
		return true; // Block request
	}

	return false; // Allow request
}
