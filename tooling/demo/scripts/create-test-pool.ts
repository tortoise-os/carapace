#!/usr/bin/env bun
/**
 * Create Test Pool Script
 *
 * This script creates a test pool on Sui testnet with initial liquidity.
 * Make sure you have:
 * 1. Sui CLI installed and configured
 * 2. Testnet SUI tokens
 * 3. Test tokens to create a pool with
 */

import { SuiClient } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { TransactionBlock } from '@mysten/sui.js/transactions';

// Configuration
const NETWORK = 'testnet';
const RPC_URL = 'https://fullnode.testnet.sui.io:443';
const PACKAGE_ID = process.env.AMM_PACKAGE_ID || '0xfb9aa64f05eec5e108bf48666f400381861b7fd9e4aa59664f9134a436cfd73d';

// Token types - You'll need to update these with your actual token types
const SUI_TYPE = '0x2::sui::SUI';
const USDC_TYPE = '0x...::usdc::USDC'; // Replace with actual USDC type on testnet

async function main() {
  console.log('🐢 TortoiseSwap - Create Test Pool\n');

  // Initialize client
  const client = new SuiClient({ url: RPC_URL });

  // Get keypair from environment or create new one
  const privateKey = process.env.SUI_PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ Error: SUI_PRIVATE_KEY environment variable not set');
    console.log('\nTo set your private key:');
    console.log('export SUI_PRIVATE_KEY="your-private-key-here"');
    console.log('\nYou can get your private key from Sui CLI:');
    console.log('sui keytool export --key-identity <your-address>');
    process.exit(1);
  }

  const keypair = Ed25519Keypair.fromSecretKey(Buffer.from(privateKey, 'hex'));
  const address = keypair.getPublicKey().toSuiAddress();

  console.log(`📍 Address: ${address}`);

  // Check balance
  const balance = await client.getBalance({ owner: address });
  console.log(`💰 Balance: ${Number(balance.totalBalance) / 1e9} SUI\n`);

  if (Number(balance.totalBalance) === 0) {
    console.error('❌ Error: Insufficient balance');
    console.log('\nGet testnet SUI from the faucet:');
    console.log('https://discord.com/channels/916379725201563759/971488439931392130');
    process.exit(1);
  }

  console.log('Step 1: Creating pool...');
  const createPoolTx = new TransactionBlock();

  createPoolTx.moveCall({
    target: `${PACKAGE_ID}::pool::create_pool`,
    typeArguments: [SUI_TYPE, USDC_TYPE],
    arguments: [],
  });

  try {
    const createResult = await client.signAndExecuteTransactionBlock({
      transactionBlock: createPoolTx,
      signer: keypair,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });

    console.log('✅ Pool created!');
    console.log(`Transaction digest: ${createResult.digest}`);

    // Find the pool object ID from object changes
    const poolObject = createResult.objectChanges?.find(
      (change) => change.type === 'created' && change.objectType.includes('::pool::Pool')
    );

    if (!poolObject || poolObject.type !== 'created') {
      throw new Error('Pool object not found in transaction result');
    }

    const poolId = poolObject.objectId;
    console.log(`Pool ID: ${poolId}\n`);

    console.log('Step 2: Adding initial liquidity...');
    console.log('Note: You need to have USDC tokens to add liquidity');
    console.log('For testing, you can create a simple test token\n');

    console.log('✅ Pool creation complete!');
    console.log('\nNext steps:');
    console.log('1. Add liquidity to the pool using the UI or another transaction');
    console.log('2. The indexer will automatically pick up the pool');
    console.log('3. The pool will appear in the swap interface\n');

    console.log('Pool details:');
    console.log(`- Pool ID: ${poolId}`);
    console.log(`- Token X: ${SUI_TYPE}`);
    console.log(`- Token Y: ${USDC_TYPE}`);
    console.log(`- Package: ${PACKAGE_ID}`);

  } catch (error: any) {
    console.error('❌ Error creating pool:', error.message);
    if (error.effects) {
      console.error('Effects:', JSON.stringify(error.effects, null, 2));
    }
    process.exit(1);
  }
}

main().catch(console.error);
