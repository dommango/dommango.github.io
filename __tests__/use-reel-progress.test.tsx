import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { useReelProgress } from '../components/landing/useReelProgress'

const VIEWPORT = 800
const HEIGHT = 2400 // two viewports of pin distance
const STEPS = 41 // 1986..2026, as the real reel

let rect = { top: 0, height: HEIGHT }
let reducedMotion = false
// The hook defers its measurement to a frame; queueing them and flushing by
// hand keeps each assertion in the same act() as the scroll that caused it.
let frames: FrameRequestCallback[] = []

function Reel({ steps = STEPS }: { steps?: number }) {
  const { ref, step } = useReelProgress<HTMLDivElement>(steps)
  return (
    <div ref={ref} data-testid="reel">
      <span data-testid="step">{step === null ? 'none' : step}</span>
    </div>
  )
}

const flushFrames = () => {
  const queued = frames
  frames = []
  queued.forEach((frame) => frame(0))
}

const emit = (event: 'scroll' | 'resize') =>
  act(() => {
    window.dispatchEvent(new Event(event))
    flushFrames()
  })

const scrollTo = (top: number) => {
  rect = { ...rect, top }
  emit('scroll')
}

const step = () => screen.getByTestId('step').textContent

describe('useReelProgress', () => {
  beforeEach(() => {
    rect = { top: 0, height: HEIGHT }
    frames = []
    reducedMotion = false
    window.innerHeight = VIEWPORT
    // Assigned rather than spied: a spy on the shared matchMedia mock outlives
    // restoreAllMocks and would report reduced motion to every later test.
    window.matchMedia = ((query: string) =>
      ({ matches: reducedMotion, media: query }) as MediaQueryList) as typeof window.matchMedia
    vi.stubGlobal('CSS', { supports: () => true })
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => frames.push(cb))
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      () =>
        ({
          ...rect,
          width: 0,
          bottom: 0,
          left: 0,
          right: 0,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        }) as DOMRect
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('starts at the first step once the reel can pin', () => {
    render(<Reel />)
    expect(step()).toBe('0')
  })

  it('advances the step as the container scrolls past', () => {
    render(<Reel />)
    scrollTo(-VIEWPORT) // halfway through the pin distance
    expect(step()).toBe('20')
    scrollTo(-VIEWPORT * 2) // fully scrubbed
    expect(step()).toBe('40')
  })

  it('holds the last step when scrolled beyond the reel', () => {
    render(<Reel />)
    scrollTo(-10000)
    expect(step()).toBe('40')
  })

  it('coalesces a burst of scroll events into one measurement', () => {
    render(<Reel />)
    rect = { ...rect, top: -VIEWPORT }
    act(() => {
      window.dispatchEvent(new Event('scroll'))
      window.dispatchEvent(new Event('scroll'))
      window.dispatchEvent(new Event('scroll'))
    })
    expect(frames).toHaveLength(1)
    act(() => flushFrames())
    expect(step()).toBe('20')
  })

  it('stays off for reduced motion, so the manual scrubber keeps the year', () => {
    reducedMotion = true
    render(<Reel />)
    expect(step()).toBe('none')
    scrollTo(-VIEWPORT)
    expect(step()).toBe('none')
  })

  it('stays off where position: sticky is unsupported', () => {
    vi.stubGlobal('CSS', { supports: () => false })
    render(<Reel />)
    expect(step()).toBe('none')
  })

  it('stays off when the container is too short to pin', () => {
    rect = { top: 0, height: VIEWPORT }
    render(<Reel />)
    expect(step()).toBe('none')
  })

  it('re-measures on resize, so a container that grows starts driving', () => {
    rect = { top: 0, height: VIEWPORT }
    render(<Reel />)
    expect(step()).toBe('none')
    rect = { top: -VIEWPORT, height: HEIGHT }
    emit('resize')
    expect(step()).toBe('20')
  })

  it('drops its listeners on unmount', () => {
    const remove = vi.spyOn(window, 'removeEventListener')
    const view = render(<Reel />)
    act(() => view.unmount())
    const events = remove.mock.calls.map((call) => call[0])
    expect(events).toContain('scroll')
    expect(events).toContain('resize')
  })

  it('collapses to step 0 when there is only one step to scrub', () => {
    render(<Reel steps={1} />)
    expect(step()).toBe('0')
    scrollTo(-VIEWPORT)
    expect(step()).toBe('0')
  })
})
