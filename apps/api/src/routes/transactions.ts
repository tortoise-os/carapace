/**
 * Transaction History Routes
 */

import type { CarapaceSDK } from "@carapace/sdk";
import { type Elysia, t } from "elysia";
import { TransactionHistoryService } from "../services/transaction-history";

export const createTransactionPlugin = (app: Elysia) =>
	app.group("/transactions", (app) =>
		app
			// Get transaction history for an address
			.get(
				"/history/:address",
				async ({ params, query, sdk }) => {
					const { address } = params;
					const { limit, cursor, poolId, type } = query;

					const service = new TransactionHistoryService(
						(sdk as CarapaceSDK).client,
						(sdk as CarapaceSDK).packageId,
					);

					const result = await service.getTransactionHistory(address, {
						limit: limit ? parseInt(limit) : undefined,
						cursor,
						poolId,
						type,
					});

					return {
						success: true,
						data: result,
					};
				},
				{
					params: t.Object({
						address: t.String(),
					}),
					query: t.Object({
						limit: t.Optional(t.String()),
						cursor: t.Optional(t.String()),
						poolId: t.Optional(t.String()),
						type: t.Optional(t.String()),
					}),
				},
			)

			// Get transaction history for a pool
			.get(
				"/pool/:poolId",
				async ({ params, query, sdk }) => {
					const { poolId } = params;
					const { limit, cursor } = query;

					const service = new TransactionHistoryService(
						(sdk as CarapaceSDK).client,
						(sdk as CarapaceSDK).packageId,
					);

					const result = await service.getPoolTransactionHistory(poolId, {
						limit: limit ? parseInt(limit) : undefined,
						cursor,
					});

					return {
						success: true,
						data: result,
					};
				},
				{
					params: t.Object({
						poolId: t.String(),
					}),
					query: t.Object({
						limit: t.Optional(t.String()),
						cursor: t.Optional(t.String()),
					}),
				},
			)

			// Get transaction details by digest
			.get(
				"/:digest",
				async ({ params, sdk }) => {
					const { digest } = params;

					const txData = await (sdk as CarapaceSDK).client.getTransactionBlock({
						digest,
						options: {
							showEffects: true,
							showEvents: true,
							showInput: true,
							showObjectChanges: true,
						},
					});

					return {
						success: true,
						data: txData,
					};
				},
				{
					params: t.Object({
						digest: t.String(),
					}),
				},
			),
	);
