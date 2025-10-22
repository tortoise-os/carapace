/// TortoiseSwap AMM Pool
/// Constant product AMM (x * y = k) with dynamic fees
module carapace::pool {
    use sui::balance::{Self, Balance, Supply};
    use sui::coin::{Self, Coin};
    use sui::object;
    use sui::transfer;
    use sui::tx_context::TxContext;
    use carapace::math;

    /// Error codes
    const EInsufficientLiquidity: u64 = 0;
    const ESlippageExceeded: u64 = 2;
    const EInvalidFeeRate: u64 = 3;
    const EZeroAmount: u64 = 4;

    /// Minimum liquidity locked forever
    const MINIMUM_LIQUIDITY: u64 = 1000;

    /// Fee bounds (in basis points)
    const MIN_FEE_BPS: u64 = 20;   // 0.20%
    const MAX_FEE_BPS: u64 = 40;   // 0.40%

    /// Default fee
    const DEFAULT_FEE_BPS: u64 = 25;  // 0.25%

    /// Protocol fee (% of swap fees)
    const DEFAULT_PROTOCOL_FEE_BPS: u64 = 1667;  // 16.67% (1/6)

    /// Liquidity Pool
    public struct Pool<phantom X, phantom Y> has key {
        id: object::UID,
        reserve_x: Balance<X>,
        reserve_y: Balance<Y>,
        lp_supply: Supply<LP<X, Y>>,
        fee_bps: u64,
        protocol_fee_bps: u64,
        protocol_fee_x: Balance<X>,
        protocol_fee_y: Balance<Y>,
    }

    /// LP Token type
    public struct LP<phantom X, phantom Y> has drop {}

    /// Pool creation event
    public struct PoolCreated<phantom X, phantom Y> has copy, drop {
        pool_id: object::ID,
        fee_bps: u64,
    }

    /// Liquidity added event
    public struct LiquidityAdded<phantom X, phantom Y> has copy, drop {
        pool_id: object::ID,
        amount_x: u64,
        amount_y: u64,
        liquidity: u64,
    }

    /// Liquidity removed event
    public struct LiquidityRemoved<phantom X, phantom Y> has copy, drop {
        pool_id: object::ID,
        amount_x: u64,
        amount_y: u64,
        liquidity: u64,
    }

    /// Swap event
    public struct Swapped<phantom X, phantom Y> has copy, drop {
        pool_id: object::ID,
        amount_in: u64,
        amount_out: u64,
        is_x_to_y: bool,
        fee_amount: u64,
    }

    /// Create a new liquidity pool and share it
    public fun create_pool<X, Y>(
        ctx: &mut TxContext
    ) {
        let pool = Pool<X, Y> {
            id: object::new(ctx),
            reserve_x: balance::zero(),
            reserve_y: balance::zero(),
            lp_supply: balance::create_supply(LP<X, Y> {}),
            fee_bps: DEFAULT_FEE_BPS,
            protocol_fee_bps: DEFAULT_PROTOCOL_FEE_BPS,
            protocol_fee_x: balance::zero(),
            protocol_fee_y: balance::zero(),
        };

        sui::event::emit(PoolCreated<X, Y> {
            pool_id: object::uid_to_inner(&pool.id),
            fee_bps: DEFAULT_FEE_BPS,
        });

        transfer::share_object(pool);
    }

    /// Add liquidity to the pool
    /// Returns LP tokens representing the share of the pool
    public fun add_liquidity<X, Y>(
        pool: &mut Pool<X, Y>,
        coin_x: Coin<X>,
        coin_y: Coin<Y>,
        min_liquidity: u64,
        ctx: &mut TxContext
    ): Coin<LP<X, Y>> {
        let amount_x = coin::value(&coin_x);
        let amount_y = coin::value(&coin_y);

        assert!(amount_x > 0 && amount_y > 0, EZeroAmount);

        let reserve_x = balance::value(&pool.reserve_x);
        let reserve_y = balance::value(&pool.reserve_y);
        let lp_supply = balance::supply_value(&pool.lp_supply);

        let liquidity = if (lp_supply == 0) {
            // Initial liquidity
            let initial_liquidity = math::sqrt(amount_x * amount_y);
            assert!(initial_liquidity > MINIMUM_LIQUIDITY, EInsufficientLiquidity);

            // Lock minimum liquidity forever by burning it
            let min_liq_balance = balance::increase_supply(&mut pool.lp_supply, MINIMUM_LIQUIDITY);
            balance::decrease_supply(&mut pool.lp_supply, min_liq_balance);
            initial_liquidity - MINIMUM_LIQUIDITY
        } else {
            // Subsequent liquidity
            let liquidity_x = math::mul_div(amount_x, lp_supply, reserve_x);
            let liquidity_y = math::mul_div(amount_y, lp_supply, reserve_y);
            math::min(liquidity_x, liquidity_y)
        };

        assert!(liquidity >= min_liquidity, ESlippageExceeded);
        assert!(liquidity > 0, EInsufficientLiquidity);

        // Add to reserves
        balance::join(&mut pool.reserve_x, coin::into_balance(coin_x));
        balance::join(&mut pool.reserve_y, coin::into_balance(coin_y));

        // Mint LP tokens
        let lp_balance = balance::increase_supply(&mut pool.lp_supply, liquidity);

        sui::event::emit(LiquidityAdded<X, Y> {
            pool_id: object::uid_to_inner(&pool.id),
            amount_x,
            amount_y,
            liquidity,
        });

        coin::from_balance(lp_balance, ctx)
    }

