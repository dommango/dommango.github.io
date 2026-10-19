'use client'

// CountUp — ticks 0 → value once when `active` first turns true, then shows
// `value` directly so the year scrubber stays instant afterwards. Shows the real
// value until activated, so server HTML and no-JS visitors see the number, not 0.
import { useEffect, useState } from 'react'

const DURATION_MS = 700

export function CountUp({ value, active }: { value: number; active: boolean }) {
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!active) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const start = performance.now()
    let raf = 0
    const step = (now: number) => {
      const t = reduced ? 1 : Math.min(1, (now - start) / DURATION_MS)
      setProgress(1 - Math.pow(1 - t, 3))
      if (t < 1) raf = requestAnimationFrame(step)
      else setDone(true)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [active])

  return <>{active && !done ? Math.round(value * progress) : value}</>
}
