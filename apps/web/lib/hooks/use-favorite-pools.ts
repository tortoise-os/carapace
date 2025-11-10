"use client"

import { useCallback, useEffect, useState } from "react"

const FAVORITES_STORAGE_KEY = "favoritePools"

interface UseFavoritePoolsResult {
  favorites: Set<string>
  isFavorite: (poolId: string) => boolean
  toggleFavorite: (poolId: string) => void
  addFavorite: (poolId: string) => void
  removeFavorite: (poolId: string) => void
  clearFavorites: () => void
}

export function useFavoritePools(): UseFavoritePoolsResult {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY)
      if (stored) {
        const favArray = JSON.parse(stored) as string[]
        setFavorites(new Set(favArray))
      }
    } catch (error) {
      console.error("Failed to load favorite pools:", error)
    }
  }, [])

  // Save favorites to localStorage whenever they change
  const saveFavorites = useCallback((newFavorites: Set<string>) => {
    try {
      const favArray = Array.from(newFavorites)
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favArray))
    } catch (error) {
      console.error("Failed to save favorite pools:", error)
    }
  }, [])

  const isFavorite = useCallback(
    (poolId: string): boolean => {
      return favorites.has(poolId)
    },
    [favorites]
  )

  const addFavorite = useCallback(
    (poolId: string) => {
      setFavorites((prev) => {
        const newFavorites = new Set(prev)
        newFavorites.add(poolId)
        saveFavorites(newFavorites)
        return newFavorites
      })
    },
    [saveFavorites]
  )

  const removeFavorite = useCallback(
    (poolId: string) => {
      setFavorites((prev) => {
        const newFavorites = new Set(prev)
        newFavorites.delete(poolId)
        saveFavorites(newFavorites)
        return newFavorites
      })
    },
    [saveFavorites]
  )

  const toggleFavorite = useCallback(
    (poolId: string) => {
      if (favorites.has(poolId)) {
        removeFavorite(poolId)
      } else {
        addFavorite(poolId)
      }
    },
    [favorites, addFavorite, removeFavorite]
  )

  const clearFavorites = useCallback(() => {
    setFavorites(new Set())
    try {
      localStorage.removeItem(FAVORITES_STORAGE_KEY)
    } catch (error) {
      console.error("Failed to clear favorite pools:", error)
    }
  }, [])

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    clearFavorites,
  }
}
