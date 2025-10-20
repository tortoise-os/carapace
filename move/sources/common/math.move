/// Common math utilities for Carapace
module carapace::math {
    /// Error codes
    const EDivisionByZero: u64 = 1;

    /// Basis points denominator (100% = 10000 bps)
    const BPS_DENOMINATOR: u64 = 10000;

    /// Minimum liquidity to prevent division by zero
    const MINIMUM_LIQUIDITY: u64 = 1000;

    /// Calculate square root using Babylonian method
    /// Used for initial liquidity calculation
    public fun sqrt(y: u64): u64 {
        if (y < 4) {
            if (y == 0) {
                0
            } else {
                1
            }
        } else {
            let mut z = y;
            let mut x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            };
            z
        }
    }

    /// Calculate minimum of two numbers
    public fun min(a: u64, b: u64): u64 {
        if (a < b) a else b
    }

    /// Calculate maximum of two numbers
    public fun max(a: u64, b: u64): u64 {
        if (a > b) a else b
    }

    /// Multiply two u64 numbers and divide by denominator
    /// Prevents overflow by using u128 intermediate
    public fun mul_div(a: u64, b: u64, denominator: u64): u64 {
        assert!(denominator > 0, EDivisionByZero);
        let a_u128 = (a as u128);
        let b_u128 = (b as u128);
        let denominator_u128 = (denominator as u128);
        ((a_u128 * b_u128 / denominator_u128) as u64)
    }

    /// Calculate fee amount from total using basis points
    /// Example: apply_fee(1000, 30) = 3 (0.3% fee)
    public fun apply_fee(amount: u64, fee_bps: u64): u64 {
        mul_div(amount, fee_bps, BPS_DENOMINATOR)
    }

    /// Get basis points denominator
    public fun bps_denominator(): u64 {
        BPS_DENOMINATOR
    }

    /// Get minimum liquidity constant
    public fun minimum_liquidity(): u64 {
        MINIMUM_LIQUIDITY
    }

    #[test]
    fun test_sqrt() {
        assert!(sqrt(0) == 0, 0);
        assert!(sqrt(1) == 1, 0);
        assert!(sqrt(4) == 2, 0);
        assert!(sqrt(9) == 3, 0);
        assert!(sqrt(16) == 4, 0);
        assert!(sqrt(100) == 10, 0);
        assert!(sqrt(1000000) == 1000, 0);
    }

    #[test]
    fun test_min_max() {
        assert!(min(5, 10) == 5, 0);
        assert!(min(10, 5) == 5, 0);
        assert!(max(5, 10) == 10, 0);
        assert!(max(10, 5) == 10, 0);
    }

    #[test]
    fun test_mul_div() {
        assert!(mul_div(100, 50, 100) == 50, 0);
        assert!(mul_div(1000, 3, 10) == 300, 0);
        assert!(mul_div(1000, 500, 1000) == 500, 0);
    }

    #[test]
    fun test_apply_fee() {
        // 0.3% fee (30 bps)
        assert!(apply_fee(10000, 30) == 30, 0);
        // 0.25% fee (25 bps)
        assert!(apply_fee(100000, 25) == 250, 0);
        // 1% fee (100 bps)
        assert!(apply_fee(50000, 100) == 500, 0);
    }

    #[test]
    #[expected_failure(abort_code = EDivisionByZero)]
    fun test_mul_div_zero_denominator() {
        mul_div(100, 50, 0);
    }
}
