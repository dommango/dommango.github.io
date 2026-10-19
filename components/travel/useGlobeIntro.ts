'use client'

// Intro choreography for the flight globe: the globe drifts into place while the
// routes draw in (CSS, see "Flight globe intro" in globals.css). Timings here
// must stay in step with the --draw-ms keyframe duration there.
import { useEffect, useState, type Dispatch, type RefObject, type SetStateAction } from 'react'

type Rotation = [number, number, number]

export const INTRO_START_LON = -50
export const DRAW_MS = 900
export const MAX_STAGGER_MS = 1200
const SPIN_MS = 1400
const INTRO_TOTAL_MS = MAX_STAGGER_MS + DRAW_MS + 300

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** True once the intro window after `active` has elapsed. Stays true afterwards. */
export function useIntroDone(active: boolean) {
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (!active) return
    const id = setTimeout(() => setDone(true), INTRO_TOTAL_MS)
    return () => clearTimeout(id)
  }, [active])
  return done
}

/** Eases longitude from INTRO_START_LON to 0 once `active`; yields to any user input. */
export function useGlobeSpin(
  active: boolean,
  setRotation: Dispatch<SetStateAction<Rotation>>,
  interrupted: RefObject<boolean>
) {
  useEffect(() => {
    if (!active || prefersReducedMotion()) return
    const start = performance.now()
    let raf = 0
    const step = (now: number) => {
      if (interrupted.current) return
      const t = Math.min(1, (now - start) / SPIN_MS)
      const eased = 1 - Math.pow(1 - t, 3)
      setRotation(([, lat]) => [INTRO_START_LON * (1 - eased), lat, 0])
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [active, setRotation, interrupted])
}
