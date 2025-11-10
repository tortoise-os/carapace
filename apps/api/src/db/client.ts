/**
 * Database Client
 */

import postgres from "postgres"
import { config } from "../config"

export const sql = postgres(config.database.url, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

// Test connection
export async function testConnection() {
  try {
    await sql`SELECT 1`
    console.log("✅ Database connected")
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    return false
  }
}

// Pool queries
export const poolQueries = {
  async create(pool: {
    pool_id: string
    token_x: string
    token_y: string
    reserve_x: string
    reserve_y: string
    lp_supply: string
    fee_rate: number
    protocol_fee: number
  }) {
    return sql`
      INSERT INTO amm.pools (pool_id, token_x, token_y, reserve_x, reserve_y, lp_supply, fee_rate, protocol_fee)
      VALUES (${pool.pool_id}, ${pool.token_x}, ${pool.token_y}, ${pool.reserve_x}, ${pool.reserve_y}, ${pool.lp_supply}, ${pool.fee_rate}, ${pool.protocol_fee})
      ON CONFLICT (pool_id) DO UPDATE SET
        reserve_x = EXCLUDED.reserve_x,
        reserve_y = EXCLUDED.reserve_y,
        lp_supply = EXCLUDED.lp_supply,
        updated_at = NOW()
      RETURNING *
    `
  },

  async getById(poolId: string) {
    const [pool] = await sql`
      SELECT * FROM amm.pools WHERE pool_id = ${poolId}
    `
    return pool
  },

  async getAll(limit = 100, offset = 0) {
    return sql`
      SELECT * FROM amm.pools
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
  },

  async update(
    poolId: string,
    data: Partial<{
      reserve_x: string
      reserve_y: string
      lp_supply: string
    }>
  ) {
    const updates: string[] = []
    const values: string[] = []

    if (data.reserve_x) {
      updates.push(`reserve_x = $${values.length + 1}`)
      values.push(data.reserve_x)
    }
    if (data.reserve_y) {
      updates.push(`reserve_y = $${values.length + 1}`)
      values.push(data.reserve_y)
    }
    if (data.lp_supply) {
      updates.push(`lp_supply = $${values.length + 1}`)
      values.push(data.lp_supply)
    }

    if (updates.length === 0) return null

    return sql`
      UPDATE amm.pools
      SET ${sql(Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v])))},
          updated_at = NOW()
      WHERE pool_id = ${poolId}
      RETURNING *
    `
  },
}

// Swap queries
export const swapQueries = {
  async create(swap: {
    pool_id: string
    sender: string
    token_in: string
    token_out: string
    amount_in: string
    amount_out: string
    fee_amount: string
    tx_digest: string
    block_number: string
    timestamp: Date
  }) {
    return sql`
      INSERT INTO amm.swaps ${sql(swap)}
      RETURNING *
    `
  },

  async getByPool(poolId: string, limit = 100) {
    return sql`
      SELECT * FROM amm.swaps
      WHERE pool_id = ${poolId}
      ORDER BY timestamp DESC
      LIMIT ${limit}
    `
  },

  async getRecent(limit = 100) {
    return sql`
      SELECT * FROM amm.swaps
      ORDER BY timestamp DESC
      LIMIT ${limit}
    `
  },
}
