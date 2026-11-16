import { describe, it, expect } from 'vitest'
import {
  DRAW_MS,
  FOCUS_MS,
  INTRO_START_LON,
  INTRO_TOTAL_MS,
  MAX_STAGGER_MS,
  SPIN_MS,
  STAGGER_STEP_MS,
  airportPopScale,
  easeOutCubic,
  focusRotation,
  introSpinLon,
  routeDrawProgress,
  tweenRotation,
} from '../components/travel/globe-timing'
import type { Rotation } from '../components/travel/globe-geometry'

describe('easeOutCubic', () => {
  it('runs from 0 to 1', () => {
    expect(easeOutCubic(0)).toBe(0)
    expect(easeOutCubic(1)).toBe(1)
  })

  it('decelerates, so it is past halfway at the midpoint', () => {
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5)
  })

  it('increases monotonically', () => {
    let previous = -1
    for (let t = 0; t <= 1; t += 0.05) {
      const value = easeOutCubic(t)
      expect(value).toBeGreaterThan(previous)
      previous = value
    }
  })
})

describe('introSpinLon', () => {
  it('starts at the drift longitude', () => {
    expect(introSpinLon(0)).toBeCloseTo(INTRO_START_LON, 6)
  })

  it('unwinds to zero by the end of the spin and stays there', () => {
    expect(introSpinLon(SPIN_MS)).toBeCloseTo(0, 6)
    expect(introSpinLon(SPIN_MS * 4)).toBeCloseTo(0, 6)
  })

  it('moves toward zero throughout', () => {
    expect(Math.abs(introSpinLon(700))).toBeLessThan(Math.abs(introSpinLon(200)))
  })
})

describe('routeDrawProgress', () => {
  it('has not started before its staggered delay', () => {
    expect(routeDrawProgress(4, 4 * STAGGER_STEP_MS - 1)).toBe(0)
  })

  it('completes one draw duration after its delay', () => {
    expect(routeDrawProgress(0, DRAW_MS)).toBe(1)
    expect(routeDrawProgress(4, 4 * STAGGER_STEP_MS + DRAW_MS)).toBe(1)
  })

  it('staggers later routes behind earlier ones', () => {
    expect(routeDrawProgress(10, 400)).toBeGreaterThan(routeDrawProgress(20, 400))
  })

  it('caps the stagger, so the last route is not minutes behind', () => {
    expect(routeDrawProgress(100, MAX_STAGGER_MS + DRAW_MS)).toBe(1)
    expect(routeDrawProgress(1000, MAX_STAGGER_MS + DRAW_MS)).toBe(1)
  })

  it('is fully drawn for a non-finite elapsed, which is how the intro ends', () => {
    expect(routeDrawProgress(5, Infinity)).toBe(1)
  })

  it('is finished for every route by INTRO_TOTAL_MS', () => {
    for (const index of [0, 1, 50, 500]) {
      expect(routeDrawProgress(index, INTRO_TOTAL_MS)).toBe(1)
    }
  })
})

describe('airportPopScale', () => {
  it('stays hidden until the first routes have landed', () => {
    expect(airportPopScale(0)).toBe(0)
    expect(airportPopScale(500)).toBe(0)
  })

  it('reaches full size and stays there', () => {
    expect(airportPopScale(2000)).toBeCloseTo(1, 6)
  })

  it('is full size for a non-finite elapsed', () => {
    expect(airportPopScale(Infinity)).toBe(1)
  })

  it('is settled by INTRO_TOTAL_MS', () => {
    expect(airportPopScale(INTRO_TOTAL_MS)).toBeCloseTo(1, 6)
  })
})

describe('focusRotation', () => {
  it('rotates the target longitude under the viewer', () => {
    expect(focusRotation([139.7, 35.7])[0]).toBeCloseTo(-139.7, 6)
  })

  it('tips only partway toward the latitude, so the globe stays readable', () => {
    const [, lat] = focusRotation([0, 50])
    expect(lat).toBeCloseTo(-30, 6)
  })

  it('clamps the tilt so the poles never face the viewer', () => {
    expect(focusRotation([0, 89])[1]).toBeCloseTo(-35, 6)
    expect(focusRotation([0, -89])[1]).toBeCloseTo(35, 6)
  })

  it('never rolls the globe', () => {
    expect(focusRotation([12, 34])[2]).toBe(0)
  })
})

describe('tweenRotation', () => {
  const from: Rotation = [0, 0, 0]
  const to: Rotation = [-60, -20, 0]

  it('is the start at t = 0 and the target at t = 1', () => {
    expect(tweenRotation(from, to, 0)).toEqual([0, 0, 0])
    const end = tweenRotation(from, to, 1)
    expect(end[0]).toBeCloseTo(-60, 6)
    expect(end[1]).toBeCloseTo(-20, 6)
  })

  it('clamps t outside 0..1 instead of overshooting the target', () => {
    expect(tweenRotation(from, to, 2)[0]).toBeCloseTo(-60, 6)
    expect(tweenRotation(from, to, -1)[0]).toBeCloseTo(0, 6)
  })

  it('swings the short way round the antimeridian', () => {
    // 170 to -170 is 20 degrees east, not 340 west.
    const mid = tweenRotation([170, 0, 0], [-170, 0, 0], 0.5)
    expect(mid[0]).toBeGreaterThan(170)
  })

  it('leaves the roll at zero', () => {
    expect(tweenRotation([10, 10, 0], to, 0.4)[2]).toBe(0)
  })

  it('does not mutate the rotation it was given', () => {
    const start: Rotation = [0, 0, 0]
    tweenRotation(start, to, 0.5)
    expect(start).toEqual([0, 0, 0])
  })

  it('completes a focus swing within FOCUS_MS', () => {
    const end = tweenRotation(from, to, FOCUS_MS / FOCUS_MS)
    expect(end[0]).toBeCloseTo(to[0], 6)
  })
})
