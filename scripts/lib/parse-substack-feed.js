// Pure RSS -> posts transform. Kept separate from the fetch so it can be
// tested without network. Never throws: a broken feed must degrade to an
// empty Writing section, not fail the build.

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

/**
 * @param {string} xml Raw RSS feed body.
 * @returns {Array<{title: string, url: string, date: string, subtitle?: string}>}
 *   Real posts, newest first. Empty on malformed input or placeholder-only feeds.
 */
function parseSubstackFeed(xml) {
  if (typeof xml !== 'string' || xml.trim() === '') return []

  let parsed
  try {
    parsed = new XMLParser({ ignoreAttributes: false, trimValues: true }).parse(xml)
  } catch {
    return []
  }

  const rawItems = parsed?.rss?.channel?.item
  if (!rawItems) return []

  const items = Array.isArray(rawItems) ? rawItems : [rawItems]

  return items
    .map((item) => {
      const title = text(item?.title)
      const url = text(item?.link)
      const date = toIsoDate(text(item?.pubDate))
      const subtitle = text(item?.description)

      if (!title || !url || !date) return null
      if (isPlaceholder(title)) return null

      return subtitle ? { title, url, date, subtitle } : { title, url, date }
    })
    .filter(Boolean)
    .sort((a, b) => b.date.localeCompare(a.date))
}

module.exports = { parseSubstackFeed }
