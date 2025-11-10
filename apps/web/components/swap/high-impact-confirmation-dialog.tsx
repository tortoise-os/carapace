"use client"

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@carapace/carapace-ui"
import { AlertTriangle } from "lucide-react"
import type { PriceImpactData } from "@/lib/utils/price-impact"
import { formatPriceImpact, getPriceImpactWarning } from "@/lib/utils/price-impact"

interface HighImpactConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  priceImpact: PriceImpactData
  tokenInSymbol: string
  tokenOutSymbol: string
  amountIn: string
  amountOut: string
}

export function HighImpactConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  priceImpact,
  tokenInSymbol,
  tokenOutSymbol,
  amountIn,
  amountOut,
}: HighImpactConfirmationDialogProps) {
  const { severity, color, percentage } = priceImpact

  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-full bg-orange-500/10">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
            </div>
            <DialogTitle className="text-xl">
              {severity === "critical"
                ? "Critical Price Impact Warning"
                : "High Price Impact Warning"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-base">
            This swap has a {severity === "critical" ? "very high" : "high"} price impact and you
            may receive significantly less than expected.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Price Impact Display */}
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Price Impact</span>
              <span className={`text-lg font-bold ${color}`}>{formatPriceImpact(percentage)}</span>
            </div>
            <p className="text-xs text-muted-foreground">{getPriceImpactWarning(severity)}</p>
          </div>

          {/* Swap Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">You pay</span>
              <span className="font-semibold">
                {amountIn} {tokenInSymbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">You receive</span>
              <span className="font-semibold">
                {amountOut} {tokenOutSymbol}
              </span>
            </div>
          </div>

          {/* Warning List */}
          {severity === "critical" && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>This trade will significantly move the market price</li>
                <li>Consider splitting your trade into smaller amounts</li>
                <li>Or try finding an alternative route with better liquidity</li>
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 sm:flex-none bg-orange-600 hover:bg-orange-700"
          >
            I understand, swap anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
