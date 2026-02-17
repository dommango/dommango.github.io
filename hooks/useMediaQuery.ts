'use client'

import { useEffect, useState } from 'react'

/**
 * Hook to detect media query matches
 * @param query - CSS media query string
 * @returns boolean indicating if media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false)

  useEffect(() => {
    // Set initial value
    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [query])

  return matches
}

/**
 * Common breakpoints
 */
export const BREAKPOINTS = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)'
} as const

/**
 * Helper hooks for common breakpoints
 */
export function useIsMobile() {
  return !useMediaQuery(BREAKPOINTS.md)
}

export function useIsTablet() {
  return useMediaQuery(BREAKPOINTS.md) && !useMediaQuery(BREAKPOINTS.lg)
}

export function useIsDesktop() {
  return useMediaQuery(BREAKPOINTS.lg)
}
