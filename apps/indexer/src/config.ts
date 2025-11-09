/**
 * Indexer Configuration
 */

import type { Network } from "@carapace/sdk";
import { z } from "zod";

const envSchema = z.object({
	// Sui
	SUI_NETWORK: z
		.enum(["mainnet", "testnet", "devnet", "localnet"])
		.default("testnet"),
	SUI_RPC_URL: z.string().optional(),
	SUI_AMM_PACKAGE_ID: z.string().optional(),

	// Database
	DATABASE_URL: z
		.string()
		.default(
			"postgresql://carapace:carapace_dev_password@localhost:5432/carapace",
		),

	// Indexer
	INDEXER_START_CHECKPOINT: z.string().default("0"),
	INDEXER_BATCH_SIZE: z.string().default("100"),
	INDEXER_POLL_INTERVAL: z.string().default("1000"),
});

export const env = envSchema.parse(process.env);

export const config = {
	sui: {
		network: env.SUI_NETWORK as Network,
		rpcUrl: env.SUI_RPC_URL,
		packageId: env.SUI_AMM_PACKAGE_ID || "0x0",
	},
	database: {
		url: env.DATABASE_URL,
	},
	indexer: {
		startCheckpoint: BigInt(env.INDEXER_START_CHECKPOINT),
		batchSize: parseInt(env.INDEXER_BATCH_SIZE),
		pollInterval: parseInt(env.INDEXER_POLL_INTERVAL),
	},
};
