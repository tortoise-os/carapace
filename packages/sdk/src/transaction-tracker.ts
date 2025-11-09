/**
 * Transaction Tracker - Track and monitor transaction status
 */

import type {
	SuiClient,
	SuiTransactionBlockResponse,
} from "@mysten/sui/client";

// ============================================================================
// Types
// ============================================================================

export type TransactionStatus = "pending" | "success" | "failure" | "timeout";

export interface TrackedTransaction {
	/** Transaction digest */
	digest: string;
	/** Current status */
	status: TransactionStatus;
	/** Timestamp when transaction was submitted */
	submittedAt: number;
	/** Timestamp when transaction was confirmed/failed */
	confirmedAt?: number;
	/** Transaction response (when confirmed) */
	response?: SuiTransactionBlockResponse;
	/** Error message (if failed) */
	error?: string;
	/** User-defined metadata */
	metadata?: Record<string, any>;
}

export interface TransactionWaitOptions {
	/** Timeout in milliseconds (default: 30000) */
	timeout?: number;
	/** Poll interval in milliseconds (default: 1000) */
	pollInterval?: number;
	/** Show transaction details on success (default: true) */
	showDetails?: boolean;
}

// ============================================================================
// Transaction Tracker Class
// ============================================================================

export class TransactionTracker {
	private trackedTransactions = new Map<string, TrackedTransaction>();

	constructor(private client: SuiClient) {}

	/**
	 * Track a new transaction
	 */
	track(digest: string, metadata?: Record<string, any>): TrackedTransaction {
		const tracked: TrackedTransaction = {
			digest,
			status: "pending",
			submittedAt: Date.now(),
			metadata,
		};

		this.trackedTransactions.set(digest, tracked);
		return tracked;
	}

	/**
	 * Wait for transaction to be confirmed
	 */
	async waitForTransaction(
		digest: string,
		options?: TransactionWaitOptions,
	): Promise<SuiTransactionBlockResponse> {
		const timeout = options?.timeout || 30000;
		const pollInterval = options?.pollInterval || 1000;
		const showDetails = options?.showDetails !== false;

		const tracked = this.trackedTransactions.get(digest) || this.track(digest);
		const startTime = Date.now();

		while (Date.now() - startTime < timeout) {
			try {
				const response = await this.client.waitForTransaction({
					digest,
					options: {
						showEffects: true,
						showEvents: true,
						showObjectChanges: showDetails,
						showBalanceChanges: showDetails,
					},
				});

				// Update tracked transaction
				tracked.status =
					response.effects?.status?.status === "success"
						? "success"
						: "failure";
				tracked.confirmedAt = Date.now();
				tracked.response = response;

				if (tracked.status === "failure") {
					tracked.error =
						response.effects?.status?.error || "Transaction failed";
				}

				this.trackedTransactions.set(digest, tracked);

				return response;
			} catch (error: any) {
				// If transaction not found yet, continue polling
				if (error.message?.includes("not found")) {
					await new Promise((resolve) => setTimeout(resolve, pollInterval));
					continue;
				}

				// Other errors - mark as failed
				tracked.status = "failure";
				tracked.confirmedAt = Date.now();
				tracked.error = error.message || "Unknown error";
				this.trackedTransactions.set(digest, tracked);

				throw error;
			}
		}

		// Timeout
		tracked.status = "timeout";
		tracked.error = `Transaction timed out after ${timeout}ms`;
		this.trackedTransactions.set(digest, tracked);

		throw new Error(tracked.error);
	}

	/**
	 * Get transaction status
	 */
	async getStatus(digest: string): Promise<TransactionStatus> {
		const tracked = this.trackedTransactions.get(digest);
		if (tracked && tracked.status !== "pending") {
			return tracked.status;
		}

		try {
			const response = await this.client.getTransactionBlock({
				digest,
				options: { showEffects: true },
			});

			const status =
				response.effects?.status?.status === "success" ? "success" : "failure";

			if (tracked) {
				tracked.status = status;
				tracked.confirmedAt = Date.now();
				tracked.response = response;
				this.trackedTransactions.set(digest, tracked);
			}

			return status;
		} catch (error) {
			return "pending";
		}
	}

	/**
	 * Get tracked transaction details
	 */
	getTracked(digest: string): TrackedTransaction | undefined {
		return this.trackedTransactions.get(digest);
	}

	/**
	 * Get all tracked transactions
	 */
	getAllTracked(): TrackedTransaction[] {
		return Array.from(this.trackedTransactions.values());
	}

	/**
	 * Get pending transactions
	 */
	getPending(): TrackedTransaction[] {
		return this.getAllTracked().filter((tx) => tx.status === "pending");
	}

	/**
	 * Clear old tracked transactions
	 */
	clearOld(maxAge: number = 3600000): void {
		const now = Date.now();
		for (const [digest, tx] of this.trackedTransactions.entries()) {
			if (now - tx.submittedAt > maxAge) {
				this.trackedTransactions.delete(digest);
			}
		}
	}

	/**
	 * Get transaction details with retry
	 */
	async getTransactionWithRetry(
		digest: string,
		maxRetries: number = 3,
	): Promise<SuiTransactionBlockResponse> {
		let lastError: Error | null = null;

		for (let i = 0; i < maxRetries; i++) {
			try {
				return await this.client.getTransactionBlock({
					digest,
					options: {
						showEffects: true,
						showEvents: true,
						showObjectChanges: true,
						showBalanceChanges: true,
					},
				});
			} catch (error: any) {
				lastError = error;
				if (i < maxRetries - 1) {
					await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
				}
			}
		}

		throw lastError || new Error("Failed to get transaction after retries");
	}

	/**
	 * Extract gas cost from transaction
	 */
	extractGasCost(
		response: SuiTransactionBlockResponse,
	): { total: bigint; computation: bigint; storage: bigint } | null {
		const gasUsed = response.effects?.gasUsed;
		if (!gasUsed) return null;

		return {
			total:
				BigInt(gasUsed.computationCost) +
				BigInt(gasUsed.storageCost) -
				BigInt(gasUsed.storageRebate),
			computation: BigInt(gasUsed.computationCost),
			storage: BigInt(gasUsed.storageCost),
		};
	}

	/**
	 * Check if transaction succeeded
	 */
	isSuccess(response: SuiTransactionBlockResponse): boolean {
		return response.effects?.status?.status === "success";
	}

	/**
	 * Get error message from failed transaction
	 */
	getErrorMessage(response: SuiTransactionBlockResponse): string | null {
		if (this.isSuccess(response)) return null;
		return response.effects?.status?.error || "Transaction failed";
	}
}
