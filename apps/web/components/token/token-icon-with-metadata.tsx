"use client"

import { TokenIcon, type TokenIconProps } from "@carapace/carapace-ui"
import { useTokenMetadata } from "@/hooks/use-token-metadata"

interface TokenIconWithMetadataProps extends Omit<TokenIconProps, "iconUrl" | "symbol"> {
  /** Full coin type (e.g., '0x2::sui::SUI') */
  coinType: string
  /** Fallback symbol if metadata fails to load */
  fallbackSymbol?: string
}

/**
 * Token Icon that automatically fetches metadata from Sui blockchain
 * Combines the TokenIcon component with the useTokenMetadata hook
 */
export function TokenIconWithMetadata({
  coinType,
  fallbackSymbol = "?",
  size = "md",
  className,
  gradient = "bg-brand-gradient",
}: TokenIconWithMetadataProps) {
  const { metadata, loading } = useTokenMetadata(coinType)

  // Show loading state with gradient
  if (loading) {
    return <TokenIcon symbol="..." size={size} className={className} gradient={gradient} />
  }

  return (
    <TokenIcon
      iconUrl={metadata?.iconUrl}
      symbol={metadata?.symbol || fallbackSymbol}
      size={size}
      className={className}
      gradient={gradient}
    />
  )
}
