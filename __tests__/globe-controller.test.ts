import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createGlobeController } from '@/components/travel/globe-controller'
import { focusRotation, INTRO_START_LON } from '@/components/travel/globe-timing'

describe('globe controller intro spin', () => {
  let now = 0
  let callbacks: FrameRequestCallback[] = []

  const flushFrames = (untilMs: number, stepMs = 16) => {
    while (now < untilMs) {
      now += stepMs
      const pending = callbacks
      callbacks = []
      pending.forEach((cb) => cb(now))
    }
  }

  beforeEach(() => {
    now = 0
    callbacks = []
    vi.spyOn(performance, 'now').mockImplementation(() => now)
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      callbacks.push(cb)
      return callbacks.length
    })
    vi.stubGlobal('cancelAnimationFrame', () => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('keeps the reel focus when the intro starts after it', () => {
    const controller = createGlobeController({ reduced: false })
    controller.setCanvas(document.createElement('canvas'))
    const target = focusRotation([100, 30])

    controller.focusOn([100, 30])
    flushFrames(1000)
    expect(controller.rotation()[0]).toBeCloseTo(target[0])

    controller.startIntro()
    flushFrames(1100)
    expect(controller.rotation()[0]).toBeCloseTo(target[0])
    flushFrames(4000)
    expect(controller.rotation()[0]).toBeCloseTo(target[0])
  })

  it('still drifts in from the start longitude when never focused', () => {
    const controller = createGlobeController({ reduced: false })
    controller.setCanvas(document.createElement('canvas'))
    controller.startIntro()
    flushFrames(100)
    const early = controller.rotation()[0]
    expect(early).toBeLessThan(0)
    expect(early).toBeGreaterThan(INTRO_START_LON)
    flushFrames(4000)
    expect(controller.rotation()[0]).toBeCloseTo(0)
  })
})
