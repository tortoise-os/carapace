'use client';

import { useState } from 'react';
import { Card, Button, Input, TokenIcon } from '@carapace/ui';
import { ArrowRight, ArrowLeft, Check, Info } from 'lucide-react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { toast } from 'sonner';
import { useTokens } from '@/lib/hooks/use-tokens';
import type { Token } from '@/lib/api-client';

const FEE_TIERS = [
  { value: 5, label: '0.05%', description: 'Best for very stable pairs' },
  { value: 30, label: '0.3%', description: 'Best for most pairs' },
  { value: 100, label: '1%', description: 'Best for volatile pairs' },
];

export function CreatePoolWizard() {
  const account = useCurrentAccount();
  const { tokens, loading: tokensLoading } = useTokens({ enabled: true });
  const [step, setStep] = useState(1);

  // Form state
  const [tokenA, setTokenA] = useState<Token | null>(null);
  const [tokenB, setTokenB] = useState<Token | null>(null);
  const [feeTier, setFeeTier] = useState(30);
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [initialPrice, setInitialPrice] = useState('');

  const handleNext = () => {
    if (step === 1 && (!tokenA || !tokenB)) {
      toast.error('Please select both tokens');
      return;
    }
    if (step === 3 && (!amountA || !amountB)) {
      toast.error('Please enter initial liquidity amounts');
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  const handleCreatePool = () => {
    toast.info('Pool creation coming soon', {
      description: 'This feature will be available after smart contract deployment',
    });
  };

  return (
    <Card className="max-w-2xl mx-auto p-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                s < step
                  ? 'bg-green-500 text-white'
                  : s === step
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {s < step ? <Check className="h-5 w-5" /> : s}
            </div>
            {s < 4 && (
              <div
                className={`w-16 h-1 mx-2 ${
                  s < step ? 'bg-green-500' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {step === 1 && (
          <Step1SelectTokens
            tokenA={tokenA}
            tokenB={tokenB}
            onSelectTokenA={setTokenA}
            onSelectTokenB={setTokenB}
            availableTokens={tokens}
            loading={tokensLoading}
          />
        )}
        {step === 2 && (
          <Step2SelectFee
            feeTier={feeTier}
            onSelectFee={setFeeTier}
          />
        )}
        {step === 3 && (
          <Step3SetPrice
            tokenA={tokenA!}
            tokenB={tokenB!}
            amountA={amountA}
            amountB={amountB}
            initialPrice={initialPrice}
            onAmountAChange={setAmountA}
            onAmountBChange={setAmountB}
            onPriceChange={setInitialPrice}
          />
        )}
        {step === 4 && (
          <Step4Review
            tokenA={tokenA!}
            tokenB={tokenB!}
            feeTier={feeTier}
            amountA={amountA}
            amountB={amountB}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {step < 4 ? (
          <Button onClick={handleNext}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleCreatePool} disabled={!account}>
            Create Pool
          </Button>
        )}
      </div>
    </Card>
  );
}

function Step1SelectTokens({
  tokenA,
  tokenB,
  onSelectTokenA,
  onSelectTokenB,
  availableTokens,
  loading,
}: {
  tokenA: Token | null;
  tokenB: Token | null;
  onSelectTokenA: (token: Token) => void;
  onSelectTokenB: (token: Token) => void;
  availableTokens: Token[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-2">Select Token Pair</h2>
        <p className="text-muted-foreground mb-6">
          Choose the two tokens for your liquidity pool
        </p>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Select Token Pair</h2>
      <p className="text-muted-foreground mb-6">
        Choose the two tokens for your liquidity pool
      </p>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Token A</label>
          <div className="grid grid-cols-2 gap-2">
            {availableTokens.map((token) => (
              <button
                key={token.address}
                onClick={() => onSelectTokenA(token)}
                disabled={tokenB?.address === token.address}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  tokenA?.address === token.address
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center gap-2">
                  <TokenIcon symbol={token.symbol} size="md" gradient="bg-brand-gradient-ocean" />
                  <div className="text-left">
                    <div className="font-semibold">{token.symbol}</div>
                    <div className="text-xs text-muted-foreground">{token.name}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Token B</label>
          <div className="grid grid-cols-2 gap-2">
            {availableTokens.map((token) => (
              <button
                key={token.address}
                onClick={() => onSelectTokenB(token)}
                disabled={tokenA?.address === token.address}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  tokenB?.address === token.address
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center gap-2">
                  <TokenIcon symbol={token.symbol} size="md" gradient="bg-brand-gradient-seafoam" />
                  <div className="text-left">
                    <div className="font-semibold">{token.symbol}</div>
                    <div className="text-xs text-muted-foreground">{token.name}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {tokenA && tokenB && (
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 justify-center">
            <TokenIcon symbol={tokenA.symbol} size="sm" gradient="bg-brand-gradient-ocean" />
            <span className="font-semibold">{tokenA.symbol}</span>
            <span className="text-muted-foreground">/</span>
            <TokenIcon symbol={tokenB.symbol} size="sm" gradient="bg-brand-gradient-seafoam" />
            <span className="font-semibold">{tokenB.symbol}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Step2SelectFee({
  feeTier,
  onSelectFee,
}: {
  feeTier: number;
  onSelectFee: (fee: number) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Set Fee Tier</h2>
      <p className="text-muted-foreground mb-6">
        Choose the fee percentage for this pool
      </p>

      <div className="space-y-3">
        {FEE_TIERS.map((tier) => (
          <button
            key={tier.value}
            onClick={() => onSelectFee(tier.value)}
            className={`w-full p-4 border-2 rounded-lg transition-colors text-left ${
              feeTier === tier.value
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xl font-bold">{tier.label}</span>
              {feeTier === tier.value && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">{tier.description}</p>
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex gap-2">
          <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-blue-600 mb-1">Fee Information</p>
            <p className="text-muted-foreground">
              Liquidity providers earn fees on every swap. Higher fees mean more earnings but may reduce trading volume.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step3SetPrice({
  tokenA,
  tokenB,
  amountA,
  amountB,
  initialPrice,
  onAmountAChange,
  onAmountBChange,
  onPriceChange,
}: {
  tokenA: Token;
  tokenB: Token;
  amountA: string;
  amountB: string;
  initialPrice: string;
  onAmountAChange: (value: string) => void;
  onAmountBChange: (value: string) => void;
  onPriceChange: (value: string) => void;
}) {
  const handleAmountAChange = (value: string) => {
    onAmountAChange(value);
    if (value && initialPrice) {
      const calculatedB = parseFloat(value) * parseFloat(initialPrice);
      onAmountBChange(calculatedB.toFixed(6));
    }
  };

  const handlePriceChange = (value: string) => {
    onPriceChange(value);
    if (amountA && value) {
      const calculatedB = parseFloat(amountA) * parseFloat(value);
      onAmountBChange(calculatedB.toFixed(6));
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Set Initial Price</h2>
      <p className="text-muted-foreground mb-6">
        Deposit tokens and set the starting price for your pool
      </p>

      <div className="space-y-4">
        <div className="bg-muted rounded-lg p-4">
          <label className="text-sm font-medium mb-2 block">
            Initial Price (1 {tokenA.symbol} = ? {tokenB.symbol})
          </label>
          <Input
            type="number"
            placeholder="0.00"
            value={initialPrice}
            onChange={(e) => handlePriceChange(e.target.value)}
            className="text-2xl font-bold"
          />
        </div>

        <div className="bg-muted rounded-lg p-4">
          <label className="text-sm font-medium mb-2 block">
            {tokenA.symbol} Amount
          </label>
          <div className="flex items-center gap-2">
            <TokenIcon symbol={tokenA.symbol} size="sm" gradient="bg-brand-gradient-ocean" />
            <Input
              type="number"
              placeholder="0.00"
              value={amountA}
              onChange={(e) => handleAmountAChange(e.target.value)}
              className="text-xl font-semibold"
            />
          </div>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <label className="text-sm font-medium mb-2 block">
            {tokenB.symbol} Amount
          </label>
          <div className="flex items-center gap-2">
            <TokenIcon symbol={tokenB.symbol} size="sm" gradient="bg-brand-gradient-seafoam" />
            <Input
              type="number"
              placeholder="0.00"
              value={amountB}
              onChange={(e) => onAmountBChange(e.target.value)}
              className="text-xl font-semibold"
            />
          </div>
        </div>
      </div>

      {amountA && amountB && (
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Initial Pool Ratio</div>
          <div className="text-lg font-semibold">
            1 {tokenA.symbol} = {(parseFloat(amountB) / parseFloat(amountA)).toFixed(6)} {tokenB.symbol}
          </div>
        </div>
      )}
    </div>
  );
}

function Step4Review({
  tokenA,
  tokenB,
  feeTier,
  amountA,
  amountB,
}: {
  tokenA: Token;
  tokenB: Token;
  feeTier: number;
  amountA: string;
  amountB: string;
}) {
  const feeTierLabel = FEE_TIERS.find(t => t.value === feeTier)?.label || `${feeTier / 100}%`;
  const price = parseFloat(amountB) / parseFloat(amountA);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Review Pool</h2>
      <p className="text-muted-foreground mb-6">
        Confirm your pool details before creating
      </p>

      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <div className="text-sm text-muted-foreground mb-2">Token Pair</div>
          <div className="flex items-center gap-2">
            <TokenIcon symbol={tokenA.symbol} size="md" gradient="bg-brand-gradient-ocean" />
            <span className="text-xl font-bold">{tokenA.symbol}</span>
            <span className="text-muted-foreground">/</span>
            <TokenIcon symbol={tokenB.symbol} size="md" gradient="bg-brand-gradient-seafoam" />
            <span className="text-xl font-bold">{tokenB.symbol}</span>
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="text-sm text-muted-foreground mb-2">Fee Tier</div>
          <div className="text-xl font-bold">{feeTierLabel}</div>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="text-sm text-muted-foreground mb-2">Initial Price</div>
          <div className="text-xl font-bold">
            1 {tokenA.symbol} = {price.toFixed(6)} {tokenB.symbol}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground mb-2">{tokenA.symbol} Deposit</div>
            <div className="text-xl font-bold">{amountA}</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground mb-2">{tokenB.symbol} Deposit</div>
            <div className="text-xl font-bold">{amountB}</div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <div className="flex gap-2">
          <Info className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-yellow-600 mb-1">Important</p>
            <p className="text-muted-foreground">
              Once created, the pool cannot be deleted. Make sure all details are correct before proceeding.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
