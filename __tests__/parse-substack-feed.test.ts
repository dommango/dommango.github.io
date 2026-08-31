import { describe, it, expect } from 'vitest'
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
    expect(posts?.[0].title).toBe('A real post')
  })

  it('returns newest first', () => {
    const posts = parseSubstackFeed(
      feed(
        item('Older', 'https://x.substack.com/p/1', 'Mon, 01 Jun 2026 12:00:00 GMT') +
          item('Newer', 'https://x.substack.com/p/2', 'Mon, 06 Jul 2026 12:00:00 GMT')
      )
    )

    expect(posts?.map((p: { title: string }) => p.title)).toEqual(['Newer', 'Older'])
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

  // A Substack outage must degrade gracefully, never break the build.
  it('does not throw on malformed XML', () => {
    expect(() => parseSubstackFeed('<rss><channel><item>broken')).not.toThrow()
  })

  // The distinction the caller depends on: [] may overwrite the committed
  // POSTS, null may not. Collapsing them lets a 200-with-an-HTML-body wipe
  // the Writing section on an unattended cron build.
  it('returns [] for a real feed that has no posts', () => {
    expect(parseSubstackFeed(feed(''))).toEqual([])
  })

  it('returns null when the body is not a feed at all', () => {
    // Every one of these arrives as a 200 in the wild.
    expect(parseSubstackFeed('<html><body>not a feed</body></html>')).toBeNull()
    expect(
      parseSubstackFeed('<!DOCTYPE html><html><head><title>Just a moment...</title></head></html>')
    ).toBeNull()
    expect(parseSubstackFeed('')).toBeNull()
    expect(parseSubstackFeed('   ')).toBeNull()
    // Guards the runtime contract: the script calls this with whatever the
    // network returned, which TypeScript can't police.
    expect(parseSubstackFeed(undefined as unknown as string)).toBeNull()
  })

  // Substack puts HTML in <description>; unstripped it renders as visible tag
  // soup on the card (React escapes it, so it is not an XSS vector).
  it('strips HTML markup out of the subtitle', () => {
    const posts = parseSubstackFeed(
      feed(
        item(
          'Post',
          'https://x.substack.com/p/a',
          'Mon, 06 Jul 2026 12:00:00 GMT',
          '<p>Hello <em>world</em>&nbsp;— a subtitle</p>'
        )
      )
    )

    expect(posts?.[0].subtitle).toBe('Hello world — a subtitle')
  })

  it('keeps prose that merely contains a bare angle bracket', () => {
    const posts = parseSubstackFeed(
      feed(item('Post', 'https://x.substack.com/p/a', 'Mon, 06 Jul 2026 12:00:00 GMT', 'when a < b holds'))
    )

    expect(posts?.[0].subtitle).toBe('when a < b holds')
  })

  // Substack's CDATA description carries numeric entities (an em dash comes
  // through as &#8212;), and the fetch-substack pipeline JSON-stringifies the
  // result, which would double-escape an undecoded "&#8212;" into visible
  // tag soup on the card.
  it('decodes numeric and named HTML entities in the subtitle', () => {
    const posts = parseSubstackFeed(
      feed(
        item(
          'Post',
          'https://x.substack.com/p/a',
          'Mon, 06 Jul 2026 12:00:00 GMT',
          'Before &#8212; after &amp; done'
        )
      )
    )

    expect(posts?.[0].subtitle).toBe('Before — after & done')
  })

  it('omits the subtitle entirely when the description is only markup', () => {
    const posts = parseSubstackFeed(
      feed(item('Post', 'https://x.substack.com/p/a', 'Mon, 06 Jul 2026 12:00:00 GMT', '<p></p>'))
    )

    expect(posts?.[0]).not.toHaveProperty('subtitle')
  })
})
