import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { contrastRatio } from '../lib/format/contrast'

const css = readFileSync('app/globals.css', 'utf8')
const token = (name: string) => {
  const match = css.match(new RegExp(`(?:^|[^\\w-])--${name}:\\s*(#[0-9a-f]{6})`, 'im'))
  if (!match) throw new Error(`token --${name} not found in app/globals.css`)
  return match[1]
}

const BG = token('oxblood-900')
const pairs: Array<[string, string, string]> = [
  ['fg-low on bg', token('bone-500'), BG],
  ['fg-muted on bg', token('bone-400'), BG],
  ['gold accent text on bg', token('gold-500'), BG],
  ['oxblood accent text on bg', token('blood-400'), BG],
  ['button text on gold', token('oxblood-900'), token('gold-500')],
  ['button text on blood', '#ffffff', token('blood-500')],
]

describe('brand token contrast (WCAG AA, 4.5:1)', () => {
  it.each(pairs)('%s', (_, fg, bg) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5)
  })
})
