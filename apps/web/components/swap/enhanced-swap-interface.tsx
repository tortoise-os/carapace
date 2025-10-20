'use client';

import { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowDown, ChevronDown, Settings } from 'lucide-react';

interface Token {
  symbol: string;
  address: string;
  decimals: number;
}

const TOKENS: Token[] = [
  { symbol: 'SUI', address: '0x2::sui::SUI', decimals: 9 },
  { symbol: 'USDC', address: '0x...::usdc::USDC', decimals: 6 },
];

export function EnhancedSwapInterface() {
  const account = useCurrentAccount();
  const [tokenIn, setTokenIn] = useState<Token>(TOKENS[0]!);
  const [tokenOut, setTokenOut] = useState<Token>(TOKENS[1]!);
  const [amountIn, setAmountIn] = useState('');
  const [amountOut, setAmountOut] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const handleFlipTokens = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn(amountOut);
    setAmountOut('');
  };

  return (
    <Card className="w-full max-w-[480px] p-4 shadow-lg border">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-medium">Swap</h2>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* From Token */}
      <div className="bg-muted rounded-2xl p-4 mb-1">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">You pay</span>
          {account && (
            <span className="text-sm text-muted-foreground">Balance: 0.00</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="0"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            className="border-0 bg-transparent text-4xl font-medium h-auto p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button
            variant="secondary"
            className="shrink-0 h-10 px-3 rounded-full font-medium gap-1 hover:bg-secondary"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600" />
            <span>{tokenIn.symbol}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </div>
        {amountIn && (
          <div className="text-sm text-muted-foreground mt-2">$0.00</div>
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
          <span className="text-sm text-muted-foreground">You receive</span>
          {account && (
            <span className="text-sm text-muted-foreground">Balance: 0.00</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="0"
            value={amountOut}
            readOnly
            className="border-0 bg-transparent text-4xl font-medium h-auto p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button
            variant="secondary"
            className="shrink-0 h-10 px-3 rounded-full font-medium gap-1 hover:bg-secondary"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-600" />
            <span>{tokenOut.symbol}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </div>
        {amountOut && (
          <div className="text-sm text-muted-foreground mt-2">$0.00</div>
        )}
      </div>

      {/* Details */}
      {amountIn && amountOut && (
        <div
          className="text-sm mb-4 cursor-pointer"
          onClick={() => setShowDetails(!showDetails)}
        >
          <div className="flex justify-between items-center p-3 hover:bg-muted rounded-xl transition-colors">
            <span className="text-muted-foreground">
              1 {tokenIn.symbol} = 0.00 {tokenOut.symbol}
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
          </div>
          {showDetails && (
            <div className="space-y-2 p-3 bg-muted rounded-xl mt-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price impact</span>
                <span className="text-green-500">{'<0.01%'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee (0.3%)</span>
                <span>0.00 {tokenIn.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Minimum received</span>
                <span>0.00 {tokenOut.symbol}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Button */}
      {!account ? (
        <Button className="w-full h-14 text-base font-semibold rounded-2xl" disabled>
          Connect Wallet
        </Button>
      ) : (
        <Button
          className="w-full h-14 text-base font-semibold rounded-2xl"
          disabled={!amountIn || parseFloat(amountIn) === 0}
        >
          {!amountIn || parseFloat(amountIn) === 0 ? 'Enter an amount' : 'Swap'}
        </Button>
      )}
    </Card>
  );
}
