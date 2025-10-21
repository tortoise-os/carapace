'use client';

import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { CarapaceSDK } from '@carapace/sdk';
import '@mysten/dapp-kit/dist/index.css';

const network = (process.env.NEXT_PUBLIC_SUI_NETWORK as 'mainnet' | 'testnet' | 'devnet') || 'testnet';

// Create QueryClient outside of component to prevent hydration issues
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

// Create SDK context
const CarapaceSDKContext = createContext<CarapaceSDK | null>(null);

export function useCarapaceSDK() {
  const sdk = useContext(CarapaceSDKContext);
  if (!sdk) {
    throw new Error('useCarapaceSDK must be used within SuiProvider');
  }
  return sdk;
}

export function SuiProvider({ children }: { children: ReactNode }) {
  // Initialize Carapace SDK
  const sdk = useMemo(
    () =>
      new CarapaceSDK({
        network,
        rpcUrl: getFullnodeUrl(network),
      }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={{ [network]: { url: getFullnodeUrl(network) } }} defaultNetwork={network}>
        <WalletProvider autoConnect>
          <CarapaceSDKContext.Provider value={sdk}>{children}</CarapaceSDKContext.Provider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
