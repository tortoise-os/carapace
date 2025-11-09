import type { SuiClient } from "@mysten/sui/client";
import { Elysia, t } from "elysia";

export interface Token {
	id: string;
	symbol: string;
	name: string;
	address: string;
	decimals: number;
	logoUrl?: string;
	verified: boolean;
	enabled: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface TokenListResponse {
	tokens: Token[];
	total: number;
}

export interface AddTokenRequest {
	symbol: string;
	name: string;
	address: string;
	decimals: number;
	logoUrl?: string;
}

// In-memory token list (will be replaced with database in production)
const tokens: Token[] = [
	{
		id: "sui",
		symbol: "SUI",
		name: "Sui",
		address: "0x2::sui::SUI",
		decimals: 9,
		logoUrl: "/tokens/sui.png",
		verified: true,
		enabled: true,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: "usdc",
		symbol: "USDC",
		name: "USD Coin",
		address: "0x5678::usdc::USDC",
		decimals: 6,
		logoUrl: "/tokens/usdc.png",
		verified: true,
		enabled: true,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: "usdt",
		symbol: "USDT",
		name: "Tether USD",
		address: "0x9abc::usdt::USDT",
		decimals: 6,
		logoUrl: "/tokens/usdt.png",
		verified: true,
		enabled: true,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: "weth",
		symbol: "WETH",
		name: "Wrapped Ethereum",
		address: "0xdef0::weth::WETH",
		decimals: 8,
		logoUrl: "/tokens/weth.png",
		verified: true,
		enabled: true,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
];

export const createTokensPlugin = (client: SuiClient) => {
	return (
		new Elysia({ prefix: "/tokens" })
			// GET /api/tokens - List all tokens
			.get(
				"/",
				async ({ query }): Promise<TokenListResponse> => {
					const { enabled, verified } = query;

					let filtered = [...tokens];

					// Filter by enabled status
					if (enabled !== undefined) {
						const isEnabled = enabled === "true";
						filtered = filtered.filter((t) => t.enabled === isEnabled);
					}

					// Filter by verified status
					if (verified !== undefined) {
						const isVerified = verified === "true";
						filtered = filtered.filter((t) => t.verified === isVerified);
					}

					return {
						tokens: filtered,
						total: filtered.length,
					};
				},
				{
					query: t.Object({
						enabled: t.Optional(t.String()),
						verified: t.Optional(t.String()),
					}),
				},
			)

			// GET /api/tokens/:id - Get token by ID
			.get("/:id", async ({ params }): Promise<Token | null> => {
				const token = tokens.find((t) => t.id === params.id);
				return token || null;
			})

			// GET /api/tokens/address/:address - Get token by address
			.get("/address/:address", async ({ params }): Promise<Token | null> => {
				const token = tokens.find((t) => t.address === params.address);
				return token || null;
			})

			// POST /api/tokens - Add new token
			.post(
				"/",
				async ({ body }): Promise<Token> => {
					const newToken: Token = {
						id: body.symbol.toLowerCase(),
						symbol: body.symbol.toUpperCase(),
						name: body.name,
						address: body.address,
						decimals: body.decimals,
						logoUrl: body.logoUrl,
						verified: false, // New tokens start unverified
						enabled: true,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					};

					// Check for duplicates
					const exists = tokens.find(
						(t) =>
							t.address === newToken.address || t.symbol === newToken.symbol,
					);
					if (exists) {
						throw new Error("Token already exists");
					}

					tokens.push(newToken);
					return newToken;
				},
				{
					body: t.Object({
						symbol: t.String(),
						name: t.String(),
						address: t.String(),
						decimals: t.Number(),
						logoUrl: t.Optional(t.String()),
					}),
				},
			)

			// PATCH /api/tokens/:id - Update token
			.patch(
				"/:id",
				async ({ params, body }): Promise<Token> => {
					const index = tokens.findIndex((t) => t.id === params.id);
					if (index === -1) {
						throw new Error("Token not found");
					}

					const updated: Token = {
						...tokens[index],
						...body,
						updatedAt: new Date().toISOString(),
					};

					tokens[index] = updated;
					return updated;
				},
				{
					body: t.Object({
						name: t.Optional(t.String()),
						logoUrl: t.Optional(t.String()),
						verified: t.Optional(t.Boolean()),
						enabled: t.Optional(t.Boolean()),
					}),
				},
			)

			// DELETE /api/tokens/:id - Delete token (soft delete by disabling)
			.delete("/:id", async ({ params }): Promise<{ success: boolean }> => {
				const index = tokens.findIndex((t) => t.id === params.id);
				if (index === -1) {
					throw new Error("Token not found");
				}

				// Soft delete by disabling
				tokens[index].enabled = false;
				tokens[index].updatedAt = new Date().toISOString();

				return { success: true };
			})
	);
};