    /// Remove liquidity from the pool
    /// Burns LP tokens and returns proportional amounts of both tokens
    public fun remove_liquidity<X, Y>(
        pool: &mut Pool<X, Y>,
        lp_token: Coin<LP<X, Y>>,
        min_amount_x: u64,
        min_amount_y: u64,
        ctx: &mut TxContext
    ): (Coin<X>, Coin<Y>) {
        let liquidity = coin::value(&lp_token);
        assert!(liquidity > 0, EZeroAmount);

        let reserve_x = balance::value(&pool.reserve_x);
        let reserve_y = balance::value(&pool.reserve_y);
        let lp_supply = balance::supply_value(&pool.lp_supply);

        let amount_x = math::mul_div(liquidity, reserve_x, lp_supply);
        let amount_y = math::mul_div(liquidity, reserve_y, lp_supply);

        assert!(amount_x >= min_amount_x && amount_y >= min_amount_y, ESlippageExceeded);
        assert!(amount_x > 0 && amount_y > 0, EInsufficientLiquidity);

        // Burn LP tokens
        balance::decrease_supply(&mut pool.lp_supply, coin::into_balance(lp_token));

        // Withdraw from reserves
        let balance_x = balance::split(&mut pool.reserve_x, amount_x);
        let balance_y = balance::split(&mut pool.reserve_y, amount_y);

        sui::event::emit(LiquidityRemoved<X, Y> {
            pool_id: object::uid_to_inner(&pool.id),
            amount_x,
            amount_y,
            liquidity,
        });

        (coin::from_balance(balance_x, ctx), coin::from_balance(balance_y, ctx))
    }

    /// Swap token X for token Y
    /// Uses constant product formula: x * y = k
    /// Takes a fee from the input amount before applying to reserves
    public fun swap_x_to_y<X, Y>(
        pool: &mut Pool<X, Y>,
        coin_x: Coin<X>,
        min_amount_out: u64,
        ctx: &mut TxContext
    ): Coin<Y> {
        let amount_in = coin::value(&coin_x);
        assert!(amount_in > 0, EZeroAmount);

        let reserve_x = balance::value(&pool.reserve_x);
        let reserve_y = balance::value(&pool.reserve_y);

        // Calculate amount out using constant product formula
        let amount_out = get_amount_out(amount_in, reserve_x, reserve_y, pool.fee_bps);
        assert!(amount_out >= min_amount_out, ESlippageExceeded);
        assert!(amount_out > 0 && amount_out < reserve_y, EInsufficientLiquidity);

        // Calculate fees
        let swap_fee = math::apply_fee(amount_in, pool.fee_bps);
        let protocol_fee = math::apply_fee(swap_fee, pool.protocol_fee_bps);
        let _lp_fee = swap_fee - protocol_fee; // Fee that stays in pool for LPs

        // Add input to reserve (full amount including fees)
        balance::join(&mut pool.reserve_x, coin::into_balance(coin_x));

        // Collect protocol fee (in input token X)
        if (protocol_fee > 0) {
            let fee_balance = balance::split(&mut pool.reserve_x, protocol_fee);
            balance::join(&mut pool.protocol_fee_x, fee_balance);
        };

        // Remove output from reserve
        let balance_out = balance::split(&mut pool.reserve_y, amount_out);

        sui::event::emit(Swapped<X, Y> {
            pool_id: object::uid_to_inner(&pool.id),
            amount_in,
            amount_out,
            is_x_to_y: true,
            fee_amount: swap_fee,
        });

        coin::from_balance(balance_out, ctx)
    }

