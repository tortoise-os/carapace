'use client';

import { useState, useEffect } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Button } from '@carapace/ui';
import { ArrowDownUp, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { parseTokenAmount, formatTokenAmount } from '@/lib/utils';

interface Token {
  symbol: string;
  address: string;
  decimals: number;
}

// Mock tokens - replace with actual token list
const TOKENS: Token[] = [
  { symbol: 'SUI', address: '0x2::sui::SUI', decimals: 9 },
  { symbol: 'USDC', address: '0x...::usdc::USDC', decimals: 6 },
];

export function SwapInterface() {
  const account = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const [tokenIn, setTokenIn] = useState<Token>(TOKENS[0]!);
  const [tokenOut, setTokenOut] = useState<Token>(TOKENS[1]!);
  const [amountIn, setAmountIn] = useState('');
  const [amountOut, setAmountOut] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [priceImpact, setPriceImpact] = useState<number>(0);
  const [fee, setFee] = useState<string>('0');
  const [poolId, _setPoolId] = useState<string>('');

  // Fetch quote when amount changes
  useEffect(() => {
    if (!amountIn || parseFloat(amountIn) === 0 || !poolId) {
      setAmountOut('');
      setPriceImpact(0);
      setFee('0');
      return;
    }

    const fetchQuote = async () => {
      try {
        setIsLoading(true);
        const amount = parseTokenAmount(amountIn, tokenIn.decimals);
        const quote = await apiClient.getSwapQuote(
          poolId,
          amount.toString(),
          tokenIn.symbol === 'SUI'
        );

        setAmountOut(formatTokenAmount(BigInt(quote.amountOut), tokenOut.decimals));
        setPriceImpact(quote.priceImpact);
        setFee(formatTokenAmount(BigInt(quote.fee), tokenIn.decimals));
      } catch (error) {
        console.error('Failed to fetch quote:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchQuote, 500);
    return () => clearTimeout(debounce);
  }, [amountIn, tokenIn, tokenOut, poolId]);

  const handleSwap = async () => {
    if (!account || !poolId || !amountIn) return;

    try {
      setIsLoading(true);

      // Get swap transaction from API
      const { transaction } = await apiClient.createSwapTransaction(poolId, {
        tokenIn: tokenIn.address,
        tokenOut: tokenOut.address,
        coinIn: '0x...', // TODO: Get actual coin object ID
        amountIn: parseTokenAmount(amountIn, tokenIn.decimals).toString(),
        minAmountOut: parseTokenAmount(amountOut, tokenOut.decimals).toString(),
        isXToY: tokenIn.symbol === 'SUI',
      });

      // Sign and execute
      signAndExecuteTransaction(
        {
          transaction,
        },
        {
          onSuccess: (result) => {
            console.log('Swap successful:', result);
            setAmountIn('');
            setAmountOut('');
          },
          onError: (error) => {
            console.error('Swap failed:', error);
          },
        }
      );
    } catch (error) {
      console.error('Failed to create swap:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlipTokens = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn(amountOut);
    setAmountOut('');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Swap</CardTitle>
        <CardDescription>Trade tokens instantly on TortoiseSwap</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Token */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">You pay</span>
            {account && <span className="text-muted-foreground">Balance: 0.00</span>}
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="0.0"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              className="text-2xl h-16"
            />
            <div className="flex items-center gap-2 px-4 py-2 border rounded-md bg-secondary min-w-24">
              <span className="font-medium">{tokenIn.symbol}</span>
            </div>
          </div>
        </div>

        {/* Flip Button */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFlipTokens}
            className="rounded-full"
          >
            <ArrowDownUp className="h-4 w-4" />
          </Button>
        </div>

        {/* Output Token */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">You receive</span>
            {account && <span className="text-muted-foreground">Balance: 0.00</span>}
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="0.0"
              value={amountOut}
              readOnly
              className="text-2xl h-16 bg-secondary"
            />
            <div className="flex items-center gap-2 px-4 py-2 border rounded-md bg-secondary min-w-24">
              <span className="font-medium">{tokenOut.symbol}</span>
            </div>
          </div>
        </div>

        {/* Swap Details */}
        {amountOut && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price Impact</span>
              <span className={priceImpact > 5 ? 'text-destructive' : ''}>
                {priceImpact.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fee</span>
              <span>
                {fee} {tokenIn.symbol}
              </span>
            </div>
          </div>
        )}

        {/* Swap Button */}
        {!account ? (
          <Button className="w-full" size="lg" disabled>
            Connect Wallet
          </Button>
        ) : (
          <Button
            className="w-full"
            size="lg"
            onClick={handleSwap}
            disabled={!amountIn || !amountOut || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Swap'
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
