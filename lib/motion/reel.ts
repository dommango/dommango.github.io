// Scroll maths for the pinned Travel reel: a tall container whose only child is
// position: sticky, so the page scrolls `height - viewportHeight` pixels while
// the stage stays on screen. That distance is the reel's timeline.

/**
 * Fraction (0..1) of the way the viewport has travelled through a reel
 * container, from `top` (its viewport-relative offset) and its `height`.
 * null when the container can't pin — nothing to scrub, so callers should keep
 * their manual controls.
 */
export function reelProgress(
  top: number,
  height: number,
  viewportHeight: number
): number | null {
  const travel = height - viewportHeight
  if (travel <= 0) return null
  return Math.min(1, Math.max(0, -top / travel))
}

/** Index 0..steps-1 for a 0..1 progress, so callers re-render once per step. */
export function progressStep(progress: number, steps: number): number {
  if (steps <= 1) return 0
  const index = Math.round(progress * (steps - 1))
  return Math.min(steps - 1, Math.max(0, index))
}
