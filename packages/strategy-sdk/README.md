# Carapace Strategy SDK

Advanced strategy tools for Carapace DeFi, including flash loans, arbitrage, and leverage strategies.

## Features

- **Flash Loans**: Borrow tokens without collateral, repay in the same transaction
- **Transaction Builders**: Composable transaction building utilities
- **Arbitrage Tools**: Execute multi-pool arbitrage strategies
- **Type-Safe**: Full TypeScript support with comprehensive types
- **Calculations**: Utilities for fee, profit, and impact calculations

## Installation

```bash
bun add @carapace/strategy-sdk
```

## Quick Start

```typescript
import { SuiClient } from '@mysten/sui/client';
import { StrategySDK } from '@carapace/strategy-sdk';

// Initialize SDK
const client = new SuiClient({ url: 'https://fullnode.testnet.sui.io:443' });
const packageId = '0x...'; // Your Carapace package ID
const sdk = new StrategySDK(client, packageId);

// Get flash loan quote
const quote = await sdk.flashLoan.getFlashLoanQuote(
  poolId,
  1000000n, // Amount to borrow
  5 // Fee in basis points
);

console.log(`Borrow: ${quote.borrowAmount}`);
console.log(`Fee: ${quote.feeAmount}`);
console.log(`Total Repayment: ${quote.totalRepayment}`);
```

## Flash Loans

### Basic Flash Loan

```typescript
import { Transaction } from '@mysten/sui/transactions';

// Execute flash loan with custom logic
const result = await sdk.flashLoan.executeFlashLoan(
  {
    poolId: '0x...pool',
    tokenType: '0x2::sui::SUI',
    amount: 1000000n,
    isTokenX: true,
  },
  (tx, borrowedCoin, receipt) => {
    // Your custom logic here
    // Must return repayment coin

    // Example: Use borrowed coins for some operation
    const [resultCoin] = tx.moveCall({
      target: `${packageId}::some_module::some_function`,
      arguments: [borrowedCoin],
    });

    return resultCoin;
  },
  senderAddress,
  { gasBudget: 100000000n }
);

console.log(`Transaction: ${result.transactionDigest}`);
console.log(`Profit: ${result.repaidAmount - result.borrowedAmount}`);
```

### Arbitrage Example

```typescript
// Execute arbitrage between two pools
const result = await sdk.flashLoan.executeArbitrage(
  borrowPoolId,
  swapPoolId,
  1000000n, // Borrow amount
  1005000n, // Minimum return amount
  true, // Borrow token X
  senderAddress,
  { gasBudget: 100000000n }
);

console.log(`Arbitrage profit: ${result.repaidAmount - result.borrowedAmount - result.feeAmount}`);
```

### Check Flash Loan Feasibility

```typescript
const canExecute = await sdk.flashLoan.canExecuteFlashLoan(
  poolId,
  1000000n,
  true // Check token X
);

if (canExecute) {
  console.log('Flash loan is feasible');
} else {
  console.log('Insufficient liquidity');
}
```

## Transaction Builders

### Build Custom Flash Loan Transaction

```typescript
import { FlashLoanBuilder } from '@carapace/strategy-sdk';

const builder = new FlashLoanBuilder(packageId);
const tx = new Transaction();

// Borrow token X
const { borrowedCoin, receipt } = builder.buildFlashBorrowX(
  tx,
  poolId,
  1000000n
);

// Your custom operations here
// ...

// Repay
builder.buildFlashRepayX(tx, poolId, repaymentCoin, receipt);

// Execute transaction
const result = await client.signAndExecuteTransaction({
  transaction: tx,
  signer: keypair,
});
```

### Build Arbitrage Transaction

```typescript
const arbTx = builder.buildArbitrageFlashLoan(
  borrowPoolId,
  swapPoolId,
  1000000n, // Borrow amount
  1005000n, // Min return
  true // Token X
);

// Execute
const result = await client.signAndExecuteTransaction({
  transaction: arbTx,
  signer: keypair,
});
```

