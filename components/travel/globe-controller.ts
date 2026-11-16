// Imperative owner of the globe's rotation, animation loop and canvas. Keeping
// it outside React is the point: the rotation changes up to 60 times a second
// while the reel scrubs, and none of those frames should cost a re-render.
import {
  createProjection,
  DEFAULT_GLOBE_COLORS,
  drawGlobe,
  type GlobeColors,
  type GlobeScene,
} from './globe-draw'
import { clamp, type LonLat, type Rotation } from './globe-geometry'
import {
  FOCUS_MS,
  INTRO_START_LON,
  INTRO_TOTAL_MS,
  SPIN_MS,
  focusRotation,
  introSpinLon,
  tweenRotation,
} from './globe-timing'
import type { GeoProjection } from 'd3-geo'

/** Rendering above 2x costs fill rate for pixels nobody can tell apart. */
const MAX_DPR = 2
const START_LAT = -20
const MAX_LAT = 90

interface Tween {
  from: Rotation
  to: Rotation
  start: number
}

export interface GlobeController {
  setCanvas(canvas: HTMLCanvasElement | null): void
  setSize(size: number): void
  setScene(scene: GlobeScene): void
  setColors(colors: GlobeColors): void
  setHover(iso: string | null): void
  /** Begins the route draw-in and the settling spin, once. */
  startIntro(): void
  /** Eases the globe round to put `point` under the viewer. */
  focusOn(point: LonLat): void
  rotateBy(deltaLon: number, deltaLat: number): void
  setRotation(rotation: Rotation): void
  rotation(): Rotation
  /** Projection for the current rotation and size, for hit-testing. */
  projection(): GeoProjection
  markUserRotated(): void
  requestFrame(): void
  /** Cancels any pending frame and parks the loop until a canvas is set again. */
  stop(): void
}

/**
 * `reduced` freezes the choreography: the globe renders its final state (routes
 * drawn, markers up, no drift) and never animates.
 */
export function createGlobeController({ reduced }: { reduced: boolean }): GlobeController {
  let canvas: HTMLCanvasElement | null = null
  let scene: GlobeScene | null = null
  let colors = DEFAULT_GLOBE_COLORS
  let size = 0
  let rotation: Rotation = [reduced ? 0 : INTRO_START_LON, START_LAT, 0]
  let hoverIso: string | null = null
  let introStart: number | null = null
  let tween: Tween | null = null
  let userRotated = false
  let frame = 0
  // Parked until a canvas arrives. React re-runs effects (and so detaches and
  // re-attaches the canvas) on every remount, so this has to be reversible.
  let parked = true

  function schedule() {
    if (parked || frame) return
    frame = requestAnimationFrame(tick)
  }

  /** ms into the intro, or Infinity once nothing in it is still moving. */
  function introElapsed(now: number): number {
    if (reduced || introStart === null) {
      return reduced ? Number.POSITIVE_INFINITY : 0
    }
    const elapsed = now - introStart
    return elapsed >= INTRO_TOTAL_MS ? Number.POSITIVE_INFINITY : elapsed
  }

  /** Advances rotation for this frame; true while something is still moving. */
  function advance(now: number): boolean {
    if (reduced) return false
    let animating = false
    if (tween && !userRotated) {
      const progress = (now - tween.start) / FOCUS_MS
      rotation = tweenRotation(tween.from, tween.to, progress)
      if (progress >= 1) tween = null
      else animating = true
    } else if (introStart !== null && !userRotated && now - introStart < SPIN_MS) {
      rotation = [introSpinLon(now - introStart), rotation[1], 0]
      animating = true
    }
    return animating || (introStart !== null && now - introStart < INTRO_TOTAL_MS)
  }

  function paint(now: number) {
    if (!canvas || !scene || size <= 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
    const pixels = Math.max(1, Math.round(size * dpr))
    if (canvas.width !== pixels || canvas.height !== pixels) {
      canvas.width = pixels
      canvas.height = pixels
      // The globe is square whatever shape its frame is, so the canvas sizes
      // itself rather than stretching to fill the box.
      canvas.style.width = `${size}px`
      canvas.style.height = `${size}px`
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    drawGlobe(ctx, scene, { size, rotation, elapsed: introElapsed(now), hoverIso }, colors)
  }

  function tick(now: number) {
    frame = 0
    if (parked) return
    const animating = advance(now)
    paint(now)
    if (animating) schedule()
  }

  function applyRotation(next: Rotation) {
    userRotated = true
    tween = null
    rotation = [next[0], clamp(next[1], -MAX_LAT, MAX_LAT), 0]
    schedule()
  }

  return {
    setCanvas(next) {
      canvas = next
      parked = next === null
      schedule()
    },
    setSize(next) {
      if (next === size) return
      size = next
      schedule()
    },
    setScene(next) {
      scene = next
      schedule()
    },
    setColors(next) {
      colors = next
      schedule()
    },
    setHover(iso) {
      if (iso === hoverIso) return
      hoverIso = iso
      schedule()
    },
    startIntro() {
      if (introStart !== null) return
      introStart = performance.now()
      schedule()
    },
    focusOn(point) {
      if (reduced || userRotated) return
      tween = { from: rotation, to: focusRotation(point), start: performance.now() }
      schedule()
    },
    rotateBy(deltaLon, deltaLat) {
      applyRotation([rotation[0] + deltaLon, rotation[1] + deltaLat, 0])
    },
    setRotation: applyRotation,
    rotation: () => rotation,
    projection: () => createProjection(size, rotation),
    markUserRotated() {
      userRotated = true
      tween = null
    },
    requestFrame: schedule,
    stop() {
      parked = true
      if (frame) cancelAnimationFrame(frame)
      frame = 0
    },
  }
}
