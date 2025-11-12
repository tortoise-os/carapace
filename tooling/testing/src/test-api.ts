#!/usr/bin/env bun
/**
 * Test API endpoints to verify blockchain integration
 */

async function main() {
	console.log("🧪 Testing API endpoints with real blockchain data...\n");

	const API_BASE = "http://localhost:3500";
	const POOL_ID =
		"0x6828cc09b4466dd7753a457aaa8a328f32e189729b178ce38252a03ab8190951";

	try {
		// Test health endpoint
		console.log("1. Testing /health endpoint...");
		const healthRes = await fetch(`${API_BASE}/health`);
		const health = await healthRes.json();
		console.log(`   ✅ Status: ${health.status}`);
		console.log(`   ✅ Timestamp: ${health.timestamp}\n`);

		// Test list pools endpoint
		console.log("2. Testing GET /api/pools...");
		const poolsRes = await fetch(`${API_BASE}/api/pools`);
		const poolsData = await poolsRes.json();

		if (poolsData.success) {
			console.log(`   ✅ Found ${poolsData.data.length} pool(s)`);

			if (poolsData.data.length > 0) {
				const pool = poolsData.data[0];
				console.log(`   📊 First pool:`);
				console.log(`      ID: ${pool.pool_id}`);
				console.log(`      Token X: ${pool.token_x}`);
				console.log(`      Token Y: ${pool.token_y}`);
				console.log(`      Reserve X: ${pool.reserve_x}`);
				console.log(`      Reserve Y: ${pool.reserve_y}`);
				console.log(`      LP Supply: ${pool.lp_supply}`);
				console.log(`      Fee BPS: ${pool.fee_rate}\n`);
			}
		} else {
			console.error(`   ❌ Error: ${poolsData.error}\n`);
		}

		// Test get specific pool
		console.log(`3. Testing GET /api/pools/${POOL_ID}...`);
		const poolRes = await fetch(`${API_BASE}/api/pools/${POOL_ID}`);
		const poolData = await poolRes.json();

		if (poolData.success) {
			console.log(`   ✅ Pool found!`);
			console.log(`      Token X: ${poolData.data.token_x}`);
			console.log(`      Token Y: ${poolData.data.token_y}`);
			console.log(`      Reserve X: ${poolData.data.reserve_x}`);
			console.log(`      Reserve Y: ${poolData.data.reserve_y}\n`);
		} else {
			console.error(`   ❌ Error: ${poolData.error}\n`);
		}

		// Test get spot price
		console.log(`4. Testing GET /api/pools/${POOL_ID}/price...`);
		const priceRes = await fetch(`${API_BASE}/api/pools/${POOL_ID}/price`);
		const priceData = await priceRes.json();

		if (priceData.success) {
			console.log(`   ✅ Spot price: ${priceData.data.price}\n`);
		} else {
			console.error(`   ❌ Error: ${priceData.error}\n`);
		}

		// Test get swap quote
		console.log(`5. Testing GET /api/pools/${POOL_ID}/quote...`);
		const quoteRes = await fetch(
			`${API_BASE}/api/pools/${POOL_ID}/quote?amountIn=10000000&isXToY=true`,
		);
		const quoteData = await quoteRes.json();

		if (quoteData.success) {
			console.log(`   ✅ Swap quote:`);
			console.log(
				`      Amount in: ${Number(quoteData.data.amountIn) / 1e9} SUI`,
			);
			console.log(
				`      Amount out: ${Number(quoteData.data.amountOut) / 1e6} TEST`,
			);
			console.log(
				`      Price impact: ${quoteData.data.priceImpact.toFixed(4)}%`,
			);
			console.log(`      Fee: ${Number(quoteData.data.fee) / 1e9} SUI\n`);
		} else {
			console.error(`   ❌ Error: ${quoteData.error}\n`);
		}

		console.log("✅ All tests completed!");
	} catch (error: any) {
		console.error("❌ Test failed:", error.message);
		process.exit(1);
	}
}

main().catch((error) => {
	console.error("Fatal error:", error);
	process.exit(1);
});
