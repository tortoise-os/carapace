/// Simple test coin for testing the AMM on testnet
module carapace::test_coin {
    use sui::coin::{Self, Coin, TreasuryCap};

    /// One-time witness for the coin
    public struct TEST_COIN has drop {}

    /// Initialize the test coin
    /// This creates a treasury cap that allows minting
    #[allow(deprecated_usage)]
    fun init(witness: TEST_COIN, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness,
            6, // decimals
            b"TEST", // symbol
            b"Test Coin", // name
            b"Test coin for Carapace AMM testing", // description
            option::none(), // icon url
            ctx
        );

        // Make the treasury cap and metadata shared so anyone can mint for testing
        transfer::public_share_object(treasury);
        transfer::public_freeze_object(metadata);
    }

    /// Mint test coins - anyone can call this for testing purposes
    public fun mint(
        treasury: &mut TreasuryCap<TEST_COIN>,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let coin = coin::mint(treasury, amount, ctx);
        transfer::public_transfer(coin, recipient);
    }

    /// Burn test coins
    public fun burn(
        treasury: &mut TreasuryCap<TEST_COIN>,
        coin: Coin<TEST_COIN>
    ) {
        coin::burn(treasury, coin);
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(TEST_COIN {}, ctx);
    }
}
