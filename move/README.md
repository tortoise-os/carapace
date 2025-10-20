# Carapace Move Contracts

Sui Move smart contracts for TortoiseSwap AMM and TortoiseVault.

## Structure

```
move/
├── Move.toml              # Package manifest
├── sources/
│   ├── common/
│   │   └── math.move      # Shared math utilities
│   ├── amm/
│   │   └── pool.move      # AMM pool implementation
│   └── vault/
│       └── vault.move     # Vault implementation
└── tests/                 # Test files
```

## Development

### Build

```bash
# From project root
task move:build

# Or directly
cd move && sui move build
```

### Test

```bash
# Run all tests
task move:test

# Verbose output
task move:test:verbose

# With coverage
task move:test:coverage
```

### Publish

```bash
# Local network
task move:publish:local

# Testnet
task move:publish:testnet

# Mainnet (use with caution!)
task move:publish:mainnet
```

## Modules

### `carapace::math`

Common mathematical utilities:
- Square root calculation (Babylonian method)
- Safe multiplication and division
- Fee calculations with basis points
- Min/max operations

### `amm::pool`

TortoiseSwap AMM implementation:
- Constant product market maker (x * y = k)
- Liquidity provision and removal
- Token swaps (TODO)
- Dynamic fee support
- Event emissions

### `vault::vault`

TortoiseVault auto-compounder:
- Deposit/withdrawal with share tokens
- Strategy allocation (TODO)
- Performance and management fees
- Share price calculation

## Testing

All modules include comprehensive unit tests. Run tests frequently during development:

```bash
sui move test
```

## Next Steps

1. Complete AMM swap implementation
2. Add router for multi-hop swaps
3. Implement vault strategies
4. Add harvest and rebalance functions
5. Write integration tests
6. Security audit preparation
