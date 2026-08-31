// Pure RSS -> posts transform. Kept separate from the fetch so it can be
// tested without network. Never throws.
//
// Two different "no posts" outcomes, and the caller must tell them apart:
//   null -> the body isn't an RSS feed at all (HTML interstitial, login
//           redirect, maintenance page — all of which arrive as a 200).
//   []   -> a real feed that currently has no publishable posts.
// Only the second may overwrite the committed POSTS; collapsing both to []
// lets a Cloudflare splash page silently empty the Writing section.

const { XMLParser } = require('fast-xml-parser')

// Substack seeds every new publication with a "Coming soon" placeholder.
// It isn't a real post and must not light up the Writing section.
const PLACEHOLDER_TITLES = [/^coming soon\.?$/i]

const isPlaceholder = (title) => PLACEHOLDER_TITLES.some((re) => re.test(title.trim()))

const toIsoDate = (pubDate) => {
  if (!pubDate) return null
  const parsed = new Date(pubDate)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

const text = (value) => {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number') return String(value)
  // fast-xml-parser wraps CDATA/attributed nodes in an object.
  if (value && typeof value === 'object' && typeof value['#text'] === 'string') {
    return value['#text'].trim()
  }
  return ''
}

// Substack puts HTML in <description>. React escapes it rather than executing
// it, so the risk isn't XSS — it's a card rendering "<p>Hello <em>world</em></p>"
// as visible tag soup. Only strip things shaped like a tag, so prose such as
// "a < b" survives.
const stripTags = (value) => value.replace(/<\/?[a-zA-Z][^>]*>/g, ' ')

// Runs after stripTags, on purpose: a literal "&lt;" that survived tag
// stripping (it never had a raw "<") should decode to display text, not be
// mistaken for a tag boundary. Decode &amp; last so "&amp;#8212;" doesn't
// double-decode into a literal "&#8212;".
const decodeEntities = (value) =>
  value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')

const stripHtml = (value) =>
  decodeEntities(stripTags(value))
    .replace(/\s+/g, ' ')
    .trim()

/**
 * @param {string} xml Raw RSS feed body.
 * @returns {Array<{title: string, url: string, date: string, subtitle?: string}>|null}
 *   Real posts newest first, [] for a feed with none, or null if the body
 *   isn't a feed at all.
 */
function parseSubstackFeed(xml) {
  if (typeof xml !== 'string' || xml.trim() === '') return null

  let parsed
  try {
    parsed = new XMLParser({ ignoreAttributes: false, trimValues: true }).parse(xml)
  } catch {
    return null
  }

  // The channel element is what makes this a feed. An HTML error page parses
  // fine but lands under `html`, so it can't be mistaken for an empty feed.
  const channel = parsed?.rss?.channel
  if (!channel) return null

  const rawItems = channel.item
  if (!rawItems) return []

  const items = Array.isArray(rawItems) ? rawItems : [rawItems]

  return items
    .map((item) => {
      const title = text(item?.title)
      const url = text(item?.link)
      const date = toIsoDate(text(item?.pubDate))
      const subtitle = stripHtml(text(item?.description))

      if (!title || !url || !date) return null
      if (isPlaceholder(title)) return null

      return subtitle ? { title, url, date, subtitle } : { title, url, date }
    })
    .filter(Boolean)
    .sort((a, b) => b.date.localeCompare(a.date))
}

module.exports = { parseSubstackFeed, isPlaceholder }