    /// Swap token Y for token X
    /// Uses constant product formula: x * y = k
    /// Takes a fee from the input amount before applying to reserves
    public fun swap_y_to_x<X, Y>(
        pool: &mut Pool<X, Y>,
        coin_y: Coin<Y>,
        min_amount_out: u64,
        ctx: &mut TxContext
    ): Coin<X> {
        let amount_in = coin::value(&coin_y);
        assert!(amount_in > 0, EZeroAmount);

        let reserve_x = balance::value(&pool.reserve_x);
        let reserve_y = balance::value(&pool.reserve_y);

        // Calculate amount out using constant product formula
        let amount_out = get_amount_out(amount_in, reserve_y, reserve_x, pool.fee_bps);
        assert!(amount_out >= min_amount_out, ESlippageExceeded);
        assert!(amount_out > 0 && amount_out < reserve_x, EInsufficientLiquidity);

        // Calculate fees
        let swap_fee = math::apply_fee(amount_in, pool.fee_bps);
        let protocol_fee = math::apply_fee(swap_fee, pool.protocol_fee_bps);
        let _lp_fee = swap_fee - protocol_fee; // Fee that stays in pool for LPs

        // Add input to reserve (full amount including fees)
        balance::join(&mut pool.reserve_y, coin::into_balance(coin_y));

        // Collect protocol fee (in input token Y)
        if (protocol_fee > 0) {
            let fee_balance = balance::split(&mut pool.reserve_y, protocol_fee);
            balance::join(&mut pool.protocol_fee_y, fee_balance);
        };

        // Remove output from reserve
        let balance_out = balance::split(&mut pool.reserve_x, amount_out);

        sui::event::emit(Swapped<X, Y> {
            pool_id: object::uid_to_inner(&pool.id),
            amount_in,
            amount_out,
            is_x_to_y: false,
            fee_amount: swap_fee,
        });

        coin::from_balance(balance_out, ctx)
    }

    /// Calculate output amount for a given input using constant product formula
    /// Formula: amount_out = (amount_in * reserve_out) / (reserve_in + amount_in)
    /// Accounts for fees by using amount_in_after_fee
    public fun get_amount_out(
        amount_in: u64,
        reserve_in: u64,
        reserve_out: u64,
        fee_bps: u64
    ): u64 {
        assert!(amount_in > 0, EZeroAmount);
        assert!(reserve_in > 0 && reserve_out > 0, EInsufficientLiquidity);

        // Calculate input amount after fee
        let fee = math::apply_fee(amount_in, fee_bps);
        let amount_in_after_fee = amount_in - fee;

        // Constant product formula: (reserve_in + amount_in_after_fee) * (reserve_out - amount_out) = k
        // Therefore: amount_out = (amount_in_after_fee * reserve_out) / (reserve_in + amount_in_after_fee)
        let numerator = (amount_in_after_fee as u128) * (reserve_out as u128);
        let denominator = (reserve_in as u128) + (amount_in_after_fee as u128);
        ((numerator / denominator) as u64)
    }

    /// Calculate input amount needed for a desired output
    /// Formula: amount_in = (reserve_in * amount_out) / (reserve_out - amount_out)
    /// Accounts for fees
    public fun get_amount_in(
        amount_out: u64,
        reserve_in: u64,
        reserve_out: u64,
        fee_bps: u64
    ): u64 {
        assert!(amount_out > 0, EZeroAmount);
        assert!(reserve_in > 0 && reserve_out > amount_out, EInsufficientLiquidity);

        // Constant product formula: (reserve_in + amount_in) * (reserve_out - amount_out) = k
        // Therefore: amount_in_before_fee = (reserve_in * amount_out) / (reserve_out - amount_out)
        let numerator = (reserve_in as u128) * (amount_out as u128);
        let denominator = (reserve_out as u128) - (amount_out as u128);
        let amount_in_before_fee = ((numerator / denominator) as u64) + 1; // Round up

        // Add fee: amount_in = amount_in_before_fee / (1 - fee_rate)
        let bps = math::bps_denominator();
        math::mul_div(amount_in_before_fee, bps, bps - fee_bps) + 1 // Round up
    }

    /// Get pool reserves
    public fun get_reserves<X, Y>(pool: &Pool<X, Y>): (u64, u64) {
        (balance::value(&pool.reserve_x), balance::value(&pool.reserve_y))
    }

    /// Get LP token supply
    public fun get_lp_supply<X, Y>(pool: &Pool<X, Y>): u64 {
        balance::supply_value(&pool.lp_supply)
    }

    /// Get pool fee
    public fun get_fee_bps<X, Y>(pool: &Pool<X, Y>): u64 {
        pool.fee_bps
    }

    /// Get current spot price (Y per X)
    /// Returns price scaled by 1e9 for precision
    public fun get_spot_price<X, Y>(pool: &Pool<X, Y>): u64 {
        let reserve_x = balance::value(&pool.reserve_x);
        let reserve_y = balance::value(&pool.reserve_y);

        assert!(reserve_x > 0 && reserve_y > 0, EInsufficientLiquidity);

        // Price = reserve_y / reserve_x, scaled by 1e9
        math::mul_div(reserve_y, 1_000_000_000, reserve_x)
    }

    /// Update pool fee (admin function, would need admin capability in production)
    public fun update_fee<X, Y>(
        pool: &mut Pool<X, Y>,
        new_fee_bps: u64,
    ) {
        assert!(new_fee_bps >= MIN_FEE_BPS && new_fee_bps <= MAX_FEE_BPS, EInvalidFeeRate);
        pool.fee_bps = new_fee_bps;
    }

    /// Get protocol fees collected
    public fun get_protocol_fees<X, Y>(pool: &Pool<X, Y>): (u64, u64) {
        (
            balance::value(&pool.protocol_fee_x),
            balance::value(&pool.protocol_fee_y)
        )
    }
}
