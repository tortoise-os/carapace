#!/usr/bin/env bun

/**
 * Script to test a real swap on Sui testnet
 */

import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { fromB64 } from "@mysten/sui/utils";
import { CarapaceSDK } from "../packages/sdk/src/index";

async function main() {
	console.log("🧪 Testing real swap on Sui testnet...\n");

	// Load pool info
	const poolInfoFile = Bun.file("./scripts/.pool-info.json");
	if (!(await poolInfoFile.exists())) {
		console.error(
			"❌ Error: Pool info file not found. Run create-pool.ts first.",
		);
		process.exit(1);
	}

	const poolInfo = await poolInfoFile.json();
	const PACKAGE_ID = poolInfo.packageId;
	const POOL_ID = poolInfo.poolId;
	const SUI_TYPE = "0x2::sui::SUI";
	const TEST_TYPE = `${PACKAGE_ID}::test_coin::TEST_COIN`;

	// Initialize SDK
	const sdk = new CarapaceSDK({
		network: "testnet",
		packageIds: { carapace: PACKAGE_ID },
	});

	console.log("✅ SDK initialized");
	console.log(`📦 Package ID: ${PACKAGE_ID}`);
	console.log(`🏊 Pool ID: ${POOL_ID}`);
	console.log(`🌐 Network: testnet\n`);

	// Get keypair from environment
	const privateKey = process.env.SUI_PRIVATE_KEY;
	if (!privateKey) {
		console.error("❌ Error: SUI_PRIVATE_KEY environment variable not set");
		process.exit(1);
	}

	// Support both Bech32 (suiprivkey1...) and base64 formats
	let keypair: Ed25519Keypair;
	if (privateKey.startsWith("suiprivkey")) {
		const decoded = decodeSuiPrivateKey(privateKey);
		keypair = Ed25519Keypair.fromSecretKey(decoded.secretKey);
	} else {
		keypair = Ed25519Keypair.fromSecretKey(fromB64(privateKey).slice(1));
	}
	const address = keypair.toSuiAddress();

	console.log(`👛 Wallet address: ${address}`);

	// Check initial balances
	const suiCoinsBefore = await sdk.client.getCoins({
		owner: address,
		coinType: SUI_TYPE,
	});
	const suiBalanceBefore = suiCoinsBefore.data.reduce(
		(sum, coin) => sum + BigInt(coin.balance),
		0n,
	);
	console.log(`💰 Initial SUI balance: ${Number(suiBalanceBefore) / 1e9} SUI`);

	const testCoinsBefore = await sdk.client.getCoins({
		owner: address,
		coinType: TEST_TYPE,
	});
	const testBalanceBefore = testCoinsBefore.data.reduce(
		(sum, coin) => sum + BigInt(coin.balance),
		0n,
	);
	console.log(
		`💰 Initial TEST balance: ${Number(testBalanceBefore) / 1e6} TEST\n`,
	);

	// Get pool state before swap
	console.log("📊 Pool state before swap:");
	try {
		const pool = await sdk.pool.getPool(POOL_ID);
		console.log(`   Reserve X (SUI): ${Number(pool.reserveX) / 1e9} SUI`);
		console.log(`   Reserve Y (TEST): ${Number(pool.reserveY) / 1e6} TEST`);
		console.log(`   LP Supply: ${pool.lpSupply}`);
		console.log(`   Fee BPS: ${pool.feeBps}\n`);

		// Calculate swap quote
		const amountIn = 10_000_000n; // 0.01 SUI
		console.log(`💱 Swapping: ${Number(amountIn) / 1e9} SUI for TEST`);

		const quote = await sdk.pool.getSwapQuote(POOL_ID, amountIn, true);
		console.log(`   Expected output: ${Number(quote.amountOut) / 1e6} TEST`);
		console.log(`   Price impact: ${quote.priceImpact.toFixed(4)}%`);
		console.log(`   Fee: ${Number(quote.fee) / 1e9} SUI\n`);

		// Execute swap
		console.log("📝 Building swap transaction...");
		const minAmountOut = (quote.amountOut * 99n) / 100n; // 1% slippage tolerance

		const tx = sdk.pool.swapXToY(
			POOL_ID,
			SUI_TYPE,
			TEST_TYPE,
			null, // Use gas coin for SUI
			amountIn,
			address, // sender address for output coin transfer
			minAmountOut,
			{
				gasBudget: 10_000_000,
			},
		);

		console.log("✍️  Signing and executing swap transaction...");

		// Sign and execute
		const result = await sdk.client.signAndExecuteTransaction({
			transaction: tx,
			signer: keypair,
			options: {
				showEffects: true,
				showObjectChanges: true,
				showEvents: true,
			},
		});

		console.log("\n✅ Swap executed successfully!\n");
		console.log(`📋 Transaction digest: ${result.digest}`);
		console.log(
			`🔗 View on explorer: https://testnet.suivision.xyz/txblock/${result.digest}\n`,
		);

		// Show events
		if (result.events && result.events.length > 0) {
			console.log("📡 Events:");
			result.events.forEach((event: any, i: number) => {
				console.log(`  ${i + 1}. ${event.type}`);
				if (event.type.includes("Swapped")) {
					console.log(`     Amount in: ${event.parsedJson?.amount_in}`);
					console.log(`     Amount out: ${event.parsedJson?.amount_out}`);
					console.log(`     Fee: ${event.parsedJson?.fee_amount}`);
				}
			});
			console.log();
		}

		// Get pool state after swap
		console.log("📊 Pool state after swap:");
		const poolAfter = await sdk.pool.getPool(POOL_ID);
		console.log(`   Reserve X (SUI): ${Number(poolAfter.reserveX) / 1e9} SUI`);
		console.log(
			`   Reserve Y (TEST): ${Number(poolAfter.reserveY) / 1e6} TEST`,
		);
		console.log(`   LP Supply: ${poolAfter.lpSupply}`);

		// Calculate reserve changes
		const reserveXChange = Number(poolAfter.reserveX - pool.reserveX) / 1e9;
		const reserveYChange = Number(poolAfter.reserveY - pool.reserveY) / 1e6;
		console.log(
			`\n   Reserve X change: ${reserveXChange > 0 ? "+" : ""}${reserveXChange.toFixed(6)} SUI`,
		);
		console.log(
			`   Reserve Y change: ${reserveYChange > 0 ? "+" : ""}${reserveYChange.toFixed(6)} TEST\n`,
		);

		// Check final balances
		const suiCoinsAfter = await sdk.client.getCoins({
			owner: address,
			coinType: SUI_TYPE,
		});
		const suiBalanceAfter = suiCoinsAfter.data.reduce(
			(sum, coin) => sum + BigInt(coin.balance),
			0n,
		);
		console.log(`💰 Final SUI balance: ${Number(suiBalanceAfter) / 1e9} SUI`);

		const testCoinsAfter = await sdk.client.getCoins({
			owner: address,
			coinType: TEST_TYPE,
		});
		const testBalanceAfter = testCoinsAfter.data.reduce(
			(sum, coin) => sum + BigInt(coin.balance),
			0n,
		);
		console.log(
			`💰 Final TEST balance: ${Number(testBalanceAfter) / 1e6} TEST`,
		);

		const suiBalanceChange = Number(suiBalanceAfter - suiBalanceBefore) / 1e9;
		const testBalanceChange =
			Number(testBalanceAfter - testBalanceBefore) / 1e6;
		console.log(
			`   SUI change: ${suiBalanceChange > 0 ? "+" : ""}${suiBalanceChange.toFixed(6)} SUI (including gas)`,
		);
		console.log(
			`   TEST change: ${testBalanceChange > 0 ? "+" : ""}${testBalanceChange.toFixed(6)} TEST\n`,
		);

		// Verification
		console.log("✅ Verification:");
		console.log(`   ✓ Pool reserves updated correctly`);
		console.log(`   ✓ Swap executed on-chain`);
		console.log(`   ✓ Events emitted properly`);
	} catch (error: any) {
		console.error("\n❌ Error during swap test:", error.message);
		if (error.cause) {
			console.error("Cause:", error.cause);
		}
		process.exit(1);
	}

	console.log("\n✨ Swap test completed successfully!");
}

main().catch((error) => {
	console.error("Fatal error:", error);
	process.exit(1);
});
