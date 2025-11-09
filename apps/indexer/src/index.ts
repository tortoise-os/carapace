/**
 * Carapace Event Indexer
 *
 * Listens to Sui blockchain events and indexes pool/swap data into PostgreSQL
 */

import { SuiClient, type SuiEvent } from "@mysten/sui/client";
import { config } from "./config";
import {
	checkpointQueries,
	poolQueries,
	swapQueries,
	testConnection,
} from "./db";

const client = new SuiClient({
	url: config.sui.rpcUrl || "https://fullnode.testnet.sui.io",
});

interface PoolCreatedEvent {
	pool_id: string;
	token_x: string;
	token_y: string;
	creator: string;
}

interface SwapEvent {
	pool_id: string;
	sender: string;
	token_in: string;
	token_out: string;
	amount_in: string;
	amount_out: string;
	fee_amount: string;
}

interface LiquidityEvent {
	pool_id: string;
	provider: string;
	amount_x: string;
	amount_y: string;
	lp_tokens: string;
}

class EventIndexer {
	private isRunning = false;
	private currentCheckpoint: bigint = 0n;

	async start() {
		console.log("🐢 Carapace Event Indexer");
		console.log(`Network: ${config.sui.network}`);
		console.log(`Package ID: ${config.sui.packageId}`);

		// Test database connection
		const connected = await testConnection();
		if (!connected) {
			console.error("Failed to connect to database");
			process.exit(1);
		}

		// Get last indexed checkpoint
		this.currentCheckpoint = await checkpointQueries.getLatest();
		if (this.currentCheckpoint === 0n) {
			this.currentCheckpoint = config.indexer.startCheckpoint;
		}

		console.log(`Starting from checkpoint: ${this.currentCheckpoint}`);

		this.isRunning = true;
		await this.indexLoop();
	}

	async stop() {
		this.isRunning = false;
		console.log("Indexer stopped");
	}

	private async indexLoop() {
		while (this.isRunning) {
			try {
				await this.processEvents();
				await new Promise((resolve) =>
					setTimeout(resolve, config.indexer.pollInterval),
				);
			} catch (error) {
				console.error("Error in index loop:", error);
				await new Promise((resolve) => setTimeout(resolve, 5000));
			}
		}
	}

	private async processEvents() {
		// Query events from the package
		const events = await client.queryEvents({
			query: {
				MoveEventModule: {
					package: config.sui.packageId,
					module: "pool",
				},
			},
			limit: config.indexer.batchSize,
		});

		if (events.data.length === 0) {
			return;
		}

		console.log(`Processing ${events.data.length} events...`);

		for (const event of events.data) {
			await this.handleEvent(event);
		}

		// Update checkpoint
		if (events.nextCursor) {
			await checkpointQueries.update(this.currentCheckpoint++);
		}
	}

	private async handleEvent(event: SuiEvent) {
		const eventType = event.type.split("::").pop();

		try {
			switch (eventType) {
				case "PoolCreated":
					await this.handlePoolCreated(event);
					break;
				case "Swap":
					await this.handleSwap(event);
					break;
				case "LiquidityAdded":
					await this.handleLiquidityAdded(event);
					break;
				case "LiquidityRemoved":
					await this.handleLiquidityRemoved(event);
					break;
				default:
					console.log(`Unknown event type: ${eventType}`);
			}
		} catch (error) {
			console.error(`Error handling event ${eventType}:`, error);
		}
	}

	private async handlePoolCreated(event: SuiEvent) {
		const data = event.parsedJson as PoolCreatedEvent;

		console.log(`Pool created: ${data.pool_id}`);

		// Fetch pool details from chain
		const pool = await client.getObject({
			id: data.pool_id,
			options: {
				showContent: true,
			},
		});

		if (!pool.data || pool.data.content?.dataType !== "moveObject") {
			console.error("Failed to fetch pool data");
			return;
		}

		const fields = pool.data.content.fields as any;

		await poolQueries.upsert({
			pool_id: data.pool_id,
			token_x: data.token_x,
			token_y: data.token_y,
			reserve_x: fields.reserve_x || "0",
			reserve_y: fields.reserve_y || "0",
			lp_supply: fields.lp_supply?.fields?.value || "0",
			fee_rate: parseInt(fields.fee_bps || "30"),
			protocol_fee: parseInt(fields.protocol_fee_bps || "0"),
		});
	}

