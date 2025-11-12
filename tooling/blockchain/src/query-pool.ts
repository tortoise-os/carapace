#!/usr/bin/env bun
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";

const client = new SuiClient({ url: getFullnodeUrl("testnet") });

const tx = await client.getTransactionBlock({
	digest: "AisfBdrNSjk2foK3kBnLjUsqCw66Rf5qFivDv7AVQsaJ",
	options: { showObjectChanges: true },
});

console.log("\nTransaction Object Changes:\n");
tx.objectChanges?.forEach((change, i) => {
	if (change.type === "created") {
		console.log(`[${i + 1}] Created:`);
		console.log(`    Type: ${change.objectType}`);
		console.log(`    ID: ${change.objectId}`);
		console.log("");
	}
});
