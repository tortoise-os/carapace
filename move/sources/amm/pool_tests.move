/// Comprehensive tests for TortoiseSwap AMM
#[test_only]
module carapace::pool_tests {
    use sui::test_scenario::{Self as test, ctx, next_tx, take_shared, return_shared};
    use sui::coin::{Self, mint_for_testing};
    use carapace::pool::{Self, Pool};
    use carapace::math;

    public struct TokenA has drop {}
    public struct TokenB has drop {}

    const DEFAULT_FEE_BPS: u64 = 25;
    const MINIMUM_LIQUIDITY: u64 = 1000;

    #[test]
    fun test_create_pool() {
        let mut scenario = test::begin(@0xCAFE);
        {
            pool::create_pool_for_testing<TokenA, TokenB>(ctx(&mut scenario));
        };
        next_tx(&mut scenario, @0xCAFE);
        {
            let pool = take_shared<Pool<TokenA, TokenB>>(&scenario);
            let (reserve_a, reserve_b) = pool::get_reserves(&pool);
            assert!(reserve_a == 0, 0);
            assert!(reserve_b == 0, 0);
            assert!(pool::get_lp_supply(&pool) == 0, 1);
            assert!(pool::get_fee_bps(&pool) == DEFAULT_FEE_BPS, 2);
            return_shared(pool);
        };
        test::end(scenario);
    }

    #[test]
    fun test_add_initial_liquidity() {
        let mut scenario = test::begin(@0xCAFE);
        {
            pool::create_pool_for_testing<TokenA, TokenB>(ctx(&mut scenario));
        };
        next_tx(&mut scenario, @0xCAFE);
        {
            let mut pool = take_shared<Pool<TokenA, TokenB>>(&scenario);
            let coin_a = mint_for_testing<TokenA>(100_000, ctx(&mut scenario));
            let coin_b = mint_for_testing<TokenB>(200_000, ctx(&mut scenario));

            let lp_token = pool::add_liquidity(
                &mut pool,
                coin_a,
                coin_b,
                0,
                ctx(&mut scenario)
            );

            // Check LP tokens: sqrt(100_000 * 200_000) - MINIMUM_LIQUIDITY
            let expected_lp = math::sqrt(100_000 * 200_000) - MINIMUM_LIQUIDITY;
            assert!(coin::value(&lp_token) == expected_lp, 0);

            let (reserve_a, reserve_b) = pool::get_reserves(&pool);
            assert!(reserve_a == 100_000, 1);
            assert!(reserve_b == 200_000, 2);

            coin::burn_for_testing(lp_token);
            return_shared(pool);
        };
        test::end(scenario);
    }

    #[test]
    fun test_add_subsequent_liquidity() {
        let mut scenario = test::begin(@0xCAFE);
        {
            pool::create_pool_for_testing<TokenA, TokenB>(ctx(&mut scenario));
        };
        next_tx(&mut scenario, @0xCAFE);
        {
            let mut pool = take_shared<Pool<TokenA, TokenB>>(&scenario);

            // Initial liquidity
            let coin_a1 = mint_for_testing<TokenA>(100_000, ctx(&mut scenario));
            let coin_b1 = mint_for_testing<TokenB>(200_000, ctx(&mut scenario));
            let lp_token1 = pool::add_liquidity(&mut pool, coin_a1, coin_b1, 0, ctx(&mut scenario));

            // Add more liquidity (same ratio)
            let coin_a2 = mint_for_testing<TokenA>(50_000, ctx(&mut scenario));
            let coin_b2 = mint_for_testing<TokenB>(100_000, ctx(&mut scenario));
            let lp_token2 = pool::add_liquidity(&mut pool, coin_a2, coin_b2, 0, ctx(&mut scenario));

            // LP tokens should be proportional: 50% more liquidity ~= 50% more LP tokens
            // Note: Small difference due to minimum liquidity locked in first deposit
            let lp1_value = coin::value(&lp_token1);
            let lp2_value = coin::value(&lp_token2);
            // Allow small tolerance for minimum liquidity effect
            assert!(lp2_value * 2 >= lp1_value - 10 && lp2_value * 2 <= lp1_value + 10, 0);

            coin::burn_for_testing(lp_token1);
            coin::burn_for_testing(lp_token2);
            return_shared(pool);
        };
        test::end(scenario);
    }

    #[test]
    fun test_remove_liquidity() {
        let mut scenario = test::begin(@0xCAFE);
        {
            pool::create_pool_for_testing<TokenA, TokenB>(ctx(&mut scenario));
        };
        next_tx(&mut scenario, @0xCAFE);
        {
            let mut pool = take_shared<Pool<TokenA, TokenB>>(&scenario);

            // Add liquidity
            let coin_a = mint_for_testing<TokenA>(100_000, ctx(&mut scenario));
            let coin_b = mint_for_testing<TokenB>(200_000, ctx(&mut scenario));
            let lp_token = pool::add_liquidity(&mut pool, coin_a, coin_b, 0, ctx(&mut scenario));

            // Remove all liquidity
            let (coin_a_out, coin_b_out) = pool::remove_liquidity(
                &mut pool,
                lp_token,
                0,
                0,
                ctx(&mut scenario)
            );

            // Should get back proportional amounts (minus minimum liquidity locked)
            assert!(coin::value(&coin_a_out) > 99_000, 0); // ~99,900
            assert!(coin::value(&coin_b_out) > 199_000, 1); // ~199,800

            coin::burn_for_testing(coin_a_out);
            coin::burn_for_testing(coin_b_out);
            return_shared(pool);
        };
        test::end(scenario);
    }

