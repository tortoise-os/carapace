/**
 * Carapace Strategy SDK
 * Advanced strategy tools for flash loans, arbitrage, and leverage
 */

import type { SuiClient } from "@mysten/sui/client";
import { FlashLoanBuilder } from "./builders/flash-loan-builder";
import { FlashLoanClient } from "./clients/flash-loan-client";

/**
 * Main Strategy SDK class
 */
export class StrategySDK {
	public client: SuiClient;
	public flashLoan: FlashLoanClient;
	public flashLoanBuilder: FlashLoanBuilder;

	constructor(client: SuiClient, packageId: string) {
		this.client = client;
		this.flashLoan = new FlashLoanClient(client, packageId);
		this.flashLoanBuilder = new FlashLoanBuilder(packageId);
	}
}

// Export builders
export { FlashLoanBuilder } from "./builders/flash-loan-builder";

// Export clients
export { FlashLoanClient } from "./clients/flash-loan-client";
// Export all types
export * from "./types";

// Export utilities
export * from "./utils/calculations";
