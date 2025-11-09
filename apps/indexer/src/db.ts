/**
 * Database Client
 */

import postgres from "postgres";
import { config } from "./config";

export const sql = postgres(config.database.url, {
	max: 10,
	idle_timeout: 20,
	connect_timeout: 10,
});

// Test connection
export async function testConnection() {
	try {
		await sql`SELECT 1`;
		console.log("✅ Database connected");
		return true;
	} catch (error) {
		console.error("❌ Database connection failed:", error);
		return false;
	}
}

// Pool operations
export const poolQueries = {
	async upsert(pool: {
		pool_id: string;
		token_x: string;
		token_y: string;
		reserve_x: string;
		reserve_y: string;
		lp_supply: string;
		fee_rate: number;
		protocol_fee: number;
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
    `;
	},
};

// Swap operations
export const swapQueries = {
	async create(swap: {
		pool_id: string;
		sender: string;
		token_in: string;
		token_out: string;
		amount_in: string;
		amount_out: string;
		fee_amount: string;
		tx_digest: string;
		block_number: string;
		timestamp: Date;
	}) {
		return sql`
      INSERT INTO amm.swaps ${sql(swap)}
      RETURNING *
    `;
	},
};

// Checkpoint tracking
export const checkpointQueries = {
	async getLatest() {
		const [checkpoint] = await sql`
      SELECT checkpoint FROM indexer.checkpoints
      ORDER BY checkpoint DESC
      LIMIT 1
    `;
		return checkpoint ? BigInt(checkpoint.checkpoint) : 0n;
	},

	async update(checkpoint: bigint) {
		return sql`
      INSERT INTO indexer.checkpoints (checkpoint, indexed_at)
      VALUES (${checkpoint.toString()}, NOW())
      ON CONFLICT (checkpoint) DO UPDATE SET
        indexed_at = NOW()
    `;
	},
};
