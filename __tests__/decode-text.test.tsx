import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DecodeText } from '../components/landing/DecodeText'
import { initialGlyph, textSeed } from '../lib/motion/decode'

const TEXT = 'Dominic Mangonon'

let reducedMotion = false

const cells = () => Array.from(document.querySelectorAll('.decode-ch')) as HTMLElement[]
const painted = () => cells().map((cell) => cell.textContent).join('')

describe('DecodeText', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    reducedMotion = false
    window.matchMedia = ((query: string) =>
      ({ matches: reducedMotion, media: query }) as MediaQueryList) as typeof window.matchMedia
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('exposes the real text once to assistive tech', () => {
    render(<DecodeText text={TEXT} />)
    expect(screen.getByText(TEXT)).toHaveClass('sr-only')
  })

  it('hides the animated copy from assistive tech, so the text is not read twice', () => {
    render(<DecodeText text={TEXT} />)
    const host = document.querySelector('.decode')
    expect(host).toHaveAttribute('aria-hidden', 'true')
  })

  it('keeps every real character in the layout, so nothing can shift', () => {
    render(<DecodeText text={TEXT} />)
    expect(cells()).toHaveLength(TEXT.length)
    expect(painted()).toBe(TEXT)
  })

  it('renders the deterministic noise state, which is what keeps hydration clean', () => {
    render(<DecodeText text={TEXT} />)
    const seed = textSeed(TEXT)
    const glyphs = cells().map((cell) => cell.dataset.g)
    const expected = [...TEXT].map((char, i) =>
      char.trim().length === 0 ? undefined : initialGlyph(seed, i)
    )
    expect(glyphs).toEqual(expected)
  })

  it('marks only non-blank characters as noise', () => {
    render(<DecodeText text="a b" />)
    expect(cells().map((cell) => cell.classList.contains('is-noise'))).toEqual([
      true,
      false,
      true,
    ])
  })

  it('resolves the noise away by the end of the run', () => {
    render(<DecodeText text={TEXT} durationMs={300} />)
    vi.advanceTimersByTime(1000)
    expect(cells().some((cell) => cell.classList.contains('is-noise'))).toBe(false)
    expect(painted()).toBe(TEXT)
  })

  it('settles immediately for reduced motion', () => {
    reducedMotion = true
    render(<DecodeText text={TEXT} />)
    expect(cells().some((cell) => cell.classList.contains('is-noise'))).toBe(false)
  })

  it('leaves no character as noise when it unmounts mid-run', () => {
    const view = render(<DecodeText text={TEXT} />)
    vi.advanceTimersByTime(100)
    view.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('restarts cleanly when the text changes', () => {
    const view = render(<DecodeText text="first" />)
    vi.advanceTimersByTime(50)
    view.rerender(<DecodeText text="second" />)
    vi.advanceTimersByTime(2000)
    expect(painted()).toBe('second')
    expect(cells().some((cell) => cell.classList.contains('is-noise'))).toBe(false)
  })
})
