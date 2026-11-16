'use client'

// useReelProgress — turns scroll position inside a tall "reel" container into a
// step index, for a stage that pins with position: sticky while the page scrolls
// past it. State only changes when the step does, so a 41-year scrub re-renders
// 41 times rather than once per frame.
import { useEffect, useRef, useState } from 'react'
import { progressStep, reelProgress } from '@/lib/motion/reel'

const canPin = () =>
  typeof CSS !== 'undefined' &&
  typeof CSS.supports === 'function' &&
  CSS.supports('position', 'sticky')

/**
 * `step` is null whenever the reel is not driving — reduced motion, no sticky
 * support, or a container shorter than the viewport — so callers keep their
 * manual controls and their final state. Mirrors the CSS fences on the stage.
 */
export function useReelProgress<T extends HTMLElement>(steps: number) {
  const ref = useRef<T>(null)
  const [step, setStep] = useState<number | null>(null)
  const emitted = useRef<number | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!canPin()) return

    let frame = 0
    const measure = () => {
      frame = 0
      const { top, height } = el.getBoundingClientRect()
      const progress = reelProgress(top, height, window.innerHeight)
      const next = progress === null ? null : progressStep(progress, steps)
      if (next === emitted.current) return
      emitted.current = next
      setStep(next)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    measure()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [steps])

  return { ref, step }
}
