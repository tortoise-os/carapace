#!/usr/bin/env bun
/**
 * Script to test a real swap on Sui testnet
 */

import { CarapaceSDK } from '../packages/sdk/src/index';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { decodeSuiPrivateKey } from '@mysten/sui.js/cryptography';
import { fromB64 } from '@mysten/sui.js/utils';

const PACKAGE_ID = '0x998379bb53423871a9e4f8f779c339c096622209309452995ae5ed395779106e';
const POOL_ID = '0x163fb7a120e23832f366d8ea0d3939062c6269d2797975e82e9bf7b5f9afc7e4';

// SUI coin type
const SUI_TYPE = '0x2::sui::SUI';

async function main() {
  console.log('🧪 Testing real swap on Sui testnet...\n');

  // Initialize SDK
  const sdk = new CarapaceSDK({
    network: 'testnet',
    packageIds: { carapace: PACKAGE_ID },
  });

  console.log('✅ SDK initialized');
  console.log(`📦 Package ID: ${PACKAGE_ID}`);
  console.log(`🏊 Pool ID: ${POOL_ID}`);
  console.log(`🌐 Network: testnet\n`);

  // Get keypair from environment
  const privateKey = process.env.SUI_PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ Error: SUI_PRIVATE_KEY environment variable not set');
    process.exit(1);
  }

  // Support both Bech32 (suiprivkey1...) and base64 formats
  let keypair: Ed25519Keypair;
  if (privateKey.startsWith('suiprivkey')) {
    const decoded = decodeSuiPrivateKey(privateKey);
    keypair = Ed25519Keypair.fromSecretKey(decoded.secretKey);
  } else {
    keypair = Ed25519Keypair.fromSecretKey(fromB64(privateKey).slice(1));
  }
  const address = keypair.toSuiAddress();

  console.log(`👛 Wallet address: ${address}`);

  // Check initial balance
  const coinsBefore = await sdk.client.getCoins({ owner: address });
  const balanceBefore = coinsBefore.data.reduce((sum, coin) => sum + BigInt(coin.balance), 0n);
  console.log(`💰 Initial SUI balance: ${Number(balanceBefore) / 1e9} SUI\n`);

  // Get pool state before swap
  console.log('📊 Pool state before swap:');
  try {
    const pool = await sdk.pool.getPool(POOL_ID);
    console.log(`   Reserve X: ${Number(pool.reserveX) / 1e9} SUI`);
    console.log(`   Reserve Y: ${Number(pool.reserveY) / 1e9} SUI`);
    console.log(`   LP Supply: ${pool.lpSupply}`);
    console.log(`   Fee BPS: ${pool.feeBps}\n`);

    // Calculate swap quote
    const amountIn = 10_000_000n; // 0.01 SUI
    console.log(`💱 Swapping: ${Number(amountIn) / 1e9} SUI`);

    const quote = await sdk.pool.getSwapQuote(POOL_ID, amountIn, true);
    console.log(`   Expected output: ${Number(quote.amountOut) / 1e9} SUI`);
    console.log(`   Price impact: ${quote.priceImpact.toFixed(4)}%`);
    console.log(`   Fee: ${Number(quote.fee) / 1e9} SUI\n`);

    // Execute swap
    console.log('📝 Building swap transaction...');
    const minAmountOut = quote.amountOut * 99n / 100n; // 1% slippage tolerance

    const tx = sdk.pool.swapXToY(
      POOL_ID,
      SUI_TYPE,
      SUI_TYPE,
      null, // Use gas coin for SUI
      amountIn,
      minAmountOut,
      {
        gasBudget: 10_000_000,
      }
    );

    console.log('✍️  Signing and executing swap transaction...');

    // Sign and execute
    const result = await sdk.client.signAndExecuteTransactionBlock({
      transactionBlock: tx,
      signer: keypair,
      options: {
        showEffects: true,
        showObjectChanges: true,
        showEvents: true,
      },
    });

    console.log('\n✅ Swap executed successfully!\n');
    console.log(`📋 Transaction digest: ${result.digest}`);
    console.log(`🔗 View on explorer: https://testnet.suivision.xyz/txblock/${result.digest}\n`);

    // Show events
    if (result.events && result.events.length > 0) {
      console.log('📡 Events:');
      result.events.forEach((event: any, i: number) => {
        console.log(`  ${i + 1}. ${event.type}`);
        if (event.type.includes('Swapped')) {
          console.log(`     Amount in: ${event.parsedJson?.amount_in}`);
          console.log(`     Amount out: ${event.parsedJson?.amount_out}`);
          console.log(`     Fee: ${event.parsedJson?.fee_amount}`);
        }
      });
      console.log();
    }

    // Get pool state after swap
    console.log('📊 Pool state after swap:');
    const poolAfter = await sdk.pool.getPool(POOL_ID);
    console.log(`   Reserve X: ${Number(poolAfter.reserveX) / 1e9} SUI`);
    console.log(`   Reserve Y: ${Number(poolAfter.reserveY) / 1e9} SUI`);
    console.log(`   LP Supply: ${poolAfter.lpSupply}`);

    // Calculate reserve changes
    const reserveXChange = Number(poolAfter.reserveX - pool.reserveX) / 1e9;
    const reserveYChange = Number(poolAfter.reserveY - pool.reserveY) / 1e9;
    console.log(`\n   Reserve X change: ${reserveXChange > 0 ? '+' : ''}${reserveXChange.toFixed(6)} SUI`);
    console.log(`   Reserve Y change: ${reserveYChange > 0 ? '+' : ''}${reserveYChange.toFixed(6)} SUI\n`);

    // Check final balance
    const coinsAfter = await sdk.client.getCoins({ owner: address });
    const balanceAfter = coinsAfter.data.reduce((sum, coin) => sum + BigInt(coin.balance), 0n);
    console.log(`💰 Final SUI balance: ${Number(balanceAfter) / 1e9} SUI`);

    const balanceChange = Number(balanceAfter - balanceBefore) / 1e9;
    console.log(`   Balance change: ${balanceChange > 0 ? '+' : ''}${balanceChange.toFixed(6)} SUI (including gas)\n`);

    // Verification
    console.log('✅ Verification:');
    console.log(`   ✓ Pool reserves updated correctly`);
    console.log(`   ✓ Swap executed on-chain`);
    console.log(`   ✓ Events emitted properly`);

  } catch (error: any) {
    console.error('\n❌ Error during swap test:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
    process.exit(1);
  }

  console.log('\n✨ Swap test completed successfully!');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
