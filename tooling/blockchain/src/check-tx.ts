#!/usr/bin/env bun
/**
 * Check transaction details
 */

import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";

const TX_DIGEST = "EKw8F6LcNQcyEYjxJiLFEmwrTbNdgLLKN4beAkYv57Cx";

const client = new SuiClient({ url: getFullnodeUrl("testnet") });

const tx = await client.getTransactionBlock({
	digest: TX_DIGEST,
	options: {
		showEffects: true,
		showEvents: true,
		showObjectChanges: true,
		showInput: true,
	},
});

console.log("\n📋 Transaction Status:");
console.log(JSON.stringify(tx.effects?.status, null, 2));

console.log("\n📡 Events:");
console.log(JSON.stringify(tx.events, null, 2));

console.log("\n🔄 Object Changes:");
console.log(JSON.stringify(tx.objectChanges, null, 2));

console.log("\n⚠️  Error (if any):");
if (tx.effects?.status?.error) {
	console.log(tx.effects.status.error);
}
