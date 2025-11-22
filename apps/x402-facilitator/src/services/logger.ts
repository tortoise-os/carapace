/**
 * Structured logging service using pino
 */

import pino from "pino"

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  formatters: {
    level: (label) => {
      return { level: label }
    },
  },
  redact: {
    paths: ["facilitatorPrivateKey", "*.privateKey", "*.signature", "req.headers.authorization"],
    remove: true,
  },
})
