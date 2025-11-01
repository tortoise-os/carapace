#!/usr/bin/env bun
/**
 * Debug script to inspect pool object structure
 */

import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';

const POOL_ID = '0x163fb7a120e23832f366d8ea0d3939062c6269d2797975e82e9bf7b5f9afc7e4';

const client = new SuiClient({ url: getFullnodeUrl('testnet') });

const poolObject = await client.getObject({
  id: POOL_ID,
  options: { showContent: true, showType: true },
});

console.log('\n🔍 Pool Object Structure:\n');
console.log(JSON.stringify(poolObject, null, 2));

if (poolObject.data?.content && poolObject.data.content.dataType === 'moveObject') {
  const fields = poolObject.data.content.fields as any;

  console.log('\n📊 Field Types:');
  console.log(`reserve_x type: ${typeof fields.reserve_x}`);
  console.log(`reserve_x value: ${JSON.stringify(fields.reserve_x)}`);
  console.log(`reserve_y type: ${typeof fields.reserve_y}`);
  console.log(`reserve_y value: ${JSON.stringify(fields.reserve_y)}`);
  console.log(`lp_supply type: ${typeof fields.lp_supply}`);
  console.log(`lp_supply value: ${JSON.stringify(fields.lp_supply)}`);
}
