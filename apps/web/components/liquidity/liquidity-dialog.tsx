"use client"

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  ShimmerButton,
  TokenIcon,
} from "@carapace/carapace-ui"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { Loader2, Minus, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import type { Pool } from "@/lib/api-client"

interface LiquidityDialogProps {
  pool: Pool
  mode: "add" | "remove"
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LiquidityDialog({ pool, mode, open, onOpenChange }: LiquidityDialogProps) {
  const account = useCurrentAccount()

  const [amountX, setAmountX] = useState("")
  const [amountY, setAmountY] = useState("")
  const [lpAmount, setLpAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const tokenXSymbol = pool.token_x.split("::").pop() || "Token X"
  const tokenYSymbol = pool.token_y.split("::").pop() || "Token Y"

  // Calculate proportional amounts for add liquidity
  useEffect(() => {
    if (mode === "add" && amountX && pool) {
      const reserveX = BigInt(pool.reserve_x)
      const reserveY = BigInt(pool.reserve_y)

      if (reserveX > 0n) {
        const amountXBigInt = BigInt(Math.floor(parseFloat(amountX) * 1e9)) // Assuming 9 decimals
        const proportionalY = (amountXBigInt * reserveY) / reserveX
        const amountYValue = Number(proportionalY) / 1e9
        setAmountY(amountYValue.toFixed(6))
      }
    }
  }, [amountX, pool, mode])

  // Calculate proportional token amounts for remove liquidity
  useEffect(() => {
    if (mode === "remove" && lpAmount && pool) {
      const lpSupply = BigInt(pool.lp_supply)
      const reserveX = BigInt(pool.reserve_x)
      const reserveY = BigInt(pool.reserve_y)

      if (lpSupply > 0n) {
        const lpAmountBigInt = BigInt(Math.floor(parseFloat(lpAmount) * 1e9))
        const tokenX = (lpAmountBigInt * reserveX) / lpSupply
        const tokenY = (lpAmountBigInt * reserveY) / lpSupply

        setAmountX((Number(tokenX) / 1e9).toFixed(6))
        setAmountY((Number(tokenY) / 1e9).toFixed(6))
      }
    }
  }, [lpAmount, pool, mode])

  const handleAddLiquidity = async () => {
    if (!account || !amountX || !amountY) return

    setIsProcessing(true)
    try {
      // Show preview
      toast.info("Add Liquidity Preview", {
        description: `Would add ${amountX} ${tokenXSymbol} and ${amountY} ${tokenYSymbol} to the pool`,
        duration: 5000,
      })

      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast.success("Liquidity Preview Successful!", {
        description: `You would receive ~${Math.sqrt(parseFloat(amountX) * parseFloat(amountY)).toFixed(6)} LP tokens`,
        duration: 5000,
      })

      toast.warning("Blockchain Integration Required", {
        description: "Deploy smart contracts to enable actual liquidity operations.",
        duration: 6000,
      })

      // Close dialog
      setTimeout(() => {
        onOpenChange(false)
        setAmountX("")
        setAmountY("")
      }, 1000)
    } catch (error) {
      console.error("Add liquidity error:", error)
      toast.error("Preview error", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRemoveLiquidity = async () => {
    if (!account || !lpAmount) return

    setIsProcessing(true)
    try {
      // Show preview
      toast.info("Remove Liquidity Preview", {
        description: `Would burn ${lpAmount} LP tokens`,
        duration: 5000,
      })

      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast.success("Liquidity Removal Preview Successful!", {
        description: `You would receive ${amountX} ${tokenXSymbol} and ${amountY} ${tokenYSymbol}`,
        duration: 5000,
      })

      toast.warning("Blockchain Integration Required", {
        description: "Deploy smart contracts to enable actual liquidity operations.",
        duration: 6000,
      })

      // Close dialog
      setTimeout(() => {
        onOpenChange(false)
        setLpAmount("")
        setAmountX("")
        setAmountY("")
      }, 1000)
    } catch (error) {
      console.error("Remove liquidity error:", error)
      toast.error("Preview error", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "add" ? (
              <>
                <Plus className="h-5 w-5" />
                Add Liquidity
              </>
            ) : (
              <>
                <Minus className="h-5 w-5" />
                Remove Liquidity
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Add liquidity to earn trading fees"
              : "Remove your liquidity from the pool"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Pool Info */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-xl">
            <div className="flex -space-x-2">
              <TokenIcon
                symbol={tokenXSymbol}
                size="sm"
                gradient="bg-brand-gradient-ocean"
                className="border-2 border-card"
              />
              <TokenIcon
                symbol={tokenYSymbol}
                size="sm"
                gradient="bg-brand-gradient-seafoam"
                className="border-2 border-card"
              />
            </div>
            <span className="font-semibold">
              {tokenXSymbol} / {tokenYSymbol}
            </span>
          </div>

          {mode === "add" ? (
            <>
              {/* Token X Input */}
              <div className="space-y-2">
                <label
                  htmlFor="liquidity-amount-x"
                  className="text-sm font-semibold text-muted-foreground"
                >
                  {tokenXSymbol} Amount
                </label>
                <div className="flex items-center gap-2 p-4 bg-muted rounded-xl">
                  <Input
                    id="liquidity-amount-x"
                    type="text"
                    placeholder="0.0"
                    value={amountX}
                    onChange={(e) => setAmountX(e.target.value)}
                    className="border-0 bg-transparent text-2xl font-bold p-0 focus-visible:ring-0"
                  />
                  <TokenIcon symbol={tokenXSymbol} size="sm" gradient="bg-brand-gradient-ocean" />
                </div>
              </div>

              {/* Token Y Input */}
              <div className="space-y-2">
                <label
                  htmlFor="liquidity-amount-y"
                  className="text-sm font-semibold text-muted-foreground"
                >
                  {tokenYSymbol} Amount
                </label>
                <div className="flex items-center gap-2 p-4 bg-muted rounded-xl">
                  <Input
                    id="liquidity-amount-y"
                    type="text"
                    placeholder="0.0"
                    value={amountY}
                    readOnly
                    className="border-0 bg-transparent text-2xl font-bold p-0 focus-visible:ring-0"
                  />
                  <TokenIcon symbol={tokenYSymbol} size="sm" gradient="bg-brand-gradient-seafoam" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Amount calculated automatically to maintain pool ratio
                </p>
              </div>

              {/* Pool Share Preview */}
              {amountX && amountY && (
                <div className="p-3 bg-muted rounded-xl space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Your pool share</span>
                    <span className="font-semibold">~0.01%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">LP tokens</span>
                    <span className="font-semibold">
                      ~{Math.sqrt(parseFloat(amountX) * parseFloat(amountY)).toFixed(6)}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Button */}
              {!account ? (
                <Button className="w-full" disabled>
                  Connect Wallet
                </Button>
              ) : !amountX || parseFloat(amountX) === 0 ? (
                <Button className="w-full" disabled>
                  Enter an amount
                </Button>
              ) : (
                <ShimmerButton
                  className="w-full"
                  onClick={handleAddLiquidity}
                  disabled={isProcessing}
                  shimmerColor="rgba(0, 255, 241, 0.8)"
                  background="linear-gradient(135deg, hsl(var(--brand-teal)), hsl(var(--brand-cyan)))"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Liquidity...
                    </>
                  ) : (
                    "Add Liquidity"
                  )}
                </ShimmerButton>
              )}
            </>
          ) : (
            <>
              {/* LP Token Input */}
              <div className="space-y-2">
                <label
                  htmlFor="liquidity-lp-amount"
                  className="text-sm font-semibold text-muted-foreground"
                >
                  LP Token Amount
                </label>
                <div className="flex items-center gap-2 p-4 bg-muted rounded-xl">
                  <Input
                    id="liquidity-lp-amount"
                    type="text"
                    placeholder="0.0"
                    value={lpAmount}
                    onChange={(e) => setLpAmount(e.target.value)}
                    className="border-0 bg-transparent text-2xl font-bold p-0 focus-visible:ring-0"
                  />
                  <span className="text-sm font-semibold">LP</span>
                </div>
              </div>

              {/* Token Amounts Preview */}
              {lpAmount && (
                <div className="p-3 bg-muted rounded-xl space-y-2">
                  <p className="text-sm font-semibold mb-2">You will receive:</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TokenIcon
                        symbol={tokenXSymbol}
                        size="sm"
                        gradient="bg-brand-gradient-ocean"
                      />
                      <span className="text-sm text-muted-foreground">{tokenXSymbol}</span>
                    </div>
                    <span className="font-semibold">{amountX}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TokenIcon
                        symbol={tokenYSymbol}
                        size="sm"
                        gradient="bg-brand-gradient-seafoam"
                      />
                      <span className="text-sm text-muted-foreground">{tokenYSymbol}</span>
                    </div>
                    <span className="font-semibold">{amountY}</span>
                  </div>
                </div>
              )}

              {/* Action Button */}
              {!account ? (
                <Button className="w-full" disabled>
                  Connect Wallet
                </Button>
              ) : !lpAmount || parseFloat(lpAmount) === 0 ? (
                <Button className="w-full" disabled>
                  Enter an amount
                </Button>
              ) : (
                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={handleRemoveLiquidity}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Removing Liquidity...
                    </>
                  ) : (
                    "Remove Liquidity"
                  )}
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
