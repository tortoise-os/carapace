"use client"

import { cn } from "../lib/utils"

export interface TokenIconProps {
  /** Token icon URL */
  iconUrl?: string
  /** Token symbol (used as fallback) */
  symbol?: string
  /** Size of the icon */
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  /** Additional className */
  className?: string
  /** Gradient to use if no icon */
  gradient?: string
}

const sizeMap = {
  xs: "w-4 h-4",
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
}

const textSizeMap = {
  xs: "text-[8px]",
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg",
}

/**
 * Token Icon Component
 * Displays a token icon with fallback to symbol initial
 */
export function TokenIcon({
  iconUrl,
  symbol = "?",
  size = "md",
  className,
  gradient = "bg-brand-gradient",
}: TokenIconProps) {
  const sizeClass = sizeMap[size]
  const textSize = textSizeMap[size]

  if (iconUrl) {
    return (
      <div className={cn("relative rounded-full overflow-hidden", sizeClass, className)}>
        {/* biome-ignore lint/performance/noImgElement: Shared UI library, consumer can optimize */}
        <img
          src={iconUrl}
          alt={symbol}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Hide broken image icon
            e.currentTarget.style.display = "none"
          }}
        />
        {/* Fallback if image fails to load */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center font-bold text-white",
            gradient,
            textSize
          )}
        >
          {symbol.charAt(0).toUpperCase()}
        </div>
      </div>
    )
  }

  // Fallback to symbol initial with gradient background
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-bold text-white shadow-md",
        gradient,
        sizeClass,
        textSize,
        className
      )}
    >
      {symbol.charAt(0).toUpperCase()}
    </div>
  )
}
