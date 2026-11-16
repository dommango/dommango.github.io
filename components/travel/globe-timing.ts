// Timing curves for the globe's choreography. The canvas renderer drives all of
// it from one rAF loop, so these are plain functions of elapsed milliseconds
// rather than CSS keyframes (the routes used to draw in via CSS on SVG paths).
import { clamp, shortestLonDelta, type LonLat, type Rotation } from './globe-geometry'

/** Longitude the globe drifts in from, so the intro has somewhere to settle from. */
export const INTRO_START_LON = -50
export const SPIN_MS = 1400
/** One route's draw-in duration, and the cap on the per-route stagger. */
export const DRAW_MS = 900
export const MAX_STAGGER_MS = 1200
export const STAGGER_STEP_MS = 25
const AIRPORT_DELAY_MS = 900
const AIRPORT_POP_MS = 220
/** After this, nothing in the intro is still moving. */
export const INTRO_TOTAL_MS = MAX_STAGGER_MS + DRAW_MS + 300
/** How long the globe takes to swing to a new year's countries. */
export const FOCUS_MS = 700
/** Latitude the focus tween is allowed to reach, so the poles stay off-axis. */
const FOCUS_LAT_LIMIT = 35

export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3)

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Longitude offset still left to unwind from the intro drift. */
export const introSpinLon = (elapsedMs: number): number =>
  INTRO_START_LON * (1 - easeOutCubic(clamp(elapsedMs / SPIN_MS, 0, 1)))

/** How much of route `index` has drawn in. Staggered so the routes trace in waves. */
export function routeDrawProgress(index: number, elapsedMs: number): number {
  if (!Number.isFinite(elapsedMs)) return 1
  const delay = Math.min(index * STAGGER_STEP_MS, MAX_STAGGER_MS)
  return clamp((elapsedMs - delay) / DRAW_MS, 0, 1)
}

/** Airport markers pop in once the first routes have landed. */
export function airportPopScale(elapsedMs: number): number {
  if (!Number.isFinite(elapsedMs)) return 1
  return easeOutCubic(clamp((elapsedMs - AIRPORT_DELAY_MS) / AIRPORT_POP_MS, 0, 1))
}

/** Rotation that puts `point` under the viewer, without tipping toward a pole. */
export const focusRotation = ([lon, lat]: LonLat): Rotation => [
  -lon,
  clamp(-lat * 0.6, -FOCUS_LAT_LIMIT, FOCUS_LAT_LIMIT),
  0,
]

/** Eased rotation `t` of the way from `from` to `to`, going the short way round. */
export function tweenRotation(from: Rotation, to: Rotation, t: number): Rotation {
  const eased = easeOutCubic(clamp(t, 0, 1))
  return [
    from[0] + shortestLonDelta(from[0], to[0]) * eased,
    from[1] + (to[1] - from[1]) * eased,
    0,
  ]
}