    #[test]
    fun test_swap_exact_amount() {
        let mut scenario = test::begin(@0xCAFE);
        {
            pool::create_pool_for_testing<TokenA, TokenB>(ctx(&mut scenario));
        };
        next_tx(&mut scenario, @0xCAFE);
        {
            let mut pool = take_shared<Pool<TokenA, TokenB>>(&scenario);

            // Add liquidity: 100k A, 200k B (price: 2 B per A)
            let coin_a = mint_for_testing<TokenA>(100_000, ctx(&mut scenario));
            let coin_b = mint_for_testing<TokenB>(200_000, ctx(&mut scenario));
            let lp_token = pool::add_liquidity(&mut pool, coin_a, coin_b, 0, ctx(&mut scenario));

            // Swap 1000 A for B
            let swap_in = mint_for_testing<TokenA>(1_000, ctx(&mut scenario));
            let amount_out = pool::get_amount_out(1_000, 100_000, 200_000, DEFAULT_FEE_BPS);

            let coin_b_out = pool::swap_x_to_y(
                &mut pool,
                swap_in,
                0,
                ctx(&mut scenario)
            );

            // Verify output matches calculation
            assert!(coin::value(&coin_b_out) == amount_out, 0);

            // Verify reserves updated correctly
            let (reserve_a, reserve_b) = pool::get_reserves(&pool);

            // Reserve A should increase by input amount minus protocol fee
            assert!(reserve_a > 100_000, 1);
            // Reserve B should decrease by output amount
            assert!(reserve_b == 200_000 - amount_out, 2);

            coin::burn_for_testing(lp_token);
            coin::burn_for_testing(coin_b_out);
            return_shared(pool);
        };
        test::end(scenario);
    }

    #[test]
    fun test_swap_maintains_k() {
        let mut scenario = test::begin(@0xCAFE);
        {
            pool::create_pool_for_testing<TokenA, TokenB>(ctx(&mut scenario));
        };
        next_tx(&mut scenario, @0xCAFE);
        {
            let mut pool = take_shared<Pool<TokenA, TokenB>>(&scenario);

            // Add liquidity
            let coin_a = mint_for_testing<TokenA>(100_000, ctx(&mut scenario));
            let coin_b = mint_for_testing<TokenB>(100_000, ctx(&mut scenario));
            let lp_token = pool::add_liquidity(&mut pool, coin_a, coin_b, 0, ctx(&mut scenario));

            let (r_a_before, r_b_before) = pool::get_reserves(&pool);
            let k_before = (r_a_before as u128) * (r_b_before as u128);

            // Perform swap
            let swap_in = mint_for_testing<TokenA>(1_000, ctx(&mut scenario));
            let coin_b_out = pool::swap_x_to_y(&mut pool, swap_in, 0, ctx(&mut scenario));

            let (r_a_after, r_b_after) = pool::get_reserves(&pool);
            let k_after = (r_a_after as u128) * (r_b_after as u128);

            // k should increase slightly due to fees going to LP
            assert!(k_after > k_before, 0);

            coin::burn_for_testing(lp_token);
            coin::burn_for_testing(coin_b_out);
            return_shared(pool);
        };
        test::end(scenario);
    }

    #[test]
    fun test_get_amount_out_calculation() {
        // With 0.25% fee (25 bps):
        // Input: 1000, Reserve_in: 100_000, Reserve_out: 200_000
        // Fee: 1000 * 25 / 10000 = 2.5 ≈ 2
        // Amount after fee: 1000 - 2 = 998
        // Amount out: (998 * 200_000) / (100_000 + 998) = 1976

        let amount_out = pool::get_amount_out(1_000, 100_000, 200_000, 25);
        assert!(amount_out > 1970 && amount_out < 1980, 0);
    }

    #[test]
    fun test_get_amount_in_calculation() {
        // Reverse calculation should give approximately the same result
        let amount_out = 1976;
        let amount_in = pool::get_amount_in(amount_out, 100_000, 200_000, 25);

        // Should be close to 1000 (may be slightly higher due to rounding)
        assert!(amount_in >= 1_000 && amount_in <= 1_005, 0);
    }

