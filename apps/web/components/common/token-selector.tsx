'use client';

import { useState } from 'react';
import { Card, TokenIcon, Input, Button } from '@carapace/carapace-ui';
import { Search, Check, AlertCircle, ShieldCheck } from 'lucide-react';
import { useTokens } from '@/lib/hooks/use-tokens';
import type { Token } from '@/lib/api-client';

interface TokenSelectorProps {
  selectedToken: Token | null;
  onSelectToken: (token: Token) => void;
  excludeToken?: Token | null;
  onlyVerified?: boolean;
  onClose?: () => void;
}

export function TokenSelector({
  selectedToken,
  onSelectToken,
  excludeToken,
  onlyVerified = false,
  onClose,
}: TokenSelectorProps) {
  const { tokens, loading, error } = useTokens({
    enabled: true,
    verified: onlyVerified ? true : undefined,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTokens = tokens.filter((token) => {
    // Exclude the other selected token
    if (excludeToken && token.address === excludeToken.address) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        token.symbol.toLowerCase().includes(query) ||
        token.name.toLowerCase().includes(query) ||
        token.address.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const handleSelect = (token: Token) => {
    onSelectToken(token);
    onClose?.();
  };

  return (
    <Card className="w-full max-w-md">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold mb-4">Select Token</h3>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name or symbol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Token List */}
      <div className="max-h-96 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 text-destructive" />
            <p className="text-sm text-destructive">Failed to load tokens</p>
            <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
          </div>
        )}

        {!loading && !error && filteredTokens.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No tokens found</p>
          </div>
        )}

        {!loading && !error && filteredTokens.length > 0 && (
          <div className="divide-y">
            {filteredTokens.map((token) => {
              const isSelected = selectedToken?.address === token.address;

              return (
                <button
                  key={token.id}
                  onClick={() => handleSelect(token)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-accent/50 transition-colors ${
                    isSelected ? 'bg-accent/30' : ''
                  }`}
                >
                  <TokenIcon
                    symbol={token.symbol}
                    size="md"
                    gradient="bg-brand-gradient-ocean"
                  />

                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{token.symbol}</span>
                      {token.verified && (
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{token.name}</div>
                  </div>

                  {isSelected && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {onClose && (
        <div className="p-4 border-t">
          <Button variant="outline" onClick={onClose} className="w-full">
            Cancel
          </Button>
        </div>
      )}
    </Card>
  );
}
