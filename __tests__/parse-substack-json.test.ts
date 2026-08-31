import { describe, it, expect } from 'vitest'
import { parseSubstackJson } from '../scripts/lib/parse-substack-json'

const post = (overrides: Partial<Record<string, unknown>> = {}) => ({
  title: 'Shipping with Claude',
  canonical_url: 'https://x.substack.com/p/a',
  post_date: '2026-07-06T12:00:00.000Z',
  subtitle: 'How it went',
  ...overrides,
})

describe('parseSubstackJson', () => {
  it('extracts posts from a real posts list', () => {
    const posts = parseSubstackJson(JSON.stringify([post()]))

    expect(posts).toEqual([
      {
        title: 'Shipping with Claude',
        url: 'https://x.substack.com/p/a',
        date: '2026-07-06T12:00:00.000Z',
        subtitle: 'How it went',
      },
    ])
  })

  // Same rule as the RSS path: this placeholder must never light up the
  // dormant Writing section.
  it('filters out the "Coming soon" placeholder', () => {
    const posts = parseSubstackJson(JSON.stringify([post({ title: 'Coming soon' })]))

    expect(posts).toEqual([])
  })

  it('returns newest first', () => {
    const posts = parseSubstackJson(
      JSON.stringify([
        post({ title: 'Older', canonical_url: 'https://x.substack.com/p/1', post_date: '2026-06-01T12:00:00.000Z' }),
        post({ title: 'Newer', canonical_url: 'https://x.substack.com/p/2', post_date: '2026-07-06T12:00:00.000Z' }),
      ])
    )

    expect(posts?.map((p) => p.title)).toEqual(['Newer', 'Older'])
  })

  it('drops items missing a required field', () => {
    const posts = parseSubstackJson(JSON.stringify([post({ title: '' }), post({ canonical_url: '' })]))

    expect(posts).toEqual([])
  })

  it('drops items with an unparseable post_date', () => {
    const posts = parseSubstackJson(JSON.stringify([post({ post_date: 'not-a-date' })]))

    expect(posts).toEqual([])
  })

  it('omits the subtitle entirely when absent', () => {
    const posts = parseSubstackJson(JSON.stringify([post({ subtitle: undefined })]))

    expect(posts?.[0]).not.toHaveProperty('subtitle')
  })

  // Unlike the RSS parser, this path has no way to tell "the publication has
  // zero posts" from "the endpoint drifted into some other empty shape" — it
  // only ever runs after RSS already failed. So a bare [] must not be treated
  // as authoritative enough to overwrite the committed POSTS.
  it('returns null for a bare empty array, not []', () => {
    expect(parseSubstackJson('[]')).toBeNull()
  })

  it('returns null when the body is not a posts list at all', () => {
    expect(parseSubstackJson('<html><body>not json</body></html>')).toBeNull()
    expect(parseSubstackJson('{"error": "not found"}')).toBeNull()
    expect(parseSubstackJson('')).toBeNull()
  })

  it('does not throw on malformed JSON', () => {
    expect(() => parseSubstackJson('{broken')).not.toThrow()
  })
})
