-- Carapace Database Initialization

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS amm;
CREATE SCHEMA IF NOT EXISTS vault;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS indexer;

-- AMM Tables
CREATE TABLE IF NOT EXISTS amm.pools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pool_id VARCHAR(66) UNIQUE NOT NULL,
    token_x VARCHAR(66) NOT NULL,
    token_y VARCHAR(66) NOT NULL,
    reserve_x BIGINT NOT NULL DEFAULT 0,
    reserve_y BIGINT NOT NULL DEFAULT 0,
    lp_supply BIGINT NOT NULL DEFAULT 0,
    fee_rate INTEGER NOT NULL,
    protocol_fee INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS amm.swaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pool_id VARCHAR(66) NOT NULL,
    sender VARCHAR(66) NOT NULL,
    token_in VARCHAR(66) NOT NULL,
    token_out VARCHAR(66) NOT NULL,
    amount_in BIGINT NOT NULL,
    amount_out BIGINT NOT NULL,
    fee_amount BIGINT NOT NULL,
    tx_digest VARCHAR(66) NOT NULL,
    block_number BIGINT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS amm.liquidity_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pool_id VARCHAR(66) NOT NULL,
    provider VARCHAR(66) NOT NULL,
    event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('add', 'remove')),
    amount_x BIGINT NOT NULL,
    amount_y BIGINT NOT NULL,
    lp_amount BIGINT NOT NULL,
    tx_digest VARCHAR(66) NOT NULL,
    block_number BIGINT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vault Tables
CREATE TABLE IF NOT EXISTS vault.vaults (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vault_id VARCHAR(66) UNIQUE NOT NULL,
    underlying_token VARCHAR(66) NOT NULL,
    total_deposits BIGINT NOT NULL DEFAULT 0,
    total_shares BIGINT NOT NULL DEFAULT 0,
    performance_fee INTEGER NOT NULL,
    management_fee INTEGER NOT NULL,
    last_harvest TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vault.strategies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategy_id VARCHAR(66) UNIQUE NOT NULL,
    vault_id VARCHAR(66) NOT NULL,
    name VARCHAR(255) NOT NULL,
    protocol VARCHAR(255) NOT NULL,
    allocation_bps INTEGER NOT NULL,
    deployed_amount BIGINT NOT NULL DEFAULT 0,
    cumulative_return BIGINT NOT NULL DEFAULT 0,
    risk_level INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vault.deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vault_id VARCHAR(66) NOT NULL,
    depositor VARCHAR(66) NOT NULL,
    amount BIGINT NOT NULL,
    shares_minted BIGINT NOT NULL,
    tx_digest VARCHAR(66) NOT NULL,
    block_number BIGINT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vault.withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vault_id VARCHAR(66) NOT NULL,
    withdrawer VARCHAR(66) NOT NULL,
    shares_burned BIGINT NOT NULL,
    amount BIGINT NOT NULL,
    tx_digest VARCHAR(66) NOT NULL,
    block_number BIGINT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vault.harvests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vault_id VARCHAR(66) NOT NULL,
    strategy_id VARCHAR(66) NOT NULL,
    rewards_harvested BIGINT NOT NULL,
    gas_cost BIGINT NOT NULL,
    net_profit BIGINT NOT NULL,
    tx_digest VARCHAR(66) NOT NULL,
    block_number BIGINT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexer Tables
CREATE TABLE IF NOT EXISTS indexer.checkpoints (
    checkpoint BIGINT PRIMARY KEY,
    indexed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Tables
CREATE TABLE IF NOT EXISTS analytics.pool_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pool_id VARCHAR(66) NOT NULL,
    reserve_x BIGINT NOT NULL,
    reserve_y BIGINT NOT NULL,
    tvl_usd DECIMAL(20, 2),
    volume_24h BIGINT,
    fees_24h BIGINT,
    price DECIMAL(20, 8),
    snapshot_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics.vault_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vault_id VARCHAR(66) NOT NULL,
    total_deposits BIGINT NOT NULL,
    total_shares BIGINT NOT NULL,
    share_price DECIMAL(20, 8) NOT NULL,
    apy DECIMAL(10, 4),
    tvl_usd DECIMAL(20, 2),
    snapshot_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_swaps_pool_id ON amm.swaps(pool_id);
CREATE INDEX idx_swaps_timestamp ON amm.swaps(timestamp DESC);
CREATE INDEX idx_swaps_sender ON amm.swaps(sender);

CREATE INDEX idx_liquidity_events_pool_id ON amm.liquidity_events(pool_id);
CREATE INDEX idx_liquidity_events_provider ON amm.liquidity_events(provider);

CREATE INDEX idx_deposits_vault_id ON vault.deposits(vault_id);
CREATE INDEX idx_deposits_depositor ON vault.deposits(depositor);

CREATE INDEX idx_withdrawals_vault_id ON vault.withdrawals(vault_id);
CREATE INDEX idx_withdrawals_withdrawer ON vault.withdrawals(withdrawer);

CREATE INDEX idx_harvests_vault_id ON vault.harvests(vault_id);
CREATE INDEX idx_harvests_strategy_id ON vault.harvests(strategy_id);

CREATE INDEX idx_pool_snapshots_time ON analytics.pool_snapshots(snapshot_time DESC);
CREATE INDEX idx_vault_snapshots_time ON analytics.vault_snapshots(snapshot_time DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_amm_pools_updated_at BEFORE UPDATE ON amm.pools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vault_vaults_updated_at BEFORE UPDATE ON vault.vaults
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vault_strategies_updated_at BEFORE UPDATE ON vault.strategies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA amm TO carapace;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA vault TO carapace;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA analytics TO carapace;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA indexer TO carapace;
GRANT USAGE ON SCHEMA amm TO carapace;
GRANT USAGE ON SCHEMA vault TO carapace;
GRANT USAGE ON SCHEMA analytics TO carapace;
GRANT USAGE ON SCHEMA indexer TO carapace;