	private async handleSwap(event: SuiEvent) {
		const data = event.parsedJson as SwapEvent;

		console.log(
			`Swap in pool ${data.pool_id}: ${data.amount_in} → ${data.amount_out}`,
		);

		await swapQueries.create({
			pool_id: data.pool_id,
			sender: data.sender,
			token_in: data.token_in,
			token_out: data.token_out,
			amount_in: data.amount_in,
			amount_out: data.amount_out,
			fee_amount: data.fee_amount,
			tx_digest: event.id.txDigest,
			block_number: event.id.eventSeq.toString(),
			timestamp: new Date(parseInt(event.timestampMs || "0")),
		});

		// Update pool reserves
		const pool = await client.getObject({
			id: data.pool_id,
			options: {
				showContent: true,
			},
		});

		if (pool.data && pool.data.content?.dataType === "moveObject") {
			const fields = pool.data.content.fields as any;

			await poolQueries.upsert({
				pool_id: data.pool_id,
				token_x: data.token_in,
				token_y: data.token_out,
				reserve_x: fields.reserve_x || "0",
				reserve_y: fields.reserve_y || "0",
				lp_supply: fields.lp_supply?.fields?.value || "0",
				fee_rate: parseInt(fields.fee_bps || "30"),
				protocol_fee: parseInt(fields.protocol_fee_bps || "0"),
			});
		}
	}

	private async handleLiquidityAdded(event: SuiEvent) {
		const data = event.parsedJson as LiquidityEvent;
		console.log(
			`Liquidity added to pool ${data.pool_id}: ${data.lp_tokens} LP`,
		);

		// Update pool state
		const pool = await client.getObject({
			id: data.pool_id,
			options: {
				showContent: true,
			},
		});

		if (pool.data && pool.data.content?.dataType === "moveObject") {
			const fields = pool.data.content.fields as any;

			await poolQueries.upsert({
				pool_id: data.pool_id,
				token_x: fields.token_x || "",
				token_y: fields.token_y || "",
				reserve_x: fields.reserve_x || "0",
				reserve_y: fields.reserve_y || "0",
				lp_supply: fields.lp_supply?.fields?.value || "0",
				fee_rate: parseInt(fields.fee_bps || "30"),
				protocol_fee: parseInt(fields.protocol_fee_bps || "0"),
			});
		}
	}

	private async handleLiquidityRemoved(event: SuiEvent) {
		const data = event.parsedJson as LiquidityEvent;
		console.log(
			`Liquidity removed from pool ${data.pool_id}: ${data.lp_tokens} LP`,
		);

		// Update pool state (similar to liquidity added)
		const pool = await client.getObject({
			id: data.pool_id,
			options: {
				showContent: true,
			},
		});

		if (pool.data && pool.data.content?.dataType === "moveObject") {
			const fields = pool.data.content.fields as any;

			await poolQueries.upsert({
				pool_id: data.pool_id,
				token_x: fields.token_x || "",
				token_y: fields.token_y || "",
				reserve_x: fields.reserve_x || "0",
				reserve_y: fields.reserve_y || "0",
				lp_supply: fields.lp_supply?.fields?.value || "0",
				fee_rate: parseInt(fields.fee_bps || "30"),
				protocol_fee: parseInt(fields.protocol_fee_bps || "0"),
			});
		}
	}
}

// Start indexer
const indexer = new EventIndexer();

// Handle graceful shutdown
process.on("SIGINT", async () => {
	console.log("\nShutting down...");
	await indexer.stop();
	process.exit(0);
});

process.on("SIGTERM", async () => {
	console.log("\nShutting down...");
	await indexer.stop();
	process.exit(0);
});

// Start
indexer.start().catch((error) => {
	console.error("Failed to start indexer:", error);
	process.exit(1);
});
