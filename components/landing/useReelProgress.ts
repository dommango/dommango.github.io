'use client'

// useReelProgress — turns scroll position inside a tall "reel" container into a
// step index, for a stage that pins with position: sticky while the page scrolls
// past it. State only changes when the step does, so a 41-year scrub re-renders
// 41 times rather than once per frame.
import { useEffect, useRef, useState } from 'react'
import { progressStep, reelProgress } from '@/lib/motion/reel'

/** The stage is the container's first child; the CSS alone decides whether it pins. */
const stagePinned = (container: HTMLElement) => {
  const stage = container.firstElementChild
  return stage !== null && window.getComputedStyle(stage).position === 'sticky'
}

/**
 * `step` is null whenever the reel is not driving — the CSS left the stage
 * unpinned (reduced motion, no scripting or sticky support), or the container
 * is shorter than the viewport — so callers keep their manual controls and
 * their final state. Reading the stage's computed position, rather than
 * re-asking the media queries, keeps this from disagreeing with the CSS.
 */
export function useReelProgress<T extends HTMLElement>(steps: number) {
  const ref = useRef<T>(null)
  const [step, setStep] = useState<number | null>(null)
  const emitted = useRef<number | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!stagePinned(el)) return

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
