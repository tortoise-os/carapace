/**
 * Blockchain Service - Fetch real data from Sui blockchain
 */

import type { CarapaceSDK } from "@carapace/sdk"
import { config } from "../config"

export interface PoolData {
  pool_id: string
  token_x: string
  token_y: string
  reserve_x: string
  reserve_y: string
  lp_supply: string
  fee_rate: number
  protocol_fee: number
  protocol_fee_x: string
  protocol_fee_y: string
  created_at: string
  updated_at: string
}

export interface SwapQuoteData {
  amountIn: string
  amountOut: string
  priceImpact: number
  fee: string
  route: string[]
}

export class BlockchainService {
  private knownPoolIds: Set<string> = new Set()

  constructor(
    private sdk: CarapaceSDK,
    poolIds?: string[]
  ) {
    // Load known pool from config (from DEPLOYMENT.md)
    const knownPool = "0x6828cc09b4466dd7753a457aaa8a328f32e189729b178ce38252a03ab8190951"
    this.knownPoolIds.add(knownPool)

    // Add any additional pool IDs
    if (poolIds) {
      for (const id of poolIds) {
        this.knownPoolIds.add(id)
      }
    }
  }

  /**
   * Add a known pool ID to track
   */
  addKnownPool(poolId: string): void {
    this.knownPoolIds.add(poolId)
  }

  /**
   * Set pool IDs from discovery service
   */
  setKnownPools(poolIds: string[]): void {
    // biome-ignore lint/suspicious/useIterableCallbackReturn: forEach used for side effects, not return value
    poolIds.forEach((id) => this.knownPoolIds.add(id))
  }

  /**
   * Get all known pools from blockchain
   */
  async getAllPools(): Promise<PoolData[]> {
    const pools: PoolData[] = []

    for (const poolId of this.knownPoolIds) {
      try {
        const poolData = await this.getPool(poolId)
        if (poolData) {
          pools.push(poolData)
        }
      } catch (error) {
        console.error(`Error fetching pool ${poolId}:`, error)
        // Continue fetching other pools
      }
    }

    return pools
  }

  /**
   * Get pool data by ID from blockchain
   */
  async getPool(poolId: string): Promise<PoolData | null> {
    try {
      const pool = await this.sdk.pool.getPool(poolId)

      return {
        pool_id: poolId,
        token_x: pool.tokenX as string,
        token_y: pool.tokenY as string,
        reserve_x: pool.reserveX.toString(),
        reserve_y: pool.reserveY.toString(),
        lp_supply: pool.lpSupply.toString(),
        fee_rate: pool.feeBps,
        protocol_fee: pool.protocolFeeBps,
        protocol_fee_x: pool.protocolFeeX.toString(),
        protocol_fee_y: pool.protocolFeeY.toString(),
        // Note: Creation time not stored on-chain, would need indexer
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    // biome-ignore lint/suspicious/noExplicitAny: Error type from Sui SDK is unknown
    } catch (error: any) {
      console.error(`Error fetching pool ${poolId}:`, error.message)
      return null
    }
  }

  /**
   * Get swap quote from blockchain
   */
  async getSwapQuote(
    poolId: string,
    amountIn: bigint,
    isXToY: boolean
  ): Promise<SwapQuoteData | null> {
    try {
      const quote = await this.sdk.pool.getSwapQuote(poolId, amountIn, isXToY)

      return {
        amountIn: quote.amountIn.toString(),
        amountOut: quote.amountOut.toString(),
        priceImpact: quote.priceImpact,
        fee: quote.fee.toString(),
        route: quote.route,
      }
    // biome-ignore lint/suspicious/noExplicitAny: Error type from Sui SDK is unknown
    } catch (error: any) {
      console.error(`Error getting swap quote for pool ${poolId}:`, error.message)
      return null
    }
  }

  /**
   * Get spot price from blockchain
   */
  async getSpotPrice(poolId: string): Promise<number | null> {
    try {
      const price = await this.sdk.pool.getSpotPrice(poolId)
      return price
    // biome-ignore lint/suspicious/noExplicitAny: Error type from Sui SDK is unknown
    } catch (error: any) {
      console.error(`Error getting spot price for pool ${poolId}:`, error.message)
      return null
    }
  }

  /**
   * Discover pools by scanning for Pool objects
   * Note: This is a simple implementation. For production, use an indexer.
   */
  async discoverPools(limit: number = 10): Promise<string[]> {
    try {
      // Query for Pool objects created by our package
      const response = await this.sdk.client.queryEvents({
        query: {
          MoveEventType: `${config.sui.packageIds.carapace}::pool::PoolCreated`,
        },
        limit,
      })

      const poolIds: string[] = []
      for (const event of response.data) {
        // biome-ignore lint/suspicious/noExplicitAny: Event JSON structure from Sui is dynamic
        const poolId = (event.parsedJson as any)?.pool_id
        if (poolId && typeof poolId === "string") {
          poolIds.push(poolId)
          this.addKnownPool(poolId)
        }
      }

      return poolIds
    // biome-ignore lint/suspicious/noExplicitAny: Error type from Sui SDK is unknown
    } catch (error: any) {
      console.error("Error discovering pools:", error.message)
      return []
    }
  }

  /**
   * Check if pool exists on blockchain
   */
  async poolExists(poolId: string): Promise<boolean> {
    try {
      const pool = await this.getPool(poolId)
      return pool !== null
    } catch {
      return false
    }
  }
}
