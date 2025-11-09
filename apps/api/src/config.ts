/**
 * API Configuration
 */

import type { Network } from "@carapace/sdk";
import { z } from "zod";

const envSchema = z.object({
	// Server
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	API_PORT: z.string().default("3001"),
	API_HOST: z.string().default("0.0.0.0"),

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

	// Redis
	REDIS_URL: z.string().default("redis://localhost:6379"),

	// Cache TTL (seconds)
	CACHE_TTL_POOLS: z.string().default("60"),
	CACHE_TTL_QUOTES: z.string().default("30"),

	// CORS
	CORS_ORIGIN: z.string().default("http://localhost:3000"),

	// Features
	ENABLE_INDEXER: z.string().default("true"),
});

export const env = envSchema.parse(process.env);

export const config = {
	server: {
		port: parseInt(env.API_PORT),
		host: env.API_HOST,
		env: env.NODE_ENV,
	},
	sui: {
		network: env.SUI_NETWORK as Network,
		rpcUrl: env.SUI_RPC_URL,
		packageIds: {
			carapace: env.SUI_AMM_PACKAGE_ID || "0x0",
		},
	},
	database: {
		url: env.DATABASE_URL,
	},
	redis: {
		url: env.REDIS_URL,
	},
	cache: {
		pools: parseInt(env.CACHE_TTL_POOLS),
		quotes: parseInt(env.CACHE_TTL_QUOTES),
	},
	cors: {
		origin: env.CORS_ORIGIN.split(","),
		credentials: true,
	},
	features: {
		indexer: env.ENABLE_INDEXER === "true",
	},
};
