'use client';

import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { Button } from '@/components/ui/button';

export function WalletButton() {
  const account = useCurrentAccount();

  return (
    <ConnectButton
      connectText="Connect Wallet"
      connectedText={`${account?.address.slice(0, 6)}...${account?.address.slice(-4)}`}
    />
  );
}
