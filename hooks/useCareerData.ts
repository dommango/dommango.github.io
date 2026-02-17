'use client'

import { useEffect, useState } from 'react'

interface CareerEntry {
  title: string
  date: string
  description?: string
  tags?: string[]
  [key: string]: unknown
}

interface UseCareerDataReturn {
  data: CareerEntry[] | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Custom hook for fetching career data
 * Handles loading and error states
 */
export function useCareerData(): UseCareerDataReturn {
  const [data, setData] = useState<CareerEntry[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // In a real app, this would fetch from an API
      // For now, we assume data is loaded server-side
      // This hook can be used for client-side refetching if needed

      setLoading(false)
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      setError(errorObj)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return {
    data,
    loading,
    error,
    refetch: fetchData
  }
}

/**
 * Hook for caching data with timestamps
 */
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  cacheTime = 5 * 60 * 1000 // 5 minutes
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const cached = typeof window !== 'undefined'
      ? sessionStorage.getItem(`cache_${key}`)
      : null

    if (cached) {
      const { data: cachedData, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp < cacheTime) {
        setData(cachedData)
        setLoading(false)
        return
      }
    }

    fetcher()
      .then((result) => {
        setData(result)
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(
            `cache_${key}`,
            JSON.stringify({
              data: result,
              timestamp: Date.now()
            })
          )
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error(String(err)))
      })
      .finally(() => {
        setLoading(false)
      })
  }, [key, fetcher, cacheTime])

  return { data, loading, error }
}
