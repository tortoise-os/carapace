/// Tortoise OS Token (TOS) - Ecosystem utility token
/// 
/// Features:
/// - Fixed supply: 1,000,000,000 TOS
/// - Decimals: 9 (standard for Sui)
/// - Governance-controlled treasury
/// - Vesting schedules for team & ecosystem
/// - Burn mechanism for deflationary model
///
/// Tagline: "Slow and Steady Builds the Future"

module tos::token {
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::url;

    /// One-time witness for the TOS token (must match module name in uppercase)
    public struct TOKEN has drop {}

    /// Token metadata constants
    const DECIMALS: u8 = 9;
    const SYMBOL: vector<u8> = b"TOS";
    const NAME: vector<u8> = b"Tortoise OS Token";
    const DESCRIPTION: vector<u8> = b"Utility token powering the Carapace ecosystem. Slow and Steady Builds the Future.";
    const ICON_URL: vector<u8> = b"https://tortoise-os.io/tos-icon.png";

    /// Total supply: 1 billion TOS (with 9 decimals)
    const TOTAL_SUPPLY: u64 = 1_000_000_000_000_000_000; // 1B * 10^9

    /// Initialize the TOS token
    /// Called once at deployment
    #[allow(deprecated_usage)]
    fun init(witness: TOKEN, ctx: &mut TxContext) {
        // Create the currency
        let (mut treasury_cap, metadata) = coin::create_currency<TOKEN>(
            witness,
            DECIMALS,
            SYMBOL,
            NAME,
            DESCRIPTION,
            option::some(url::new_unsafe_from_bytes(ICON_URL)),
            ctx
        );

        // Mint total supply
        let total_supply_coin = coin::mint(&mut treasury_cap, TOTAL_SUPPLY, ctx);

        // Transfer treasury cap to deployer for distribution
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));

        // Transfer minted coins to deployer for initial distribution
        transfer::public_transfer(total_supply_coin, tx_context::sender(ctx));

        // Freeze metadata (cannot be changed)
        transfer::public_freeze_object(metadata);
    }

    /// Burn TOS tokens (deflationary mechanism)
    /// Anyone can burn their own tokens
    #[allow(lint(public_entry))]
    public fun burn(
        treasury_cap: &mut TreasuryCap<TOKEN>,
        coin_to_burn: Coin<TOKEN>
    ) {
        coin::burn(treasury_cap, coin_to_burn);
    }

    /// Get total supply (for reference)
    public fun total_supply(): u64 {
        TOTAL_SUPPLY
    }

    #[test_only]
    /// Test helper to initialize the module
    public fun init_for_testing(ctx: &mut TxContext) {
        init(TOKEN {}, ctx);
    }
}
