import { describe, it, expect } from 'vitest'
// @ts-expect-error — CommonJS script module, shared with the build script.
import { parseSubstackFeed } from '../scripts/lib/parse-substack-feed'

const feed = (items: string) => `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title><![CDATA[Context//Collapse]]></title>
  ${items}
</channel></rss>`

const item = (title: string, link: string, pubDate: string, description = '') => `
  <item>
    <title><![CDATA[${title}]]></title>
    <link>${link}</link>
    <pubDate>${pubDate}</pubDate>
    ${description ? `<description><![CDATA[${description}]]></description>` : ''}
  </item>`

describe('parseSubstackFeed', () => {
  it('extracts posts from a real feed', () => {
    const posts = parseSubstackFeed(
      feed(
        item('Shipping with Claude', 'https://x.substack.com/p/a', 'Mon, 06 Jul 2026 12:00:00 GMT', 'How it went')
      )
    )

    expect(posts).toEqual([
      {
        title: 'Shipping with Claude',
        url: 'https://x.substack.com/p/a',
        date: '2026-07-06T12:00:00.000Z',
        subtitle: 'How it went',
      },
    ])
  })

  // The whole point of the dormant Writing section: Substack seeds every new
  // publication with this, and it must not count as a post.
  it('filters out the "Coming soon" placeholder', () => {
    const posts = parseSubstackFeed(
      feed(item('Coming soon', 'https://x.substack.com/p/coming-soon', 'Mon, 02 Mar 2026 12:00:00 GMT'))
    )

    expect(posts).toEqual([])
  })

  it('keeps real posts alongside the placeholder', () => {
    const posts = parseSubstackFeed(
      feed(
        item('Coming soon', 'https://x.substack.com/p/coming-soon', 'Mon, 02 Mar 2026 12:00:00 GMT') +
          item('A real post', 'https://x.substack.com/p/real', 'Tue, 07 Jul 2026 12:00:00 GMT')
      )
    )

    expect(posts).toHaveLength(1)
    expect(posts[0].title).toBe('A real post')
  })

  it('returns newest first', () => {
    const posts = parseSubstackFeed(
      feed(
        item('Older', 'https://x.substack.com/p/1', 'Mon, 01 Jun 2026 12:00:00 GMT') +
          item('Newer', 'https://x.substack.com/p/2', 'Mon, 06 Jul 2026 12:00:00 GMT')
      )
    )

    expect(posts.map((p: { title: string }) => p.title)).toEqual(['Newer', 'Older'])
  })

  it('handles a single-item feed (parser returns an object, not an array)', () => {
    const posts = parseSubstackFeed(
      feed(item('Only one', 'https://x.substack.com/p/1', 'Mon, 06 Jul 2026 12:00:00 GMT'))
    )

    expect(posts).toHaveLength(1)
  })

  it('drops items missing a pubDate rather than emitting an invalid date', () => {
    const posts = parseSubstackFeed(
      feed(`<item><title>No date</title><link>https://x.substack.com/p/1</link></item>`)
    )

    expect(posts).toEqual([])
  })

  it('drops items with an unparseable pubDate', () => {
    const posts = parseSubstackFeed(
      feed(item('Bad date', 'https://x.substack.com/p/1', 'not-a-date'))
    )

    expect(posts).toEqual([])
  })

  // A Substack outage must degrade to an empty section, never break the build.
  it('returns [] for malformed XML instead of throwing', () => {
    expect(() => parseSubstackFeed('<rss><channel><item>broken')).not.toThrow()
    expect(parseSubstackFeed('<rss><channel><item>broken')).toEqual([])
  })

  it('returns [] for empty, non-string, or feedless input', () => {
    expect(parseSubstackFeed('')).toEqual([])
    expect(parseSubstackFeed('   ')).toEqual([])
    expect(parseSubstackFeed(undefined)).toEqual([])
    expect(parseSubstackFeed('<html><body>not a feed</body></html>')).toEqual([])
    expect(parseSubstackFeed(feed(''))).toEqual([])
  })
})
