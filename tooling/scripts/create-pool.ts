#!/usr/bin/env bun

/**
 * Script to create a real pool on Sui testnet
 */

import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { fromB64 } from "@mysten/sui/utils";
import { CarapaceSDK } from "../packages/sdk/src/index";

const PACKAGE_ID =
	"0xad1a82cc599cca382ee2888ebe7220061f0654332543aab37f84db34f9a6e06e";

// SUI coin type
const SUI_TYPE = "0x2::sui::SUI";
// TEST coin type
const TEST_TYPE = `${PACKAGE_ID}::test_coin::TEST_COIN`;

async function main() {
	console.log("🚀 Creating pool on Sui testnet...\n");

	// Initialize SDK
	const sdk = new CarapaceSDK({
		network: "testnet",
		packageIds: { carapace: PACKAGE_ID },
	});

	console.log("✅ SDK initialized");
	console.log(`📦 Package ID: ${PACKAGE_ID}`);
	console.log(`🌐 Network: testnet\n`);

	// Get keypair from environment or use default
	const privateKey = process.env.SUI_PRIVATE_KEY;
	if (!privateKey) {
		console.error("❌ Error: SUI_PRIVATE_KEY environment variable not set");
		console.log("\nTo get your private key:");
		console.log("  sui keytool export --key-identity <your-address>");
		console.log("\nThen set it (use the suiprivkey1... value):");
		console.log('  export SUI_PRIVATE_KEY="suiprivkey1..."');
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

	// Check balance
	const coins = await sdk.client.getCoins({ owner: address });
	const totalBalance = coins.data.reduce(
		(sum, coin) => sum + BigInt(coin.balance),
		0n,
	);
	console.log(`💰 SUI balance: ${Number(totalBalance) / 1e9} SUI\n`);

	if (totalBalance < 100_000_000n) {
		console.error("❌ Error: Insufficient SUI balance (need at least 0.1 SUI)");
		console.log("Get testnet SUI from: https://faucet.testnet.sui.io");
		process.exit(1);
	}

	try {
		// Create pool transaction
		console.log("📝 Building create pool transaction for SUI/TEST...");
		const tx = sdk.pool.createPool(
			SUI_TYPE,
			TEST_TYPE,
			address, // sender address for AdminCap transfer
			{
				gasBudget: 10_000_000,
			},
		);

		console.log("✍️  Signing and executing transaction...");

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

		console.log("\n✅ Pool created successfully!\n");
		console.log(`📋 Transaction digest: ${result.digest}`);
		console.log(
			`🔗 View on explorer: https://testnet.suivision.xyz/txblock/${result.digest}\n`,
		);

		// Log all object changes for debugging
		if (result.objectChanges && result.objectChanges.length > 0) {
			console.log("All object changes:");
			result.objectChanges.forEach((change: any, i: number) => {
				console.log(`\n[${i + 1}] Type: ${change.type}`);
				if ("objectType" in change) {
					console.log(`    ObjectType: ${change.objectType}`);
				}
				if ("objectId" in change) {
					console.log(`    ObjectId: ${change.objectId}`);
				}
			});
			console.log("");
		}

		// Find the created pool object
		const poolObject = result.objectChanges?.find(
			(change: any) =>
				change.type === "created" &&
				change.objectType?.includes("::pool::Pool"),
		);

		if (poolObject && "objectId" in poolObject) {
			console.log(`🏊 Pool ID: ${poolObject.objectId}`);
			console.log(
				`🔗 Pool on explorer: https://testnet.suivision.xyz/object/${poolObject.objectId}\n`,
			);

			// Save pool info
			const poolInfo = {
				poolId: poolObject.objectId,
				packageId: PACKAGE_ID,
				tokenX: SUI_TYPE,
				tokenY: TEST_TYPE,
				createdAt: new Date().toISOString(),
				transactionDigest: result.digest,
			};

			await Bun.write(
				"./scripts/.pool-info.json",
				JSON.stringify(poolInfo, null, 2),
			);

			console.log("💾 Pool info saved to scripts/.pool-info.json");
		}

		// Show events
		if (result.events && result.events.length > 0) {
			console.log("\n📡 Events:");
			result.events.forEach((event: any, i: number) => {
				console.log(`  ${i + 1}. ${event.type}`);
			});
		}
	} catch (error: any) {
		console.error("\n❌ Error creating pool:", error.message);
		if (error.cause) {
			console.error("Cause:", error.cause);
		}
		process.exit(1);
	}

	console.log("\n✨ Done!");
}

main().catch((error) => {
	console.error("Fatal error:", error);
	process.exit(1);
});
