'use client';

import { useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@carapace/ui';
import { Copy, ExternalLink, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { WalletSelectorModal } from '@/components/wallet/wallet-selector-modal';

export function EnhancedWalletButton() {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showWalletSelector, setShowWalletSelector] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const copyAddress = () => {
    if (account?.address) {
      navigator.clipboard.writeText(account.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Prevent hydration mismatch by showing a placeholder until mounted
  if (!mounted) {
    return (
      <Button variant="secondary" className="rounded-2xl font-medium h-10 px-4" disabled>
        Connect
      </Button>
    );
  }

  if (!account) {
    return (
      <>
        <Button
          variant="secondary"
          className="rounded-2xl font-medium h-10 px-4"
          onClick={() => setShowWalletSelector(true)}
        >
          Connect Wallet
        </Button>
        <WalletSelectorModal
          open={showWalletSelector}
          onOpenChange={setShowWalletSelector}
        />
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" className="rounded-2xl font-medium h-10 px-4">
          {formatAddress(account.address)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
          <Copy className="mr-2 h-4 w-4" />
          {copied ? 'Copied!' : 'Copy address'}
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={`https://testnet.suivision.xyz/account/${account.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View on explorer
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => disconnect()} className="cursor-pointer text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
