#!/usr/bin/env bun
/**
 * Script to add liquidity to a pool on Sui testnet
 */

import { CarapaceSDK } from '../packages/sdk/src/index';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import { fromB64 } from '@mysten/sui/utils';

const PACKAGE_ID = '0xad1a82cc599cca382ee2888ebe7220061f0654332543aab37f84db34f9a6e06e';

// Coin types
const SUI_TYPE = '0x2::sui::SUI';
const TEST_TYPE = `${PACKAGE_ID}::test_coin::TEST_COIN`;

async function main() {
  console.log('🚀 Adding liquidity to pool on Sui testnet...\n');

  // Load pool info
  const poolInfoFile = Bun.file('./scripts/.pool-info.json');
  if (!(await poolInfoFile.exists())) {
    console.error('❌ Error: Pool info file not found. Run create-pool.ts first.');
    process.exit(1);
  }

  const poolInfo = await poolInfoFile.json();
  const poolId = poolInfo.poolId;

  console.log(`🏊 Pool ID: ${poolId}\n`);

  // Initialize SDK
  const sdk = new CarapaceSDK({
    network: 'testnet',
    packageIds: { carapace: PACKAGE_ID },
  });

  console.log('✅ SDK initialized');
  console.log(`📦 Package ID: ${PACKAGE_ID}`);
  console.log(`🌐 Network: testnet\n`);

  // Get keypair from environment
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

  // Check SUI balance
  const suiCoins = await sdk.client.getCoins({ owner: address, coinType: SUI_TYPE });
  const suiBalance = suiCoins.data.reduce((sum, coin) => sum + BigInt(coin.balance), 0n);
  console.log(`💰 SUI balance: ${Number(suiBalance) / 1e9} SUI`);

  // Check TEST balance
  const testCoins = await sdk.client.getCoins({ owner: address, coinType: TEST_TYPE });
  const testBalance = testCoins.data.reduce((sum, coin) => sum + BigInt(coin.balance), 0n);
  console.log(`💰 TEST balance: ${Number(testBalance) / 1e6} TEST\n`);

  if (suiBalance < 200_000_000n) {
    console.error('❌ Error: Insufficient SUI balance (need at least 0.2 SUI)');
    console.log('Get testnet SUI from: https://faucet.testnet.sui.io');
    process.exit(1);
  }

  if (testBalance < 10_000_000n) {
    console.error('❌ Error: Insufficient TEST balance (need at least 10 TEST)');
    console.log('Run: SUI_PRIVATE_KEY="..." bun run scripts/mint-test-coins.ts');
    process.exit(1);
  }

  // Get the TEST coin object
  const testCoinObject = testCoins.data[0]?.coinObjectId;
  if (!testCoinObject) {
    console.error('❌ Error: No TEST coin object found');
    process.exit(1);
  }

  // Liquidity amounts
  const amountX = 100_000_000n; // 0.1 SUI (9 decimals)
  const amountY = 10_000_000n;  // 10 TEST (6 decimals)

  console.log(`💧 Adding liquidity:`);
  console.log(`   Token X (SUI): ${Number(amountX) / 1e9} SUI`);
  console.log(`   Token Y (TEST): ${Number(amountY) / 1e6} TEST`);
  console.log(`   TEST Coin Object: ${testCoinObject}\n`);

  try {
    console.log('📝 Building add liquidity transaction...');
    // For SUI/TEST pool: null for SUI (uses gas), testCoinObject for TEST
    const tx = sdk.pool.addLiquidity(
      poolId,
      SUI_TYPE,
      TEST_TYPE,
      null, // SUI coin (will use gas)
      testCoinObject, // TEST coin object
      amountX,
      amountY,
      address, // sender address for LP token transfer
      0n, // minLiquidity
      {
        gasBudget: 10_000_000,
      }
    );

    console.log('✍️  Signing and executing transaction...');

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

    console.log('\n✅ Liquidity added successfully!\n');
    console.log(`📋 Transaction digest: ${result.digest}`);
    console.log(`🔗 View on explorer: https://testnet.suivision.xyz/txblock/${result.digest}\n`);

    // Find LP token object
    const lpToken = result.objectChanges?.find(
      (change: any) => change.type === 'created' && change.objectType.includes('::coin::Coin')
    );

    if (lpToken && 'objectId' in lpToken) {
      console.log(`🪙 LP Token ID: ${lpToken.objectId}`);
      console.log(`🔗 LP Token on explorer: https://testnet.suivision.xyz/object/${lpToken.objectId}\n`);
    }

    // Show events
    if (result.events && result.events.length > 0) {
      console.log('📡 Events:');
      result.events.forEach((event: any, i: number) => {
        console.log(`  ${i + 1}. ${event.type}`);
        if (event.type.includes('LiquidityAdded')) {
          console.log(`     Amount X: ${event.parsedJson?.amount_x}`);
          console.log(`     Amount Y: ${event.parsedJson?.amount_y}`);
          console.log(`     Liquidity: ${event.parsedJson?.liquidity}`);
        }
      });
    }

  } catch (error: any) {
    console.error('\n❌ Error adding liquidity:', error.message);
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
