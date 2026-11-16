'use client'

// DecodeText — the hero headline resolving out of 1/0 noise, tying the opening
// title to the BinaryRule motif. Every character keeps its real glyph in the
// layout (transparent while scrambling, with the noise drawn by ::after), so
// nothing shifts. The server renders the seeded noise state and the CSS only
// paints it where scripting is on, so no-JS visitors see the plain headline.
import { useEffect, useRef } from 'react'
import { initialGlyph, runDecode, textSeed } from '@/lib/motion/decode'

interface DecodeTextProps {
  text: string
  /** Delay before this line starts resolving, for staggering several lines. */
  startMs?: number
  durationMs?: number
}

export function DecodeText({ text, startMs = 0, durationMs = 900 }: DecodeTextProps) {
  const hostRef = useRef<HTMLSpanElement>(null)
  const seed = textSeed(text)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    return runDecode(host, {
      startMs,
      durationMs,
      reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    })
  }, [text, startMs, durationMs])

  return (
    <>
      <span className="sr-only">{text}</span>
      <span ref={hostRef} className="decode" aria-hidden="true">
        {[...text].map((char, index) => {
          const blank = char.trim().length === 0
          return (
            <span
              key={`${index}-${char}`}
              className={blank ? 'decode-ch' : 'decode-ch is-noise'}
              data-g={blank ? undefined : initialGlyph(seed, index)}
            >
              {char}
            </span>
          )
        })}
      </span>
    </>
  )
}
