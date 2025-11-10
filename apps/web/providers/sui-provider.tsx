"use client"

import { CarapaceSDK } from "@carapace/sdk"
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit"
import { getFullnodeUrl } from "@mysten/sui/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createContext, type ReactNode, useContext, useMemo } from "react"
import "@mysten/dapp-kit/dist/index.css"

const network =
  (process.env.NEXT_PUBLIC_SUI_NETWORK as "mainnet" | "testnet" | "devnet") || "testnet"

// Package ID from deployment
const PACKAGE_ID = "0x998379bb53423871a9e4f8f779c339c096622209309452995ae5ed395779106e"

// Create QueryClient outside of component to prevent hydration issues
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
})

// Create SDK context
const CarapaceSDKContext = createContext<CarapaceSDK | null>(null)

export function useCarapaceSDK() {
  const sdk = useContext(CarapaceSDKContext)
  if (!sdk) {
    throw new Error("useCarapaceSDK must be used within SuiProvider")
  }
  return sdk
}

export function SuiProvider({ children }: { children: ReactNode }) {
  // Initialize Carapace SDK
  const sdk = useMemo(
    () =>
      new CarapaceSDK({
        network,
        rpcUrl: getFullnodeUrl(network),
        packageIds: { carapace: PACKAGE_ID },
      }),
    []
  )

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider
        networks={{ [network]: { url: getFullnodeUrl(network) } }}
        defaultNetwork={network}
      >
        <WalletProvider autoConnect>
          <CarapaceSDKContext.Provider value={sdk}>{children}</CarapaceSDKContext.Provider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  )
}
