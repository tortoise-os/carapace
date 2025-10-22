#!/usr/bin/env bun
/**
 * Script to create a real pool on Sui testnet
 */

import { CarapaceSDK } from '../packages/sdk/src/index';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { decodeSuiPrivateKey } from '@mysten/sui.js/cryptography';
import { fromB64 } from '@mysten/sui.js/utils';

const PACKAGE_ID = '0x998379bb53423871a9e4f8f779c339c096622209309452995ae5ed395779106e';

// SUI coin type
const SUI_TYPE = '0x2::sui::SUI';

async function main() {
  console.log('🚀 Creating pool on Sui testnet...\n');

  // Initialize SDK
  const sdk = new CarapaceSDK({
    network: 'testnet',
    packageIds: { carapace: PACKAGE_ID },
  });

  console.log('✅ SDK initialized');
  console.log(`📦 Package ID: ${PACKAGE_ID}`);
  console.log(`🌐 Network: testnet\n`);

  // Get keypair from environment or use default
  const privateKey = process.env.SUI_PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ Error: SUI_PRIVATE_KEY environment variable not set');
    console.log('\nTo get your private key:');
    console.log('  sui keytool export --key-identity <your-address>');
    console.log('\nThen set it (use the suiprivkey1... value):');
    console.log('  export SUI_PRIVATE_KEY="suiprivkey1..."');
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

  // Check balance
  const coins = await sdk.client.getCoins({ owner: address });
  const totalBalance = coins.data.reduce((sum, coin) => sum + BigInt(coin.balance), 0n);
  console.log(`💰 SUI balance: ${Number(totalBalance) / 1e9} SUI\n`);

  if (totalBalance < 100_000_000n) {
    console.error('❌ Error: Insufficient SUI balance (need at least 0.1 SUI)');
    console.log('Get testnet SUI from: https://faucet.testnet.sui.io');
    process.exit(1);
  }

  try {
    // Create pool transaction
    console.log('📝 Building create pool transaction...');
    const tx = sdk.pool.createPool(
      SUI_TYPE,
      SUI_TYPE,
      {
        gasBudget: 10_000_000,
      }
    );

    console.log('✍️  Signing and executing transaction...');

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

    console.log('\n✅ Pool created successfully!\n');
    console.log(`📋 Transaction digest: ${result.digest}`);
    console.log(`🔗 View on explorer: https://testnet.suivision.xyz/txblock/${result.digest}\n`);

    // Find the created pool object
    const poolObject = result.objectChanges?.find(
      (change: any) => change.type === 'created' && change.objectType.includes('::pool::Pool')
    );

    if (poolObject && 'objectId' in poolObject) {
      console.log(`🏊 Pool ID: ${poolObject.objectId}`);
      console.log(`🔗 Pool on explorer: https://testnet.suivision.xyz/object/${poolObject.objectId}\n`);

      // Save pool info
      const poolInfo = {
        poolId: poolObject.objectId,
        packageId: PACKAGE_ID,
        tokenX: SUI_TYPE,
        tokenY: SUI_TYPE,
        createdAt: new Date().toISOString(),
        transactionDigest: result.digest,
      };

      await Bun.write(
        './scripts/.pool-info.json',
        JSON.stringify(poolInfo, null, 2)
      );

      console.log('💾 Pool info saved to scripts/.pool-info.json');
    }

    // Show events
    if (result.events && result.events.length > 0) {
      console.log('\n📡 Events:');
      result.events.forEach((event: any, i: number) => {
        console.log(`  ${i + 1}. ${event.type}`);
      });
    }

  } catch (error: any) {
    console.error('\n❌ Error creating pool:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
    process.exit(1);
  }

  console.log('\n✨ Done!');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
