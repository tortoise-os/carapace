'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  TokenIcon,
} from '@carapace/carapace-ui';
import { Search, Star, TrendingUp } from 'lucide-react';

interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoUrl?: string;
  balance?: string;
  priceUsd?: number;
  change24h?: number;
  isPopular?: boolean;
}

interface TokenSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectToken: (token: Token) => void;
  selectedToken?: Token;
}

// Mock token list - in production, fetch from API or blockchain
const AVAILABLE_TOKENS: Token[] = [
  {
    symbol: 'SUI',
    name: 'Sui',
    address: '0x2::sui::SUI',
    decimals: 9,
    balance: '1,234.56',
    priceUsd: 1.45,
    change24h: 5.2,
    isPopular: true,
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x5678::usdc::USDC',
    decimals: 6,
    balance: '500.00',
    priceUsd: 1.0,
    change24h: 0.01,
    isPopular: true,
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0x9abc::usdt::USDT',
    decimals: 6,
    balance: '250.00',
    priceUsd: 1.0,
    change24h: -0.02,
    isPopular: true,
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ethereum',
    address: '0xdef0::weth::WETH',
    decimals: 8,
    balance: '0.5',
    priceUsd: 2245.67,
    change24h: 3.8,
    isPopular: true,
  },
  {
    symbol: 'CETUS',
    name: 'Cetus Protocol',
    address: '0xabc1::cetus::CETUS',
    decimals: 9,
    priceUsd: 0.12,
    change24h: -2.1,
  },
  {
    symbol: 'SCA',
    name: 'Scallop',
    address: '0xdef2::sca::SCA',
    decimals: 9,
    priceUsd: 0.45,
    change24h: 8.5,
  },
];

export function TokenSelectorModal({
  open,
  onOpenChange,
  onSelectToken,
  selectedToken,
}: TokenSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(['SUI', 'USDC']);

  const filteredTokens = AVAILABLE_TOKENS.filter(
    (token) =>
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const popularTokens = filteredTokens.filter((t) => t.isPopular);
  const otherTokens = filteredTokens.filter((t) => !t.isPopular);

  const toggleFavorite = (symbol: string) => {
    setFavorites((prev) =>
      prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol]
    );
  };

  const handleSelectToken = (token: Token) => {
    onSelectToken(token);
    onOpenChange(false);
    setSearchQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Select a token</DialogTitle>
          <DialogDescription>
            Search and select a token to swap
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, symbol, or address"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </div>

        {/* Token List */}
        <div className="max-h-[400px] overflow-y-auto">
          {/* Popular Tokens */}
          {!searchQuery && popularTokens.length > 0 && (
            <div className="px-6 py-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                <TrendingUp className="h-3 w-3" />
                Popular Tokens
              </div>
              <div className="space-y-1">
                {popularTokens.map((token) => (
                  <TokenRow
                    key={token.address}
                    token={token}
                    isSelected={selectedToken?.address === token.address}
                    isFavorite={favorites.includes(token.symbol)}
                    onToggleFavorite={() => toggleFavorite(token.symbol)}
                    onSelect={() => handleSelectToken(token)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Tokens */}
          {(searchQuery || otherTokens.length > 0) && (
            <div className="px-6 py-2">
              {!searchQuery && (
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  All Tokens
                </div>
              )}
              <div className="space-y-1">
                {(searchQuery ? filteredTokens : otherTokens).map((token) => (
                  <TokenRow
                    key={token.address}
                    token={token}
                    isSelected={selectedToken?.address === token.address}
                    isFavorite={favorites.includes(token.symbol)}
                    onToggleFavorite={() => toggleFavorite(token.symbol)}
                    onSelect={() => handleSelectToken(token)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {filteredTokens.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">No tokens found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try a different search query
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            Can't find a token?{' '}
            <button className="text-primary hover:underline font-medium">
              Import custom token
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TokenRow({
  token,
  isSelected,
  isFavorite,
  onToggleFavorite,
  onSelect,
}: {
  token: Token;
  isSelected: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onSelect: () => void;
}) {
  return (
    <div
      className={`
        flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all
        ${isSelected ? 'bg-primary/10 border border-primary' : 'hover:bg-muted'}
      `}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3 flex-1">
        <TokenIcon
          symbol={token.symbol}
          size="md"
          gradient="bg-brand-gradient-ocean"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{token.symbol}</span>
            {token.priceUsd && (
              <span
                className={`text-xs font-medium ${
                  token.change24h! >= 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {token.change24h! >= 0 ? '+' : ''}
                {token.change24h?.toFixed(2)}%
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">{token.name}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {token.balance && (
          <div className="text-right">
            <div className="font-semibold text-sm">{token.balance}</div>
            {token.priceUsd && (
              <div className="text-xs text-muted-foreground">
                ${(parseFloat(token.balance.replace(/,/g, '')) * token.priceUsd).toFixed(2)}
              </div>
            )}
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={`p-1 rounded-lg hover:bg-background transition-colors ${
            isFavorite ? 'text-yellow-500' : 'text-muted-foreground'
          }`}
        >
          <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  );
}
