// Pure JSON -> posts transform for Substack's `/api/v1/posts` endpoint, used
// as a fallback when the RSS route is challenged. Mirrors parse-substack-feed.js:
// null means the body wasn't a posts list at all, [] means a real list with
// nothing publishable.

const { isPlaceholder } = require('./parse-substack-feed')

const toIsoDate = (value) => {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

/**
 * @param {string} body Raw JSON response body.
 * @returns {Array<{title: string, url: string, date: string, subtitle?: string}>|null}
 *   Real posts newest first, [] for a list with none, or null if the body
 *   isn't a posts list at all.
 */
function parseSubstackJson(body) {
  let parsed
  try {
    parsed = JSON.parse(body)
  } catch {
    return null
  }

  if (!Array.isArray(parsed)) return null

  return parsed
    .map((item) => {
      const title = typeof item?.title === 'string' ? item.title.trim() : ''
      const url = typeof item?.canonical_url === 'string' ? item.canonical_url.trim() : ''
      const date = toIsoDate(item?.post_date)
      const subtitle = typeof item?.subtitle === 'string' ? item.subtitle.trim() : ''

      if (!title || !url || !date) return null
      if (isPlaceholder(title)) return null

      return subtitle ? { title, url, date, subtitle } : { title, url, date }
    })
    .filter(Boolean)
    .sort((a, b) => b.date.localeCompare(a.date))
}

module.exports = { parseSubstackJson }
