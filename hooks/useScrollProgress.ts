'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Hook to track scroll progress (0-100)
 * @returns number between 0 and 100
 */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState<number>(0)

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight - windowHeight
      const scrolled = window.scrollY
      const scrollProgress = documentHeight > 0 ? (scrolled / documentHeight) * 100 : 0
      setProgress(scrollProgress)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return progress
}

/**
 * Hook to detect if element is in viewport
 * @param options - IntersectionObserver options
 * @returns ref to attach to element, isVisible boolean
 */
export function useInView(
  options?: IntersectionObserverInit
): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState<boolean>(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true)
        observer.unobserve(entry.target)
      }
    }, options)

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [options])

  return [ref, isInView]
}
