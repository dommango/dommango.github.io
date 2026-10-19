'use client'

// useInView — flips `inView` to true once, the first time the element nears the
// viewport. One-shot by design: scroll-back never replays the entrance.
import { useEffect, useRef, useState } from 'react'

export function useInView<T extends Element>() {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setInView(true)
        io.disconnect()
      },
      // Inset the bottom edge so tall elements trigger before they're half read.
      { rootMargin: '0px 0px -10% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return { ref, inView }
}