    #[test]
    fun test_spot_price() {
        let mut scenario = test::begin(@0xCAFE);
        {
            pool::create_pool_for_testing<TokenA, TokenB>(ctx(&mut scenario));
        };
        next_tx(&mut scenario, @0xCAFE);
        {
            let mut pool = take_shared<Pool<TokenA, TokenB>>(&scenario);

            // Add liquidity: 100k A, 200k B (price: 2 B per A)
            let coin_a = mint_for_testing<TokenA>(100_000, ctx(&mut scenario));
            let coin_b = mint_for_testing<TokenB>(200_000, ctx(&mut scenario));
            let lp_token = pool::add_liquidity(&mut pool, coin_a, coin_b, 0, ctx(&mut scenario));

            let price = pool::get_spot_price<TokenA, TokenB>(&pool);
            // Price should be 2 (scaled by 1e9) = 2_000_000_000
            assert!(price == 2_000_000_000, 0);

            coin::burn_for_testing(lp_token);
            return_shared(pool);
        };
        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = carapace::pool::ESlippageExceeded)]
    fun test_swap_slippage_protection() {
        let mut scenario = test::begin(@0xCAFE);
        {
            pool::create_pool_for_testing<TokenA, TokenB>(ctx(&mut scenario));
        };
        next_tx(&mut scenario, @0xCAFE);
        {
            let mut pool = take_shared<Pool<TokenA, TokenB>>(&scenario);

            let coin_a = mint_for_testing<TokenA>(100_000, ctx(&mut scenario));
            let coin_b = mint_for_testing<TokenB>(200_000, ctx(&mut scenario));
            let lp_token = pool::add_liquidity(&mut pool, coin_a, coin_b, 0, ctx(&mut scenario));

            let swap_in = mint_for_testing<TokenA>(1_000, ctx(&mut scenario));

            // Set min_amount_out too high, should fail
            let coin_b_out = pool::swap_x_to_y(
                &mut pool,
                swap_in,
                10_000, // Unreasonably high
                ctx(&mut scenario)
            );

            coin::burn_for_testing(lp_token);
            coin::burn_for_testing(coin_b_out);
            return_shared(pool);
        };
        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = carapace::pool::EZeroAmount)]
    fun test_swap_zero_amount() {
        let mut scenario = test::begin(@0xCAFE);
        {
            pool::create_pool_for_testing<TokenA, TokenB>(ctx(&mut scenario));
        };
        next_tx(&mut scenario, @0xCAFE);
        {
            let mut pool = take_shared<Pool<TokenA, TokenB>>(&scenario);

            let coin_a = mint_for_testing<TokenA>(100_000, ctx(&mut scenario));
            let coin_b = mint_for_testing<TokenB>(200_000, ctx(&mut scenario));
            let lp_token = pool::add_liquidity(&mut pool, coin_a, coin_b, 0, ctx(&mut scenario));

            let swap_in = mint_for_testing<TokenA>(0, ctx(&mut scenario));
            let coin_b_out = pool::swap_x_to_y(&mut pool, swap_in, 0, ctx(&mut scenario));

            coin::burn_for_testing(lp_token);
            coin::burn_for_testing(coin_b_out);
            return_shared(pool);
        };
        test::end(scenario);
    }

    // ========== Emergency Pause Tests ==========

    #[test]
    fun test_pause_and_unpause() {
        let mut scenario = test::begin(@0xCAFE);
        {
            pool::create_pool_for_testing<TokenA, TokenB>(ctx(&mut scenario));
        };
        next_tx(&mut scenario, @0xCAFE);
        {
            use carapace::pool::AdminCap;
            let mut pool = take_shared<Pool<TokenA, TokenB>>(&scenario);
            let admin_cap = test::take_from_sender<AdminCap>(&scenario);

            // Pool should start unpaused
            assert!(!pool::is_paused<TokenA, TokenB>(&pool), 0);

            // Pause the pool
            pool::pause(&mut pool, &admin_cap);
            assert!(pool::is_paused<TokenA, TokenB>(&pool), 1);

            // Unpause the pool
            pool::unpause(&mut pool, &admin_cap);
            assert!(!pool::is_paused<TokenA, TokenB>(&pool), 2);

            test::return_to_sender(&scenario, admin_cap);
            return_shared(pool);
        };
        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = carapace::pool::EPoolPaused)]
    fun test_add_liquidity_when_paused() {
        let mut scenario = test::begin(@0xCAFE);
        {
            pool::create_pool_for_testing<TokenA, TokenB>(ctx(&mut scenario));
        };
        next_tx(&mut scenario, @0xCAFE);
        {
            use carapace::pool::AdminCap;
            let mut pool = take_shared<Pool<TokenA, TokenB>>(&scenario);
            let admin_cap = test::take_from_sender<AdminCap>(&scenario);

            // Pause the pool
            pool::pause(&mut pool, &admin_cap);

            // Try to add liquidity (should fail)
            let coin_a = mint_for_testing<TokenA>(100_000, ctx(&mut scenario));
            let coin_b = mint_for_testing<TokenB>(200_000, ctx(&mut scenario));
            let lp_token = pool::add_liquidity(&mut pool, coin_a, coin_b, 0, ctx(&mut scenario));

            coin::burn_for_testing(lp_token);
            test::return_to_sender(&scenario, admin_cap);
            return_shared(pool);
        };
        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = carapace::pool::EPoolPaused)]
    fun test_remove_liquidity_when_paused() {
        let mut scenario = test::begin(@0xCAFE);
        {
            pool::create_pool_for_testing<TokenA, TokenB>(ctx(&mut scenario));
        };
        next_tx(&mut scenario, @0xCAFE);
        {
            use carapace::pool::AdminCap;
            let mut pool = take_shared<Pool<TokenA, TokenB>>(&scenario);
            let admin_cap = test::take_from_sender<AdminCap>(&scenario);

            // Add liquidity first
            let coin_a = mint_for_testing<TokenA>(100_000, ctx(&mut scenario));
            let coin_b = mint_for_testing<TokenB>(200_000, ctx(&mut scenario));
            let lp_token = pool::add_liquidity(&mut pool, coin_a, coin_b, 0, ctx(&mut scenario));

            // Pause the pool
            pool::pause(&mut pool, &admin_cap);

            // Try to remove liquidity (should fail)
            let (coin_a_out, coin_b_out) = pool::remove_liquidity(&mut pool, lp_token, 0, 0, ctx(&mut scenario));

            coin::burn_for_testing(coin_a_out);
            coin::burn_for_testing(coin_b_out);
            test::return_to_sender(&scenario, admin_cap);
            return_shared(pool);
        };
        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = carapace::pool::EPoolPaused)]
    fun test_swap_x_to_y_when_paused() {
        let mut scenario = test::begin(@0xCAFE);
        {
            pool::create_pool_for_testing<TokenA, TokenB>(ctx(&mut scenario));
        };
        next_tx(&mut scenario, @0xCAFE);
        {
            use carapace::pool::AdminCap;
            let mut pool = take_shared<Pool<TokenA, TokenB>>(&scenario);
            let admin_cap = test::take_from_sender<AdminCap>(&scenario);

            // Add liquidity first
            let coin_a = mint_for_testing<TokenA>(100_000, ctx(&mut scenario));
            let coin_b = mint_for_testing<TokenB>(200_000, ctx(&mut scenario));
            let lp_token = pool::add_liquidity(&mut pool, coin_a, coin_b, 0, ctx(&mut scenario));

            // Pause the pool
            pool::pause(&mut pool, &admin_cap);

            // Try to swap (should fail)
            let swap_in = mint_for_testing<TokenA>(1_000, ctx(&mut scenario));
            let coin_b_out = pool::swap_x_to_y(&mut pool, swap_in, 0, ctx(&mut scenario));

            coin::burn_for_testing(lp_token);
            coin::burn_for_testing(coin_b_out);
            test::return_to_sender(&scenario, admin_cap);
            return_shared(pool);
        };
        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = carapace::pool::EPoolPaused)]
    fun test_swap_y_to_x_when_paused() {
        let mut scenario = test::begin(@0xCAFE);
        {
            pool::create_pool_for_testing<TokenA, TokenB>(ctx(&mut scenario));
        };
        next_tx(&mut scenario, @0xCAFE);
        {
            use carapace::pool::AdminCap;
            let mut pool = take_shared<Pool<TokenA, TokenB>>(&scenario);
            let admin_cap = test::take_from_sender<AdminCap>(&scenario);

            // Add liquidity first
            let coin_a = mint_for_testing<TokenA>(100_000, ctx(&mut scenario));
            let coin_b = mint_for_testing<TokenB>(200_000, ctx(&mut scenario));
            let lp_token = pool::add_liquidity(&mut pool, coin_a, coin_b, 0, ctx(&mut scenario));

            // Pause the pool
            pool::pause(&mut pool, &admin_cap);

            // Try to swap (should fail)
            let swap_in = mint_for_testing<TokenB>(1_000, ctx(&mut scenario));
            let coin_a_out = pool::swap_y_to_x(&mut pool, swap_in, 0, ctx(&mut scenario));

            coin::burn_for_testing(lp_token);
            coin::burn_for_testing(coin_a_out);
            test::return_to_sender(&scenario, admin_cap);
            return_shared(pool);
        };
        test::end(scenario);
    }

    #[test]
    fun test_operations_work_after_unpause() {
        let mut scenario = test::begin(@0xCAFE);
        {
            pool::create_pool_for_testing<TokenA, TokenB>(ctx(&mut scenario));
        };
        next_tx(&mut scenario, @0xCAFE);
        {
            use carapace::pool::AdminCap;
            let mut pool = take_shared<Pool<TokenA, TokenB>>(&scenario);
            let admin_cap = test::take_from_sender<AdminCap>(&scenario);

            // Add initial liquidity
            let coin_a1 = mint_for_testing<TokenA>(100_000, ctx(&mut scenario));
            let coin_b1 = mint_for_testing<TokenB>(200_000, ctx(&mut scenario));
            let lp_token1 = pool::add_liquidity(&mut pool, coin_a1, coin_b1, 0, ctx(&mut scenario));

            // Pause the pool
            pool::pause(&mut pool, &admin_cap);
            assert!(pool::is_paused<TokenA, TokenB>(&pool), 0);

            // Unpause the pool
            pool::unpause(&mut pool, &admin_cap);
            assert!(!pool::is_paused<TokenA, TokenB>(&pool), 1);

            // All operations should work now

            // Test add liquidity
            let coin_a2 = mint_for_testing<TokenA>(50_000, ctx(&mut scenario));
            let coin_b2 = mint_for_testing<TokenB>(100_000, ctx(&mut scenario));
            let lp_token2 = pool::add_liquidity(&mut pool, coin_a2, coin_b2, 0, ctx(&mut scenario));

            // Test swap
            let swap_in = mint_for_testing<TokenA>(1_000, ctx(&mut scenario));
            let coin_b_out = pool::swap_x_to_y(&mut pool, swap_in, 0, ctx(&mut scenario));

            // Test remove liquidity
            let (coin_a_out, coin_b_out2) = pool::remove_liquidity(&mut pool, lp_token2, 0, 0, ctx(&mut scenario));

            coin::burn_for_testing(lp_token1);
            coin::burn_for_testing(coin_b_out);
            coin::burn_for_testing(coin_a_out);
            coin::burn_for_testing(coin_b_out2);
            test::return_to_sender(&scenario, admin_cap);
            return_shared(pool);
        };
        test::end(scenario);
    }

    // ========== Flash Swap Tests ==========

    #[test]
    fun test_flash_swap_basic() {
        let mut scenario = test::begin(@0xCAFE);
        {
            pool::create_pool_for_testing<TokenA, TokenB>(ctx(&mut scenario));
        };
        next_tx(&mut scenario, @0xCAFE);
        {
            let mut pool = take_shared<Pool<TokenA, TokenB>>(&scenario);

            // Add liquidity
            let coin_a = mint_for_testing<TokenA>(100_000, ctx(&mut scenario));
            let coin_b = mint_for_testing<TokenB>(200_000, ctx(&mut scenario));
            let lp_token = pool::add_liquidity(&mut pool, coin_a, coin_b, 0, ctx(&mut scenario));

            // Flash swap: borrow 10,000 of token A
            let (borrowed_a, borrowed_b, receipt) = pool::flash_swap(
                &mut pool,
                10_000,
                0,
                ctx(&mut scenario)
            );

            // Borrowed amount should be 10,000
            assert!(coin::value(&borrowed_a) == 10_000, 0);
            assert!(coin::value(&borrowed_b) == 0, 1);

            // Prepare repayment (borrowed + fee)
            // Fee: 10,000 * 25 / 10000 = 25
            let repay_amount = 10_000 + 25;
            let repay_a = mint_for_testing<TokenA>(repay_amount, ctx(&mut scenario));
            let repay_b = mint_for_testing<TokenB>(0, ctx(&mut scenario));

            // Use the borrowed coins (in this test, we just burn them)
            coin::burn_for_testing(borrowed_a);
            coin::burn_for_testing(borrowed_b);

            // Repay flash swap
            pool::repay_flash_swap(&mut pool, repay_a, repay_b, receipt);

            coin::burn_for_testing(lp_token);
            return_shared(pool);
        };
        test::end(scenario);
    }

    #[test]
    fun test_flash_swap_both_tokens() {
        let mut scenario = test::begin(@0xCAFE);
        {
            pool::create_pool_for_testing<TokenA, TokenB>(ctx(&mut scenario));
        };
        next_tx(&mut scenario, @0xCAFE);
        {
            let mut pool = take_shared<Pool<TokenA, TokenB>>(&scenario);

            // Add liquidity
            let coin_a = mint_for_testing<TokenA>(100_000, ctx(&mut scenario));
            let coin_b = mint_for_testing<TokenB>(200_000, ctx(&mut scenario));
            let lp_token = pool::add_liquidity(&mut pool, coin_a, coin_b, 0, ctx(&mut scenario));

            // Flash swap: borrow both tokens
            let (borrowed_a, borrowed_b, receipt) = pool::flash_swap(
                &mut pool,
                5_000,
                10_000,
                ctx(&mut scenario)
            );

            assert!(coin::value(&borrowed_a) == 5_000, 0);
            assert!(coin::value(&borrowed_b) == 10_000, 1);

            // Prepare repayment with fees
            let repay_a = mint_for_testing<TokenA>(5_000 + 12, ctx(&mut scenario)); // 5000 + fee
            let repay_b = mint_for_testing<TokenB>(10_000 + 25, ctx(&mut scenario)); // 10000 + fee

            coin::burn_for_testing(borrowed_a);
            coin::burn_for_testing(borrowed_b);

            pool::repay_flash_swap(&mut pool, repay_a, repay_b, receipt);

            coin::burn_for_testing(lp_token);
            return_shared(pool);
        };
        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = carapace::pool::EPoolPaused)]
    fun test_flash_swap_when_paused() {
        let mut scenario = test::begin(@0xCAFE);
        {
            pool::create_pool_for_testing<TokenA, TokenB>(ctx(&mut scenario));
        };
        next_tx(&mut scenario, @0xCAFE);
        {
            use carapace::pool::AdminCap;
            let mut pool = take_shared<Pool<TokenA, TokenB>>(&scenario);
            let admin_cap = test::take_from_sender<AdminCap>(&scenario);

            // Add liquidity
            let coin_a = mint_for_testing<TokenA>(100_000, ctx(&mut scenario));
            let coin_b = mint_for_testing<TokenB>(200_000, ctx(&mut scenario));
            let lp_token = pool::add_liquidity(&mut pool, coin_a, coin_b, 0, ctx(&mut scenario));

            // Pause the pool
            pool::pause(&mut pool, &admin_cap);

            // Try flash swap (should fail)
            let (borrowed_a, borrowed_b, receipt) = pool::flash_swap(&mut pool, 10_000, 0, ctx(&mut scenario));

            // Cleanup (won't reach here)
            coin::burn_for_testing(borrowed_a);
            coin::burn_for_testing(borrowed_b);
            let repay_a = mint_for_testing<TokenA>(10_025, ctx(&mut scenario));
            let repay_b = mint_for_testing<TokenB>(0, ctx(&mut scenario));
            pool::repay_flash_swap(&mut pool, repay_a, repay_b, receipt);

            coin::burn_for_testing(lp_token);
            test::return_to_sender(&scenario, admin_cap);
            return_shared(pool);
        };
        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = carapace::pool::EInvalidFlashSwapRepayment)]
    fun test_flash_swap_insufficient_repayment() {
        let mut scenario = test::begin(@0xCAFE);
        {
            pool::create_pool_for_testing<TokenA, TokenB>(ctx(&mut scenario));
        };
        next_tx(&mut scenario, @0xCAFE);
        {
            let mut pool = take_shared<Pool<TokenA, TokenB>>(&scenario);

            // Add liquidity
            let coin_a = mint_for_testing<TokenA>(100_000, ctx(&mut scenario));
            let coin_b = mint_for_testing<TokenB>(200_000, ctx(&mut scenario));
            let lp_token = pool::add_liquidity(&mut pool, coin_a, coin_b, 0, ctx(&mut scenario));

            // Flash swap
            let (borrowed_a, borrowed_b, receipt) = pool::flash_swap(&mut pool, 10_000, 0, ctx(&mut scenario));

            coin::burn_for_testing(borrowed_a);
            coin::burn_for_testing(borrowed_b);

            // Try to repay less than required (should fail)
            let repay_a = mint_for_testing<TokenA>(10_000, ctx(&mut scenario)); // Missing fee!
            let repay_b = mint_for_testing<TokenB>(0, ctx(&mut scenario));

            pool::repay_flash_swap(&mut pool, repay_a, repay_b, receipt);

            coin::burn_for_testing(lp_token);
            return_shared(pool);
        };
        test::end(scenario);
    }

    #[test]
    fun test_flash_swap_overpayment_allowed() {
        let mut scenario = test::begin(@0xCAFE);
        {
            pool::create_pool_for_testing<TokenA, TokenB>(ctx(&mut scenario));
        };
        next_tx(&mut scenario, @0xCAFE);
        {
            let mut pool = take_shared<Pool<TokenA, TokenB>>(&scenario);

            // Add liquidity
            let coin_a = mint_for_testing<TokenA>(100_000, ctx(&mut scenario));
            let coin_b = mint_for_testing<TokenB>(200_000, ctx(&mut scenario));
            let lp_token = pool::add_liquidity(&mut pool, coin_a, coin_b, 0, ctx(&mut scenario));

            // Flash swap
            let (borrowed_a, borrowed_b, receipt) = pool::flash_swap(&mut pool, 10_000, 0, ctx(&mut scenario));

            coin::burn_for_testing(borrowed_a);
            coin::burn_for_testing(borrowed_b);

            // Overpay (should succeed)
            let repay_a = mint_for_testing<TokenA>(11_000, ctx(&mut scenario)); // More than required
            let repay_b = mint_for_testing<TokenB>(0, ctx(&mut scenario));

            pool::repay_flash_swap(&mut pool, repay_a, repay_b, receipt);

            coin::burn_for_testing(lp_token);
            return_shared(pool);
        };
        test::end(scenario);
    }

    // ========== Flash Loan Tests ==========

    #[test]
    fun test_flash_loan_x_basic() {
        let mut scenario = test::begin(@0xCAFE);
        {
            pool::create_pool_for_testing<TokenA, TokenB>(ctx(&mut scenario));
        };
        next_tx(&mut scenario, @0xCAFE);
        {
            let mut pool = take_shared<Pool<TokenA, TokenB>>(&scenario);

            // Add liquidity
            let coin_a = mint_for_testing<TokenA>(100_000, ctx(&mut scenario));
            let coin_b = mint_for_testing<TokenB>(200_000, ctx(&mut scenario));
            let lp_token = pool::add_liquidity(&mut pool, coin_a, coin_b, 0, ctx(&mut scenario));

            // Flash borrow token X
            let borrow_amount = 10_000;
            let (borrowed, receipt) = pool::flash_borrow_x(&mut pool, borrow_amount, ctx(&mut scenario));

            // Verify borrowed amount
            assert!(coin::value(&borrowed) == borrow_amount, 0);

            // Calculate expected fee (0.05% = 5 bp)
            let expected_fee = pool::calculate_flash_loan_fee(borrow_amount);
            assert!(expected_fee == 5, 1); // 10_000 * 5 / 10_000 = 5

            // Prepare repayment (borrowed + fee)
            let repay_amount = borrow_amount + expected_fee;
            let repayment = mint_for_testing<TokenA>(repay_amount, ctx(&mut scenario));

            // Use borrowed coins (burn them for testing)
            coin::burn_for_testing(borrowed);

            // Repay flash loan
            pool::repay_flash_loan_x(&mut pool, repayment, receipt);

            // Verify pool reserves increased by fee
            let (reserve_x, _) = pool::get_reserves(&pool);
            assert!(reserve_x >= 100_000, 2); // At least initial amount (fee goes to protocol)

            coin::burn_for_testing(lp_token);
            return_shared(pool);
        };
        test::end(scenario);
    }

    #[test]
    fun test_flash_loan_y_basic() {
        let mut scenario = test::begin(@0xCAFE);
        {
            pool::create_pool_for_testing<TokenA, TokenB>(ctx(&mut scenario));
        };
        next_tx(&mut scenario, @0xCAFE);
        {
            let mut pool = take_shared<Pool<TokenA, TokenB>>(&scenario);

            // Add liquidity
            let coin_a = mint_for_testing<TokenA>(100_000, ctx(&mut scenario));
            let coin_b = mint_for_testing<TokenB>(200_000, ctx(&mut scenario));
            let lp_token = pool::add_liquidity(&mut pool, coin_a, coin_b, 0, ctx(&mut scenario));

            // Flash borrow token Y
            let borrow_amount = 20_000;
            let (borrowed, receipt) = pool::flash_borrow_y(&mut pool, borrow_amount, ctx(&mut scenario));

            // Verify borrowed amount
            assert!(coin::value(&borrowed) == borrow_amount, 0);

            // Calculate expected fee (0.05% = 5 bp)
            let expected_fee = pool::calculate_flash_loan_fee(borrow_amount);
            assert!(expected_fee == 10, 1); // 20_000 * 5 / 10_000 = 10

            // Prepare repayment
            let repay_amount = borrow_amount + expected_fee;
            let repayment = mint_for_testing<TokenB>(repay_amount, ctx(&mut scenario));

            // Use borrowed coins
            coin::burn_for_testing(borrowed);

            // Repay flash loan
            pool::repay_flash_loan_y(&mut pool, repayment, receipt);

            // Verify pool reserves
            let (_, reserve_y) = pool::get_reserves(&pool);
            assert!(reserve_y >= 200_000, 2);

            coin::burn_for_testing(lp_token);
            return_shared(pool);
        };
        test::end(scenario);
    }

    #[test]
    fun test_flash_loan_large_amount() {
        let mut scenario = test::begin(@0xCAFE);
        {
            pool::create_pool_for_testing<TokenA, TokenB>(ctx(&mut scenario));
        };
        next_tx(&mut scenario, @0xCAFE);
        {
            let mut pool = take_shared<Pool<TokenA, TokenB>>(&scenario);

            // Add liquidity
            let coin_a = mint_for_testing<TokenA>(1_000_000, ctx(&mut scenario));
            let coin_b = mint_for_testing<TokenB>(2_000_000, ctx(&mut scenario));
            let lp_token = pool::add_liquidity(&mut pool, coin_a, coin_b, 0, ctx(&mut scenario));

            // Flash borrow large amount
            let borrow_amount = 500_000;
            let (borrowed, receipt) = pool::flash_borrow_x(&mut pool, borrow_amount, ctx(&mut scenario));

            assert!(coin::value(&borrowed) == borrow_amount, 0);

            // Fee: 500_000 * 5 / 10_000 = 250
            let fee = pool::calculate_flash_loan_fee(borrow_amount);
            assert!(fee == 250, 1);

            let repayment = mint_for_testing<TokenA>(borrow_amount + fee, ctx(&mut scenario));
            coin::burn_for_testing(borrowed);
            pool::repay_flash_loan_x(&mut pool, repayment, receipt);

            coin::burn_for_testing(lp_token);
            return_shared(pool);
        };
        test::end(scenario);
    }

    #[test]
    fun test_flash_loan_fee_calculation() {
        let scenario = test::begin(@0xCAFE);
        {
            // Test various amounts
            assert!(pool::calculate_flash_loan_fee(10_000) == 5, 0);      // 0.05%
            assert!(pool::calculate_flash_loan_fee(100_000) == 50, 1);    // 0.05%
            assert!(pool::calculate_flash_loan_fee(1_000_000) == 500, 2); // 0.05%
            assert!(pool::calculate_flash_loan_fee(1_000) == 0, 3);       // Below 1 bp rounds to 0
        };
        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = carapace::pool::EPoolPaused)]
    fun test_flash_loan_when_paused() {
        let mut scenario = test::begin(@0xCAFE);
        {
            pool::create_pool_for_testing<TokenA, TokenB>(ctx(&mut scenario));
        };
        next_tx(&mut scenario, @0xCAFE);
        {
            use carapace::pool::AdminCap;
            let mut pool = take_shared<Pool<TokenA, TokenB>>(&scenario);
            let admin_cap = test::take_from_sender<AdminCap>(&scenario);

            // Add liquidity
            let coin_a = mint_for_testing<TokenA>(100_000, ctx(&mut scenario));
            let coin_b = mint_for_testing<TokenB>(200_000, ctx(&mut scenario));
            let lp_token = pool::add_liquidity(&mut pool, coin_a, coin_b, 0, ctx(&mut scenario));

            // Pause the pool
            pool::pause(&mut pool, &admin_cap);

            // Try flash loan (should fail)
            let (borrowed, receipt) = pool::flash_borrow_x(&mut pool, 10_000, ctx(&mut scenario));

            // Cleanup (won't reach here)
            coin::burn_for_testing(borrowed);
            let repayment = mint_for_testing<TokenA>(10_005, ctx(&mut scenario));
            pool::repay_flash_loan_x(&mut pool, repayment, receipt);

            coin::burn_for_testing(lp_token);
            test::return_to_sender(&scenario, admin_cap);
            return_shared(pool);
        };
        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = carapace::pool::EInvalidFlashSwapRepayment)]
    fun test_flash_loan_insufficient_repayment() {
        let mut scenario = test::begin(@0xCAFE);
        {
            pool::create_pool_for_testing<TokenA, TokenB>(ctx(&mut scenario));
        };
        next_tx(&mut scenario, @0xCAFE);
        {
            let mut pool = take_shared<Pool<TokenA, TokenB>>(&scenario);

            // Add liquidity
            let coin_a = mint_for_testing<TokenA>(100_000, ctx(&mut scenario));
            let coin_b = mint_for_testing<TokenB>(200_000, ctx(&mut scenario));
            let lp_token = pool::add_liquidity(&mut pool, coin_a, coin_b, 0, ctx(&mut scenario));

            // Flash loan
            let (borrowed, receipt) = pool::flash_borrow_x(&mut pool, 10_000, ctx(&mut scenario));
            coin::burn_for_testing(borrowed);

            // Try to repay without fee (should fail)
            let repayment = mint_for_testing<TokenA>(10_000, ctx(&mut scenario)); // Missing fee!
            pool::repay_flash_loan_x(&mut pool, repayment, receipt);

            coin::burn_for_testing(lp_token);
            return_shared(pool);
        };
        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = carapace::pool::EZeroAmount)]
    fun test_flash_loan_zero_amount() {
        let mut scenario = test::begin(@0xCAFE);
        {
            pool::create_pool_for_testing<TokenA, TokenB>(ctx(&mut scenario));
        };
        next_tx(&mut scenario, @0xCAFE);
        {
            let mut pool = take_shared<Pool<TokenA, TokenB>>(&scenario);

            // Add liquidity
            let coin_a = mint_for_testing<TokenA>(100_000, ctx(&mut scenario));
            let coin_b = mint_for_testing<TokenB>(200_000, ctx(&mut scenario));
            let lp_token = pool::add_liquidity(&mut pool, coin_a, coin_b, 0, ctx(&mut scenario));

            // Try to borrow zero amount (should fail)
            let (borrowed, receipt) = pool::flash_borrow_x(&mut pool, 0, ctx(&mut scenario));

            // Cleanup (won't reach here)
            coin::burn_for_testing(borrowed);
            let repayment = mint_for_testing<TokenA>(0, ctx(&mut scenario));
            pool::repay_flash_loan_x(&mut pool, repayment, receipt);

            coin::burn_for_testing(lp_token);
            return_shared(pool);
        };
        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = carapace::pool::EInsufficientLiquidity)]
    fun test_flash_loan_exceeds_reserves() {
        let mut scenario = test::begin(@0xCAFE);
        {
            pool::create_pool_for_testing<TokenA, TokenB>(ctx(&mut scenario));
        };
        next_tx(&mut scenario, @0xCAFE);
        {
            let mut pool = take_shared<Pool<TokenA, TokenB>>(&scenario);

            // Add liquidity
            let coin_a = mint_for_testing<TokenA>(100_000, ctx(&mut scenario));
            let coin_b = mint_for_testing<TokenB>(200_000, ctx(&mut scenario));
            let lp_token = pool::add_liquidity(&mut pool, coin_a, coin_b, 0, ctx(&mut scenario));

            // Try to borrow more than reserves (should fail)
            let (borrowed, receipt) = pool::flash_borrow_x(&mut pool, 100_000, ctx(&mut scenario));

            // Cleanup (won't reach here)
            coin::burn_for_testing(borrowed);
            let repayment = mint_for_testing<TokenA>(100_050, ctx(&mut scenario));
            pool::repay_flash_loan_x(&mut pool, repayment, receipt);

            coin::burn_for_testing(lp_token);
            return_shared(pool);
        };
        test::end(scenario);
    }

    #[test]
    fun test_flash_loan_overpayment_allowed() {
        let mut scenario = test::begin(@0xCAFE);
        {
            pool::create_pool_for_testing<TokenA, TokenB>(ctx(&mut scenario));
        };
        next_tx(&mut scenario, @0xCAFE);
        {
            let mut pool = take_shared<Pool<TokenA, TokenB>>(&scenario);

            // Add liquidity
            let coin_a = mint_for_testing<TokenA>(100_000, ctx(&mut scenario));
            let coin_b = mint_for_testing<TokenB>(200_000, ctx(&mut scenario));
            let lp_token = pool::add_liquidity(&mut pool, coin_a, coin_b, 0, ctx(&mut scenario));

            // Flash loan
            let (borrowed, receipt) = pool::flash_borrow_x(&mut pool, 10_000, ctx(&mut scenario));
            coin::burn_for_testing(borrowed);

            // Overpay (should succeed)
            let repayment = mint_for_testing<TokenA>(11_000, ctx(&mut scenario)); // More than required
            pool::repay_flash_loan_x(&mut pool, repayment, receipt);

            // Extra payment should remain in pool
            let (reserve_x, _) = pool::get_reserves(&pool);
            assert!(reserve_x > 100_000, 0);

            coin::burn_for_testing(lp_token);
            return_shared(pool);
        };
        test::end(scenario);
    }

    #[test]
    fun test_flash_loan_protocol_fee_collection() {
        let mut scenario = test::begin(@0xCAFE);
        {
            pool::create_pool_for_testing<TokenA, TokenB>(ctx(&mut scenario));
        };
        next_tx(&mut scenario, @0xCAFE);
        {
            let mut pool = take_shared<Pool<TokenA, TokenB>>(&scenario);

            // Add liquidity
            let coin_a = mint_for_testing<TokenA>(100_000, ctx(&mut scenario));
            let coin_b = mint_for_testing<TokenB>(200_000, ctx(&mut scenario));
            let lp_token = pool::add_liquidity(&mut pool, coin_a, coin_b, 0, ctx(&mut scenario));

            // Get initial protocol fees (not used in this test but showing the pattern)
            let (_initial_fee_x, _) = pool::get_protocol_fees(&pool);

            // Flash loan
            let borrow_amount = 100_000;
            let (borrowed, receipt) = pool::flash_borrow_y(&mut pool, borrow_amount, ctx(&mut scenario));

            let fee = pool::calculate_flash_loan_fee(borrow_amount);
            let repayment = mint_for_testing<TokenB>(borrow_amount + fee, ctx(&mut scenario));

            coin::burn_for_testing(borrowed);
            pool::repay_flash_loan_y(&mut pool, repayment, receipt);

            // Check protocol fees increased
            let (_, final_fee_y) = pool::get_protocol_fees(&pool);
            // Protocol fee = fee * protocol_fee_bps / 10000 = 50 * 1667 / 10000 = 8
            assert!(final_fee_y > 0, 0);

            coin::burn_for_testing(lp_token);
            return_shared(pool);
        };
        test::end(scenario);
    }
}
