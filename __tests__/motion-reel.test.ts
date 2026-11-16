import { describe, it, expect } from 'vitest'
import { progressStep, reelProgress } from '../lib/motion/reel'

describe('reelProgress', () => {
  it('is null when the container is not taller than the viewport, so nothing pins', () => {
    expect(reelProgress(0, 800, 800)).toBeNull()
    expect(reelProgress(0, 400, 800)).toBeNull()
  })

  it('is 0 while the container top is still at or below the viewport top', () => {
    expect(reelProgress(0, 2400, 800)).toBe(0)
    expect(reelProgress(500, 2400, 800)).toBe(0)
  })

  it('tracks the scrolled fraction of the pin distance', () => {
    expect(reelProgress(-800, 2400, 800)).toBeCloseTo(0.5)
    expect(reelProgress(-400, 2400, 800)).toBeCloseTo(0.25)
  })

  it('is 1 once the container has fully passed, and never exceeds it', () => {
    expect(reelProgress(-1600, 2400, 800)).toBe(1)
    expect(reelProgress(-5000, 2400, 800)).toBe(1)
  })
})

describe('progressStep', () => {
  it('spans 0 to steps-1 across the full progress range', () => {
    expect(progressStep(0, 41)).toBe(0)
    expect(progressStep(1, 41)).toBe(40)
  })

  it('rounds to the nearest step so a year holds either side of it', () => {
    expect(progressStep(0.5, 41)).toBe(20)
    expect(progressStep(0.49, 41)).toBe(20)
  })

  it('collapses to a single step when there is nothing to scrub', () => {
    expect(progressStep(0.7, 1)).toBe(0)
    expect(progressStep(0.7, 0)).toBe(0)
  })

  it('clamps progress that overshoots either end', () => {
    expect(progressStep(1.4, 10)).toBe(9)
    expect(progressStep(-0.4, 10)).toBe(0)
  })

  it('maps the 41-year span onto one step per year', () => {
    const years = 41
    const steps = new Set(
      Array.from({ length: 400 }, (_, i) => progressStep(i / 399, years))
    )
    expect(steps.size).toBe(years)
  })
})
