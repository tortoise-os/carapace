"use client"

import { useEffect, useRef } from "react"
import { toast } from "sonner"

export interface TransactionToast {
  id: string
  digest: string
  type: "swap" | "add_liquidity" | "remove_liquidity"
  status: "pending" | "success" | "error"
  message: string
  explorerUrl?: string
}

// Store active toasts to avoid duplicates
const activeToasts = new Map<string, string>()

export function useTransactionNotifications() {
  const previousToastsRef = useRef<Set<string>>(new Set())

  const showTransactionToast = (transaction: TransactionToast) => {
    // Avoid showing duplicate toasts
    if (previousToastsRef.current.has(transaction.id)) {
      return
    }

    previousToastsRef.current.add(transaction.id)

    const getTypeLabel = () => {
      switch (transaction.type) {
        case "swap":
          return "Swap"
        case "add_liquidity":
          return "Add Liquidity"
        case "remove_liquidity":
          return "Remove Liquidity"
        default:
          return "Transaction"
      }
    }

    const typeLabel = getTypeLabel()

    switch (transaction.status) {
      case "pending": {
        const toastId = toast.loading(`${typeLabel} in progress...`, {
          description: transaction.message,
          duration: Infinity, // Keep showing until status changes
        })
        activeToasts.set(transaction.id, toastId as string)
        break
      }

      case "success": {
        // Dismiss pending toast if exists
        const pendingToastId = activeToasts.get(transaction.id)
        if (pendingToastId) {
          toast.dismiss(pendingToastId)
          activeToasts.delete(transaction.id)
        }

        toast.success(`${typeLabel} successful!`, {
          description: transaction.message,
          duration: 5000,
          action: transaction.explorerUrl
            ? {
                label: "View",
                onClick: () => window.open(transaction.explorerUrl, "_blank"),
              }
            : undefined,
        })
        break
      }

      case "error": {
        // Dismiss pending toast if exists
        const errorPendingToastId = activeToasts.get(transaction.id)
        if (errorPendingToastId) {
          toast.dismiss(errorPendingToastId)
          activeToasts.delete(transaction.id)
        }

        toast.error(`${typeLabel} failed`, {
          description: transaction.message,
          duration: 7000,
        })
        break
      }
    }
  }

  const showSwapNotification = (params: {
    status: "pending" | "success" | "error"
    tokenIn: string
    tokenOut: string
    amountIn?: string
    amountOut?: string
    digest?: string
    error?: string
  }) => {
    const id = params.digest || `swap-${Date.now()}`

    let message = ""
    if (params.status === "pending") {
      message = `Swapping ${params.amountIn || ""} ${params.tokenIn} for ${params.tokenOut}`
    } else if (params.status === "success") {
      message = `Received ${params.amountOut || ""} ${params.tokenOut}`
    } else {
      message = params.error || "Transaction failed"
    }

    showTransactionToast({
      id,
      digest: params.digest || "",
      type: "swap",
      status: params.status,
      message,
      explorerUrl: params.digest
        ? `https://suiexplorer.com/txblock/${params.digest}?network=testnet`
        : undefined,
    })
  }

  const showLiquidityNotification = (params: {
    status: "pending" | "success" | "error"
    mode: "add" | "remove"
    poolName: string
    amount?: string
    digest?: string
    error?: string
  }) => {
    const id = params.digest || `liquidity-${params.mode}-${Date.now()}`
    const type = params.mode === "add" ? "add_liquidity" : "remove_liquidity"

    let message = ""
    if (params.status === "pending") {
      message = `${params.mode === "add" ? "Adding liquidity to" : "Removing liquidity from"} ${params.poolName}`
    } else if (params.status === "success") {
      message = `Successfully ${params.mode === "add" ? "added to" : "removed from"} ${params.poolName}`
    } else {
      message = params.error || "Transaction failed"
    }

    showTransactionToast({
      id,
      digest: params.digest || "",
      type,
      status: params.status,
      message,
      explorerUrl: params.digest
        ? `https://suiexplorer.com/txblock/${params.digest}?network=testnet`
        : undefined,
    })
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all active toasts when component unmounts
      // biome-ignore lint/suspicious/useIterableCallbackReturn: toast.dismiss returns void implicitly
      activeToasts.forEach((toastId) => toast.dismiss(toastId))
      activeToasts.clear()
      previousToastsRef.current.clear()
    }
  }, [])

  return {
    showTransactionToast,
    showSwapNotification,
    showLiquidityNotification,
  }
}

// Standalone notification functions for use outside components
export const transactionNotifications = {
  showSwapPending: (tokenIn: string, tokenOut: string, amountIn: string) => {
    toast.loading("Swap in progress...", {
      description: `Swapping ${amountIn} ${tokenIn} for ${tokenOut}`,
      duration: Infinity,
    })
  },

  showSwapSuccess: (tokenOut: string, amountOut: string, digest: string) => {
    toast.success("Swap successful!", {
      description: `Received ${amountOut} ${tokenOut}`,
      duration: 5000,
      action: {
        label: "View",
        onClick: () =>
          window.open(`https://suiexplorer.com/txblock/${digest}?network=testnet`, "_blank"),
      },
    })
  },

  showSwapError: (error: string) => {
    toast.error("Swap failed", {
      description: error,
      duration: 7000,
    })
  },

  showLiquiditySuccess: (mode: "add" | "remove", poolName: string) => {
    toast.success(`Liquidity ${mode === "add" ? "added" : "removed"}!`, {
      description: `Successfully ${mode === "add" ? "added to" : "removed from"} ${poolName}`,
      duration: 5000,
    })
  },

  showLiquidityError: (mode: "add" | "remove", error: string) => {
    toast.error(`Failed to ${mode} liquidity`, {
      description: error,
      duration: 7000,
    })
  },
}