## Utilities

### Calculate Fees and Profits

```typescript
import {
  calculateFlashLoanFee,
  calculateRepayment,
  calculateArbitrageProfit,
  isArbitrageProfitable,
  calculatePriceImpact,
} from '@carapace/strategy-sdk';

// Calculate flash loan fee
const fee = calculateFlashLoanFee(1000000n, 5); // 500

// Calculate total repayment
const repayment = calculateRepayment(1000000n, 5); // 1000500

// Calculate arbitrage profit
const profit = calculateArbitrageProfit(
  1000000n, // Amount in
  1100000n, // Amount out
  5, // Flash loan fee bps
  25 // Swap fee bps
);

// Check if profitable
const isProfitable = isArbitrageProfitable(
  1000000n,
  1100000n,
  5,
  25,
  10 // Minimum profit threshold in bps
);

// Calculate price impact
const impact = calculatePriceImpact(
  10000n, // Amount in
  100000n, // Reserve in
  200000n // Reserve out
);
console.log(`Price impact: ${impact}%`);
```

## Types

### Flash Loan Types

```typescript
import type {
  FlashLoanRequest,
  FlashLoanResult,
  FlashLoanQuote,
  FlashLoanOptions,
  FlashLoanStats,
} from '@carapace/strategy-sdk';

const request: FlashLoanRequest = {
  poolId: '0x...pool',
  tokenType: '0x2::sui::SUI',
  amount: 1000000n,
  isTokenX: true,
};

const options: FlashLoanOptions = {
  gasBudget: 100000000n,
  slippageTolerance: 50, // 0.5%
};
```

## Best Practices

1. **Always Check Liquidity**: Use `canExecuteFlashLoan()` before attempting flash loans
2. **Estimate Gas**: Flash loans require more gas than regular transactions
3. **Calculate Slippage**: Account for price impact and slippage in your calculations
4. **Test on Testnet**: Always test strategies on testnet first
5. **Monitor Gas Costs**: Flash loan profitability depends on gas costs

## Error Handling

```typescript
try {
  const result = await sdk.flashLoan.executeFlashLoan(
    request,
    callback,
    sender,
    options
  );
  console.log('Success:', result.transactionDigest);
} catch (error) {
  if (error.message.includes('Insufficient liquidity')) {
    console.error('Pool does not have enough liquidity');
  } else if (error.message.includes('EInvalidFlashSwapRepayment')) {
    console.error('Repayment amount insufficient');
  } else {
    console.error('Flash loan failed:', error);
  }
}
```

## Advanced Examples

### Multi-Pool Arbitrage

```typescript
// Find arbitrage opportunity across multiple pools
const pools = [poolA, poolB, poolC];
const amount = 1000000n;

for (const [i, borrowPool] of pools.entries()) {
  for (const [j, swapPool] of pools.entries()) {
    if (i === j) continue;

    const canExecute = await sdk.flashLoan.canExecuteFlashLoan(
      borrowPool.id,
      amount,
      true
    );

    if (canExecute) {
      // Calculate expected output
      // Execute if profitable
    }
  }
}
```

### Leveraged Position

```typescript
// Use flash loan to create leveraged position
const result = await sdk.flashLoan.executeFlashLoan(
  request,
  (tx, borrowedCoin, receipt) => {
    // 1. Add borrowed tokens to liquidity pool
    const [lpTokens] = tx.moveCall({
      target: `${packageId}::pool::add_liquidity`,
      arguments: [pool, borrowedCoin, userCoin, minLiquidity],
    });

    // 2. Use LP tokens as collateral
    // 3. Borrow against collateral
    // 4. Repay flash loan

    return repaymentCoin;
  },
  sender
);
```

## Testing

```bash
# Run tests
bun test

# Run with coverage
bun test --coverage
```

## License

MIT

## Support

For issues and questions:
- GitHub: [tortoise-os/carapace](https://github.com/tortoise-os/carapace)
- Documentation: [docs.carapace.fi](https://docs.carapace.fi)
