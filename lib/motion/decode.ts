// Decode effect for the hero headline: every character starts as a 1/0 glyph
// from the BinaryRule motif and locks onto its real glyph left to right.
//
// The noise glyph a character starts on is deterministic (seeded from the text),
// so the server HTML and the first client render agree and hydration is clean.
// Once running, `runDecode` writes classes and data attributes straight to the
// DOM — no React state per tick, which is what keeps the effect off the main
// thread budget during hydration.

export const DECODE_TICK_MS = 45

/** Stable 32-bit-ish hash of `text`, used to seed its noise glyphs. */
export function textSeed(text: string): number {
  let seed = 0
  for (let i = 0; i < text.length; i++) seed = (seed * 31 + text.charCodeAt(i)) % 100000
  return seed
}

/** Deterministic 0..1 sample — same shape as BinaryRule's PRNG. */
export function seededSample(seed: number, index: number): number {
  const x = Math.sin((seed + 1) * (index + 1) * 13.37) * 10000
  return x - Math.floor(x)
}

/** '1' or '0' from a 0..1 sample. The motif is binary, not random letters. */
export const noiseGlyph = (sample: number): '1' | '0' => (sample > 0.5 ? '1' : '0')

/** Noise glyph a character shows before the decode starts (server and client). */
export const initialGlyph = (seed: number, index: number): '1' | '0' =>
  noiseGlyph(seededSample(seed, index))

/** How many leading characters have locked onto their real glyph at `elapsedMs`. */
export function resolvedCount(total: number, elapsedMs: number, durationMs: number): number {
  if (durationMs <= 0 || elapsedMs >= durationMs) return total
  if (elapsedMs <= 0) return 0
  return Math.floor((elapsedMs / durationMs) * total)
}

/** Characters that never scramble: whitespace keeps the words apart while decoding. */
const isScrambled = (el: HTMLElement) => (el.textContent ?? '').trim().length > 0

interface DecodeOptions {
  startMs: number
  durationMs: number
  /** Skip the animation and settle immediately. */
  reduced?: boolean
}

/**
 * Animates the character spans inside `host` from their seeded noise state to
 * their real glyphs. Returns a cancel function that settles them, so an
 * unmount or a prop change can never leave text stuck as noise.
 */
export function runDecode(host: HTMLElement, options: DecodeOptions): () => void {
  const { startMs, durationMs, reduced = false } = options
  const cells = Array.from(host.children).filter(
    (node): node is HTMLElement => node instanceof HTMLElement
  )

  const settle = (upTo: number) => {
    cells.forEach((el, i) => {
      if (i >= upTo || !isScrambled(el)) return
      el.classList.remove('is-noise')
      el.removeAttribute('data-g')
    })
  }

  if (reduced) {
    settle(cells.length)
    return () => {}
  }

  cells.forEach((el) => {
    if (!isScrambled(el)) return
    el.classList.add('is-noise')
    el.dataset.g ??= noiseGlyph(Math.random())
  })

  let interval = 0
  const paint = (elapsedMs: number): boolean => {
    const resolved = resolvedCount(cells.length, elapsedMs, durationMs)
    settle(resolved)
    cells.forEach((el, i) => {
      if (i < resolved || !isScrambled(el)) return
      el.dataset.g = noiseGlyph(Math.random())
    })
    return resolved >= cells.length
  }

  const begin = setTimeout(() => {
    const started = performance.now()
    interval = window.setInterval(() => {
      if (paint(performance.now() - started)) {
        window.clearInterval(interval)
        interval = 0
      }
    }, DECODE_TICK_MS)
  }, startMs)

  return () => {
    clearTimeout(begin)
    if (interval) window.clearInterval(interval)
    settle(cells.length)
  }
}
