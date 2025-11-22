/**
 * GET /supported - Return supported schemes and networks
 */

import type { SupportedOptions } from "@carapace/x402-types"
import { Elysia } from "elysia"
import { config } from "../config"

export const supportedRoute = new Elysia().get("/supported", (): SupportedOptions => {
  return {
    schemes: ["exact"],
    networks: config.networks,
  }
})
