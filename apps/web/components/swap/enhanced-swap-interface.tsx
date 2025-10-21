'use client';

import { useState, useEffect } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import {
  Input,
  Button,
  MagicCard,
  BorderBeam,
  ShimmerButton,
  TokenIcon,
} from '@carapace/ui';
import { ArrowDown, ChevronDown, Settings, Loader2 } from 'lucide-react';
import { apiClient, type SwapQuote, type Pool } from '@/lib/api-client';
import { toast } from 'sonner';
import { SuiClient } from '@mysten/sui/client';
import { SwapSettingsDialog } from './swap-settings-dialog';
import { TokenSelectorModal } from './token-selector-modal';

interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
}

const TOKENS: Token[] = [
  { symbol: 'SUI', name: 'Sui', address: '0x2::sui::SUI', decimals: 9 },
  { symbol: 'USDC', name: 'USD Coin', address: '0x5678::usdc::USDC', decimals: 6 },
];

export function EnhancedSwapInterface() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const [tokenIn, setTokenIn] = useState<Token>(TOKENS[0]!);
  const [tokenOut, setTokenOut] = useState<Token>(TOKENS[1]!);
  const [amountIn, setAmountIn] = useState('');
  const [amountOut, setAmountOut] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const [pools, setPools] = useState<Pool[]>([]);
  const [currentPool, setCurrentPool] = useState<Pool | null>(null);
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [showTokenSelector, setShowTokenSelector] = useState(false);
  const [selectingTokenType, setSelectingTokenType] = useState<'in' | 'out'>('in');

  // Fetch pools on mount
  useEffect(() => {
    apiClient.getPools().then(setPools).catch(console.error);
  }, []);

  // Find the appropriate pool for the current token pair
  useEffect(() => {
    if (pools.length === 0) return;

    const pool = pools.find(p =>
      (p.token_x === tokenIn.address && p.token_y === tokenOut.address) ||
      (p.token_y === tokenIn.address && p.token_x === tokenOut.address)
    );

    setCurrentPool(pool || null);
  }, [pools, tokenIn.address, tokenOut.address]);

  // Get real-time quote from API
  useEffect(() => {
    if (!currentPool || !amountIn || parseFloat(amountIn) <= 0) {
      setAmountOut('');
      setQuote(null);
      return;
    }

    setIsLoadingQuote(true);

    // Convert to smallest unit based on token decimals
    const amountInSmallest = BigInt(Math.floor(parseFloat(amountIn) * Math.pow(10, tokenIn.decimals))).toString();
    const isXToY = currentPool.token_x === tokenIn.address;

    apiClient
      .getSwapQuote(currentPool.pool_id, amountInSmallest, isXToY)
      .then(quoteData => {
        setQuote(quoteData);
        // Convert back to human-readable decimals
        const amountOutDecimal = parseFloat(quoteData.amountOut) / Math.pow(10, tokenOut.decimals);
        setAmountOut(amountOutDecimal.toFixed(6));
      })
      .catch(error => {
        console.error('Failed to get quote:', error);
        setAmountOut('');
        setQuote(null);
      })
      .finally(() => setIsLoadingQuote(false));
  }, [amountIn, currentPool, tokenIn.address, tokenIn.decimals, tokenOut.address, tokenOut.decimals]);

  const handleFlipTokens = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn(amountOut);
    setAmountOut('');
  };

  const handleSelectToken = (token: Token) => {
    if (selectingTokenType === 'in') {
      setTokenIn(token);
    } else {
      setTokenOut(token);
    }
  };

  const openTokenSelector = (type: 'in' | 'out') => {
    setSelectingTokenType(type);
    setShowTokenSelector(true);
  };

  const handleSwap = async () => {
    if (!account || !currentPool || !quote || !amountIn) {
      return;
    }

    setIsSwapping(true);

    try {
      // Show preview of what would happen
      toast.info('Swap Preview', {
        description: `This would swap ${amountIn} ${tokenIn.symbol} for ${amountOut} ${tokenOut.symbol}`,
        duration: 5000,
      });

      // To enable actual swaps, you need to:
      // 1. Deploy the Carapace smart contracts to Sui testnet/mainnet
      // 2. Create actual liquidity pools on-chain
      // 3. Get coin objects from user's wallet using:
      //    - await suiClient.getCoins({ owner: account.address, coinType: tokenIn.address })
      // 4. Build transaction using the SDK's pool client
      // 5. Sign and execute with the wallet

      toast.warning('Blockchain Integration Required', {
        description: 'Smart contracts need to be deployed to enable actual swaps. Currently showing preview only.',
        duration: 8000,
      });

      // Example of what the full implementation would look like:
      /*
      const suiClient = useSuiClient();

      // Get user's coins
      const coins = await suiClient.getCoins({
        owner: account.address,
        coinType: tokenIn.address,
      });

      if (!coins.data || coins.data.length === 0) {
        throw new Error(`No ${tokenIn.symbol} coins found in wallet`);
      }

      // Use SDK to build transaction
      const sdk = new CarapaceSDK({
        client: suiClient,
        packageIds: { carapace: 'DEPLOYED_PACKAGE_ID' }
      });

      const isXToY = currentPool.token_x === tokenIn.address;
      const amountInSmallest = BigInt(Math.floor(parseFloat(amountIn) * Math.pow(10, tokenIn.decimals)));
      const minAmountOut = BigInt(quote.amountOut) * 995n / 1000n;

      const tx = isXToY
        ? sdk.pool.swapXToY(
            currentPool.pool_id,
            coins.data[0].coinObjectId,
            amountInSmallest,
            minAmountOut
          )
        : sdk.pool.swapYToX(
            currentPool.pool_id,
            coins.data[0].coinObjectId,
            amountInSmallest,
            minAmountOut
          );

      // Sign and execute
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            toast.success('Swap successful!');
            setAmountIn('');
            setAmountOut('');
            setQuote(null);
          },
          onError: (error) => {
            toast.error('Swap failed', { description: error.message });
          },
        }
      );
      */

    } catch (error) {
      console.error('Swap error:', error);
      toast.error('Swap preview error', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <MagicCard className="w-full max-w-[480px] p-6 shadow-2xl">
      <BorderBeam size={120} duration={8} />
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Swap</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-accent/10 hover:text-accent"
          onClick={() => setShowSettings(true)}
          aria-label="Swap settings"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* From Token */}
      <div className="bg-muted rounded-2xl p-4 mb-1">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground font-semibold uppercase tracking-wide">You pay</span>
          {account && (
            <span className="text-sm text-muted-foreground font-semibold">Balance: 0.00</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="0"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            className="border-0 bg-transparent text-4xl font-bold h-auto p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground"
          />
          <Button
            variant="secondary"
            className="shrink-0 h-10 px-3 rounded-full font-semibold gap-1 hover:bg-accent/10 hover:text-accent transition-all"
            onClick={() => openTokenSelector('in')}
          >
            <TokenIcon
              symbol={tokenIn.symbol}
              size="sm"
              gradient="bg-brand-gradient-ocean"
            />
            <span>{tokenIn.symbol}</span>
            <ChevronDown className="h-4 w-4 opacity-70" />
          </Button>
        </div>
        {amountIn && (
          <div className="text-sm text-muted-foreground font-semibold mt-2">$0.00</div>
        )}
      </div>

      {/* Swap Arrow */}
      <div className="flex justify-center -my-2 z-10 relative">
        <Button
          onClick={handleFlipTokens}
          variant="secondary"
          size="icon"
          className="h-10 w-10 rounded-xl border-4 border-background hover:bg-secondary"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      </div>

      {/* To Token */}
      <div className="bg-muted rounded-2xl p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground font-semibold uppercase tracking-wide">You receive</span>
          {account && (
            <span className="text-sm text-muted-foreground font-semibold">Balance: 0.00</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="0"
            value={amountOut}
            readOnly
            className="border-0 bg-transparent text-4xl font-bold h-auto p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground"
          />
          <Button
            variant="secondary"
            className="shrink-0 h-10 px-3 rounded-full font-semibold gap-1 hover:bg-accent/10 hover:text-accent transition-all"
            onClick={() => openTokenSelector('out')}
          >
            <TokenIcon
              symbol={tokenOut.symbol}
              size="sm"
              gradient="bg-brand-gradient-seafoam"
            />
            <span>{tokenOut.symbol}</span>
            <ChevronDown className="h-4 w-4 opacity-70" />
          </Button>
        </div>
        {amountOut && (
          <div className="text-sm text-muted-foreground font-semibold mt-2">$0.00</div>
        )}
      </div>

      {/* Details */}
      {amountIn && amountOut && quote && (
        <div
          className="text-sm mb-4 cursor-pointer"
          onClick={() => setShowDetails(!showDetails)}
        >
          <div className="flex justify-between items-center p-3 hover:bg-muted rounded-xl transition-colors">
            <span className="text-muted-foreground">
              {isLoadingQuote ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Getting quote...
                </span>
              ) : currentPool ? (
                `1 ${tokenIn.symbol} = ${(parseFloat(amountOut) / parseFloat(amountIn)).toFixed(6)} ${tokenOut.symbol}`
              ) : (
                'No pool found'
              )}
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
          </div>
          {showDetails && !isLoadingQuote && (
            <div className="space-y-2 p-3 bg-muted rounded-xl mt-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price impact</span>
                <span className={quote.priceImpact < 1 ? 'text-green-500' : quote.priceImpact < 3 ? 'text-yellow-500' : 'text-red-500'}>
                  {Math.abs(quote.priceImpact).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee</span>
                <span>{(parseFloat(quote.fee) / Math.pow(10, tokenIn.decimals)).toFixed(6)} {tokenIn.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Minimum received (0.5% slippage)</span>
                <span>{(parseFloat(quote.amountOut) * 0.995 / Math.pow(10, tokenOut.decimals)).toFixed(6)} {tokenOut.symbol}</span>
              </div>
              {currentPool && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Route</span>
                  <span className="text-xs">{tokenIn.symbol} → {tokenOut.symbol}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Button */}
      {!account ? (
        <Button className="w-full h-14 text-base font-semibold rounded-2xl" disabled>
          Connect Wallet
        </Button>
      ) : !currentPool ? (
        <Button className="w-full h-14 text-base font-semibold rounded-2xl" disabled>
          No pool available
        </Button>
      ) : !amountIn || parseFloat(amountIn) === 0 ? (
        <Button className="w-full h-14 text-base font-semibold rounded-2xl" disabled>
          Enter an amount
        </Button>
      ) : isLoadingQuote ? (
        <Button className="w-full h-14 text-base font-semibold rounded-2xl" disabled>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Getting quote...
        </Button>
      ) : (
        <ShimmerButton
          className="w-full h-14 text-base font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
          shimmerColor="rgba(0, 255, 241, 0.8)"
          background="linear-gradient(135deg, hsl(var(--brand-teal)), hsl(var(--brand-cyan)))"
          onClick={handleSwap}
          disabled={isSwapping}
        >
          {isSwapping ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Swapping...
            </>
          ) : (
            'Swap'
          )}
        </ShimmerButton>
      )}

      {/* Dialogs */}
      <SwapSettingsDialog open={showSettings} onOpenChange={setShowSettings} />
      <TokenSelectorModal
        open={showTokenSelector}
        onOpenChange={setShowTokenSelector}
        onSelectToken={handleSelectToken}
        selectedToken={selectingTokenType === 'in' ? tokenIn : tokenOut}
      />
    </MagicCard>
  );
}
