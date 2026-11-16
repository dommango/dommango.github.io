import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  DECODE_TICK_MS,
  initialGlyph,
  noiseGlyph,
  resolvedCount,
  runDecode,
  seededSample,
  textSeed,
} from '../lib/motion/decode'

describe('textSeed', () => {
  it('is stable for the same text', () => {
    expect(textSeed('Dominic Mangonon')).toBe(textSeed('Dominic Mangonon'))
  })

  it('separates texts that differ only in order', () => {
    expect(textSeed('ab')).not.toBe(textSeed('ba'))
  })

  it('stays inside the modulus so the seed can never overflow', () => {
    const seed = textSeed('x'.repeat(500))
    expect(seed).toBeGreaterThanOrEqual(0)
    expect(seed).toBeLessThan(100000)
  })

  it('seeds the empty string without NaN', () => {
    expect(textSeed('')).toBe(0)
  })
})

describe('seededSample', () => {
  it('stays in 0..1', () => {
    for (let i = 0; i < 50; i++) {
      const sample = seededSample(1234, i)
      expect(sample).toBeGreaterThanOrEqual(0)
      expect(sample).toBeLessThan(1)
    }
  })

  it('is deterministic, which is what keeps hydration clean', () => {
    expect(seededSample(42, 7)).toBe(seededSample(42, 7))
  })

  it('varies by index', () => {
    const samples = new Set([0, 1, 2, 3, 4].map((i) => seededSample(42, i)))
    expect(samples.size).toBeGreaterThan(1)
  })
})

describe('noiseGlyph', () => {
  it('maps the sample onto the binary motif only', () => {
    expect(noiseGlyph(0.9)).toBe('1')
    expect(noiseGlyph(0.1)).toBe('0')
    expect(noiseGlyph(0.5)).toBe('0')
  })

  it('agrees with initialGlyph for the same seed and index', () => {
    expect(initialGlyph(7, 3)).toBe(noiseGlyph(seededSample(7, 3)))
  })
})

describe('resolvedCount', () => {
  it('resolves nothing before the run starts', () => {
    expect(resolvedCount(10, 0, 900)).toBe(0)
    expect(resolvedCount(10, -50, 900)).toBe(0)
  })

  it('resolves left to right through the run', () => {
    expect(resolvedCount(10, 450, 900)).toBe(5)
    expect(resolvedCount(10, 810, 900)).toBe(9)
  })

  it('resolves everything at and past the duration', () => {
    expect(resolvedCount(10, 900, 900)).toBe(10)
    expect(resolvedCount(10, 5000, 900)).toBe(10)
  })

  it('resolves everything immediately for a zero or negative duration', () => {
    expect(resolvedCount(10, 0, 0)).toBe(10)
    expect(resolvedCount(10, 0, -1)).toBe(10)
  })

  it('never exceeds the character count', () => {
    expect(resolvedCount(3, 899, 900)).toBeLessThanOrEqual(3)
  })
})

const host = (text: string): HTMLElement => {
  const el = document.createElement('span')
  for (const char of text) {
    const cell = document.createElement('span')
    cell.textContent = char
    if (char.trim().length > 0) {
      cell.className = 'decode-ch is-noise'
      cell.dataset.g = '1'
    } else {
      cell.className = 'decode-ch'
    }
    el.append(cell)
  }
  return el
}

const noisy = (el: HTMLElement) =>
  Array.from(el.children).filter((c) => c.classList.contains('is-noise')).length

describe('runDecode', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('settles immediately and schedules nothing for reduced motion', () => {
    const el = host('ab c')
    const cancel = runDecode(el, { startMs: 0, durationMs: 900, reduced: true })
    expect(noisy(el)).toBe(0)
    expect(vi.getTimerCount()).toBe(0)
    cancel()
  })

  it('holds the noise state until startMs has elapsed', () => {
    const el = host('abc')
    runDecode(el, { startMs: 300, durationMs: 900 })
    vi.advanceTimersByTime(299)
    expect(noisy(el)).toBe(3)
  })

  it('resolves characters left to right and clears the noise attribute', () => {
    const el = host('abcd')
    runDecode(el, { startMs: 0, durationMs: 400 })
    vi.advanceTimersByTime(DECODE_TICK_MS)
    vi.advanceTimersByTime(200)
    const cells = Array.from(el.children) as HTMLElement[]
    expect(cells[0].classList.contains('is-noise')).toBe(false)
    expect(cells[0].dataset.g).toBeUndefined()
    expect(cells[3].classList.contains('is-noise')).toBe(true)
  })

  it('never scrambles whitespace, so words stay apart while decoding', () => {
    const el = host('a b')
    runDecode(el, { startMs: 0, durationMs: 900 })
    vi.advanceTimersByTime(100)
    const space = el.children[1] as HTMLElement
    expect(space.classList.contains('is-noise')).toBe(false)
    expect(space.dataset.g).toBeUndefined()
    expect(space.textContent).toBe(' ')
  })

  it('settles every character and stops ticking once the run finishes', () => {
    const el = host('abc')
    runDecode(el, { startMs: 0, durationMs: 200 })
    vi.advanceTimersByTime(1000)
    expect(noisy(el)).toBe(0)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('settles the text when cancelled mid-run, so no character is stuck as noise', () => {
    const el = host('abcdef')
    const cancel = runDecode(el, { startMs: 0, durationMs: 900 })
    vi.advanceTimersByTime(100)
    expect(noisy(el)).toBeGreaterThan(0)
    cancel()
    expect(noisy(el)).toBe(0)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('cancels a run that has not started yet without leaving a timer', () => {
    const el = host('abc')
    const cancel = runDecode(el, { startMs: 500, durationMs: 900 })
    cancel()
    expect(noisy(el)).toBe(0)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('decodes again after a cancelled run, as a StrictMode remount does', () => {
    const el = host('abc')
    runDecode(el, { startMs: 0, durationMs: 900 })()
    expect(noisy(el)).toBe(0)
    runDecode(el, { startMs: 300, durationMs: 900 })
    expect(noisy(el)).toBe(3)
    const cells = Array.from(el.children) as HTMLElement[]
    expect(cells.every((c) => c.dataset.g === '0' || c.dataset.g === '1')).toBe(true)
    vi.advanceTimersByTime(2000)
    expect(noisy(el)).toBe(0)
  })

  it('ignores non-element children instead of throwing', () => {
    const el = host('ab')
    el.append(document.createTextNode('stray'))
    const cancel = runDecode(el, { startMs: 0, durationMs: 100 })
    vi.advanceTimersByTime(300)
    expect(noisy(el)).toBe(0)
    cancel()
  })
})
