#!/usr/bin/env bun
/**
 * Comprehensive E2E Blockchain Tests
 * Tests the entire AMM flow on Sui testnet
 */

import { CarapaceSDK } from '../packages/sdk/src/index';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { decodeSuiPrivateKey } from '@mysten/sui.js/cryptography';
import { fromB64 } from '@mysten/sui.js/utils';

const PACKAGE_ID = '0x998379bb53423871a9e4f8f779c339c096622209309452995ae5ed395779106e';
const SUI_TYPE = '0x2::sui::SUI';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  data?: any;
}

const results: TestResult[] = [];

function logTest(name: string, passed: boolean, error?: string, data?: any) {
  results.push({ name, passed, error, data });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  if (error) console.log(`   Error: ${error}`);
  if (data) console.log(`   Data: ${JSON.stringify(data, null, 2)}`);
}

async function main() {
  console.log('\n🧪 Starting Comprehensive Blockchain E2E Tests\n');
  console.log('='.repeat(60));

  // Initialize SDK
  const sdk = new CarapaceSDK({
    network: 'testnet',
    packageIds: { carapace: PACKAGE_ID },
  });

  // Get keypair
  const privateKey = process.env.SUI_PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ SUI_PRIVATE_KEY not set');
    process.exit(1);
  }

  let keypair: Ed25519Keypair;
  if (privateKey.startsWith('suiprivkey')) {
    const decoded = decodeSuiPrivateKey(privateKey);
    keypair = Ed25519Keypair.fromSecretKey(decoded.secretKey);
  } else {
    keypair = Ed25519Keypair.fromSecretKey(fromB64(privateKey).slice(1));
  }
  const address = keypair.toSuiAddress();

  console.log(`\n📋 Test Configuration:`);
  console.log(`   Wallet: ${address}`);
  console.log(`   Package: ${PACKAGE_ID}`);
  console.log(`   Network: testnet\n`);

  let poolId: string;
  let lpTokenId: string;

  try {
    // Test 1: Create Pool
    console.log('\n📝 Test 1: Create Pool');
    console.log('-'.repeat(60));
    const createTx = sdk.pool.createPool(SUI_TYPE, SUI_TYPE, { gasBudget: 10_000_000 });
    const createResult = await sdk.client.signAndExecuteTransactionBlock({
      transactionBlock: createTx,
      signer: keypair,
      options: { showEffects: true, showObjectChanges: true, showEvents: true },
    });

    if (createResult.effects?.status?.status !== 'success') {
      throw new Error(`Pool creation failed: ${createResult.effects?.status?.error}`);
    }

    const createdPool = createResult.objectChanges?.find(
      (change: any) => change.type === 'created' && change.objectType?.includes('::pool::Pool')
    );

    if (!createdPool || !('objectId' in createdPool)) {
      throw new Error('Pool object not found in transaction');
    }

    poolId = createdPool.objectId;
    logTest('Create Pool', true, undefined, { poolId, digest: createResult.digest });

    // Wait for transaction to be finalized
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Verify Pool State (Empty)
    console.log('\n📝 Test 2: Verify Empty Pool State');
    console.log('-'.repeat(60));
    const emptyPool = await sdk.pool.getPool(poolId);

    const isEmptyCorrect =
      emptyPool.reserveX === 0n &&
      emptyPool.reserveY === 0n &&
      emptyPool.lpSupply === 0n;

    logTest('Verify Empty Pool', isEmptyCorrect, isEmptyCorrect ? undefined : 'Pool not empty', {
      reserveX: emptyPool.reserveX.toString(),
      reserveY: emptyPool.reserveY.toString(),
      lpSupply: emptyPool.lpSupply.toString(),
    });

    // Test 3: Add Initial Liquidity
    console.log('\n📝 Test 3: Add Initial Liquidity');
    console.log('-'.repeat(60));
    const liquidityAmount = 100_000_000n; // 0.1 SUI each
    const addLiqTx = sdk.pool.addLiquidity(
      poolId,
      SUI_TYPE,
      SUI_TYPE,
      null,
      null,
      liquidityAmount,
      liquidityAmount,
      address,
      0n,
      { gasBudget: 10_000_000 }
    );

    const addLiqResult = await sdk.client.signAndExecuteTransactionBlock({
      transactionBlock: addLiqTx,
      signer: keypair,
      options: { showEffects: true, showObjectChanges: true, showEvents: true },
    });

    if (addLiqResult.effects?.status?.status !== 'success') {
      throw new Error(`Add liquidity failed: ${addLiqResult.effects?.status?.error}`);
    }

    const lpToken = addLiqResult.objectChanges?.find(
      (change: any) => change.type === 'created' && change.objectType?.includes('::coin::Coin')
    );

    if (!lpToken || !('objectId' in lpToken)) {
      throw new Error('LP token not found');
    }

    lpTokenId = lpToken.objectId;

    const liquidityEvent = addLiqResult.events?.find(
      (e: any) => e.type.includes('LiquidityAdded')
    );

    logTest('Add Initial Liquidity', true, undefined, {
      digest: addLiqResult.digest,
      lpTokenId,
      event: liquidityEvent?.parsedJson,
    });

    // Wait for transaction to be finalized
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 4: Verify Pool State After Liquidity
    console.log('\n📝 Test 4: Verify Pool State After Liquidity');
    console.log('-'.repeat(60));
    const poolAfterLiq = await sdk.pool.getPool(poolId);

    const isLiquidityCorrect =
      poolAfterLiq.reserveX === liquidityAmount &&
      poolAfterLiq.reserveY === liquidityAmount &&
      poolAfterLiq.lpSupply > 0n;

    logTest('Verify Pool After Liquidity', isLiquidityCorrect, isLiquidityCorrect ? undefined : 'Reserves mismatch', {
      reserveX: poolAfterLiq.reserveX.toString(),
      reserveY: poolAfterLiq.reserveY.toString(),
      lpSupply: poolAfterLiq.lpSupply.toString(),
    });

    // Test 5: Get Swap Quote
    console.log('\n📝 Test 5: Get Swap Quote');
    console.log('-'.repeat(60));
    const swapAmountIn = 10_000_000n; // 0.01 SUI
    const quote = await sdk.pool.getSwapQuote(poolId, swapAmountIn, true);

    const isQuoteValid = quote.amountOut > 0n && quote.fee > 0n;

    logTest('Get Swap Quote', isQuoteValid, isQuoteValid ? undefined : 'Invalid quote', {
      amountIn: quote.amountIn.toString(),
      amountOut: quote.amountOut.toString(),
      fee: quote.fee.toString(),
      priceImpact: quote.priceImpact.toFixed(4),
    });

    // Test 6: Execute Swap
    console.log('\n📝 Test 6: Execute Swap');
    console.log('-'.repeat(60));
    const minAmountOut = quote.amountOut * 99n / 100n;
    const swapTx = sdk.pool.swapXToY(
      poolId,
      SUI_TYPE,
      SUI_TYPE,
      null,
      swapAmountIn,
      address,
      minAmountOut,
      { gasBudget: 10_000_000 }
    );

    const swapResult = await sdk.client.signAndExecuteTransactionBlock({
      transactionBlock: swapTx,
      signer: keypair,
      options: { showEffects: true, showObjectChanges: true, showEvents: true },
    });

    if (swapResult.effects?.status?.status !== 'success') {
      throw new Error(`Swap failed: ${swapResult.effects?.status?.error}`);
    }

    const swapEvent = swapResult.events?.find(
      (e: any) => e.type.includes('Swapped')
    );

    logTest('Execute Swap', true, undefined, {
      digest: swapResult.digest,
      event: swapEvent?.parsedJson,
    });

    // Wait for transaction to be finalized
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 7: Verify Pool State After Swap
    console.log('\n📝 Test 7: Verify Pool State After Swap');
    console.log('-'.repeat(60));
    const poolAfterSwap = await sdk.pool.getPool(poolId);

    const expectedReserveX = liquidityAmount + swapAmountIn;
    const expectedReserveY = liquidityAmount - quote.amountOut;

    // Allow for protocol fees and rounding differences (up to 0.5% variance)
    const tolerance = swapAmountIn / 200n; // 0.5% tolerance
    const reserveXClose = poolAfterSwap.reserveX >= expectedReserveX - tolerance &&
                          poolAfterSwap.reserveX <= expectedReserveX + tolerance;
    const reserveYClose = poolAfterSwap.reserveY >= expectedReserveY - tolerance &&
                          poolAfterSwap.reserveY <= expectedReserveY + tolerance;

    const isSwapCorrect = reserveXClose && reserveYClose;

    logTest('Verify Pool After Swap', isSwapCorrect, isSwapCorrect ? undefined : 'Reserves mismatch after swap', {
      reserveX: poolAfterSwap.reserveX.toString(),
      reserveY: poolAfterSwap.reserveY.toString(),
      expectedReserveX: expectedReserveX.toString(),
      expectedReserveY: expectedReserveY.toString(),
    });

    // Test 8: Calculate Spot Price
    console.log('\n📝 Test 8: Calculate Spot Price');
    console.log('-'.repeat(60));
    const spotPrice = await sdk.pool.getSpotPrice(poolId);

    const isPriceValid = spotPrice > 0 && spotPrice !== Infinity;

    logTest('Calculate Spot Price', isPriceValid, isPriceValid ? undefined : 'Invalid price', {
      spotPrice: spotPrice.toFixed(6),
    });

    // Test 9: Remove Liquidity
    console.log('\n📝 Test 9: Remove Liquidity');
    console.log('-'.repeat(60));
    const lpAmountToRemove = poolAfterSwap.lpSupply / 2n; // Remove 50%
    const removeLiqTx = sdk.pool.removeLiquidity(
      poolId,
      SUI_TYPE,
      SUI_TYPE,
      lpTokenId,
      lpAmountToRemove,
      address,
      0n,
      0n,
      { gasBudget: 10_000_000 }
    );

    const removeLiqResult = await sdk.client.signAndExecuteTransactionBlock({
      transactionBlock: removeLiqTx,
      signer: keypair,
      options: { showEffects: true, showObjectChanges: true, showEvents: true },
    });

    if (removeLiqResult.effects?.status?.status !== 'success') {
      throw new Error(`Remove liquidity failed: ${removeLiqResult.effects?.status?.error}`);
    }

    const removeLiqEvent = removeLiqResult.events?.find(
      (e: any) => e.type.includes('LiquidityRemoved')
    );

    logTest('Remove Liquidity', true, undefined, {
      digest: removeLiqResult.digest,
      event: removeLiqEvent?.parsedJson,
    });

    // Wait for transaction to be finalized
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 10: Verify Pool State After Removal
    console.log('\n📝 Test 10: Verify Pool State After Removal');
    console.log('-'.repeat(60));
    const poolAfterRemoval = await sdk.pool.getPool(poolId);

    const lpSupplyReduced = poolAfterRemoval.lpSupply < poolAfterSwap.lpSupply;
    const reservesReduced = poolAfterRemoval.reserveX < poolAfterSwap.reserveX &&
                           poolAfterRemoval.reserveY < poolAfterSwap.reserveY;

    const isRemovalCorrect = lpSupplyReduced && reservesReduced;

    logTest('Verify Pool After Removal', isRemovalCorrect, isRemovalCorrect ? undefined : 'Liquidity not removed correctly', {
      reserveX: poolAfterRemoval.reserveX.toString(),
      reserveY: poolAfterRemoval.reserveY.toString(),
      lpSupply: poolAfterRemoval.lpSupply.toString(),
    });

  } catch (error: any) {
    logTest('Test Suite', false, error.message);
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  }

  // Print Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const percentage = ((passed / total) * 100).toFixed(1);

  console.log(`\nTotal Tests: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${total - passed}`);
  console.log(`Success Rate: ${percentage}%`);

  if (passed === total) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n❌ Some tests failed');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
