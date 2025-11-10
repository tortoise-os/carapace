"use client"

import { useCurrentAccount } from "@mysten/dapp-kit"
import { useEffect, useState } from "react"
import { apiClient, type LiquidityPosition, type UserPositions } from "@/lib/api-client"

export function useUserPositions() {
  const account = useCurrentAccount()
  const [positions, setPositions] = useState<UserPositions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchPositions = async () => {
    if (!account?.address) {
      setLoading(false)
      setPositions(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.getUserPositions(account.address)
      setPositions(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch positions"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPositions()
    // biome-ignore lint/correctness/useExhaustiveDependencies: fetchPositions intentionally not wrapped
  }, [fetchPositions])

  return {
    positions,
    loading,
    error,
    refetch: fetchPositions,
  }
}

export function usePosition(poolId: string) {
  const account = useCurrentAccount()
  const [position, setPosition] = useState<LiquidityPosition | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchPosition = async () => {
    if (!account?.address || !poolId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.getPosition(account.address, poolId)
      setPosition(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch position"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosition()
    // biome-ignore lint/correctness/useExhaustiveDependencies: fetchPosition intentionally not wrapped
  }, [fetchPosition])

  return {
    position,
    loading,
    error,
    refetch: fetchPosition,
  }
}
