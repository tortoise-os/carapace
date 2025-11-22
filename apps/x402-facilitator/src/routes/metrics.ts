/**
 * Prometheus metrics endpoint for production monitoring
 */

import { Elysia } from "elysia"
import { Counter, Gauge, Histogram, register } from "prom-client"

// HTTP request metrics
export const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "path", "status"],
})

export const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "path"],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
})

// Payment-specific metrics
export const paymentsVerified = new Counter({
  name: "x402_payments_verified_total",
  help: "Total payments verified",
  labelNames: ["valid", "reason"],
})

export const paymentsSettled = new Counter({
  name: "x402_payments_settled_total",
  help: "Total payments settled",
  labelNames: ["success", "network"],
})

export const settlementDuration = new Histogram({
  name: "x402_settlement_duration_seconds",
  help: "Payment settlement duration in seconds",
  buckets: [0.5, 1, 2, 5, 10, 30],
})

// Wallet metrics
export const facilitatorBalance = new Gauge({
  name: "x402_facilitator_balance_sui",
  help: "Facilitator wallet balance in SUI",
})

// Circuit breaker metrics
export const circuitBreakerState = new Gauge({
  name: "x402_circuit_breaker_state",
  help: "Circuit breaker state (0=closed, 1=open, 2=half-open)",
})

// Rate limit metrics
export const rateLimitHits = new Counter({
  name: "x402_rate_limit_hits_total",
  help: "Total rate limit hits",
  labelNames: ["ip"],
})

/**
 * Metrics route
 */
export const metricsRoute = new Elysia().get("/metrics", async () => {
  return new Response(await register.metrics(), {
    headers: {
      "Content-Type": register.contentType,
    },
  })
})

/**
 * Record HTTP request metrics
 */
export function recordHttpRequest(method: string, path: string, status: number, durationSeconds: number) {
  httpRequestsTotal.inc({ method, path, status })
  httpRequestDuration.observe({ method, path }, durationSeconds)
}

/**
 * Record payment verification
 */
export function recordPaymentVerification(valid: boolean, reason?: string) {
  paymentsVerified.inc({ valid: valid.toString(), reason: reason || "success" })
}

/**
 * Record payment settlement
 */
export function recordPaymentSettlement(success: boolean, network: string, durationSeconds?: number) {
  paymentsSettled.inc({ success: success.toString(), network })
  if (durationSeconds) {
    settlementDuration.observe(durationSeconds)
  }
}

/**
 * Update facilitator balance
 */
export function updateFacilitatorBalance(balanceSUI: number) {
  facilitatorBalance.set(balanceSUI)
}

/**
 * Update circuit breaker state
 */
export function updateCircuitBreakerState(state: "closed" | "open" | "half-open") {
  const stateValue = state === "closed" ? 0 : state === "open" ? 1 : 2
  circuitBreakerState.set(stateValue)
}

/**
 * Record rate limit hit
 */
export function recordRateLimitHit(ip: string) {
  rateLimitHits.inc({ ip })
}
