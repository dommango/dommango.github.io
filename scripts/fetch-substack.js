// Fetches the Substack feed and rewrites the POSTS array in
// lib/content/writing.ts. Runs during the build (see .github/workflows/deploy.yml),
// NOT as a cron that commits: pushes from github-actions[bot] with the default
// GITHUB_TOKEN don't trigger workflows, so commit-then-rebuild silently never
// rebuilds.
//
// A fetch failure is not a build failure — it leaves the committed POSTS alone.

const fs = require('fs')
const path = require('path')
const { parseSubstackFeed } = require('./lib/parse-substack-feed')
const { parseSubstackJson } = require('./lib/parse-substack-json')

const FEED_URLS = [
  'https://dommangonon.substack.com/feed',
  // Substack's JSON API sometimes answers when the RSS route is challenged.
  'https://dommangonon.substack.com/api/v1/posts?limit=6',
]
const HEADERS = {
  'user-agent': 'Mozilla/5.0 (compatible; dommango.github.io build; +https://dommango.github.io)',
  accept: 'application/rss+xml, application/xml, application/json;q=0.9, */*;q=0.8',
}
const TARGET = path.join(__dirname, '../lib/content/writing.ts')
const MAX_POSTS = 6
const MARKER = '// GENERATED — do not edit by hand. See scripts/fetch-substack.js.'
// Anchored on newlines so it can never match inside a generated post title:
// serialize() runs every field through JSON.stringify, which escapes real
// newlines, so no string literal it emits can contain one.
const END_MARKER = '\n// END GENERATED\n'

const serialize = (posts) => {
  if (posts.length === 0) return 'export const POSTS: WritingPost[] = []'

  const entries = posts
    .map((post) => {
      const fields = [
        `    title: ${JSON.stringify(post.title)},`,
        `    url: ${JSON.stringify(post.url)},`,
        `    date: ${JSON.stringify(post.date)},`,
      ]
      if (post.subtitle) fields.push(`    subtitle: ${JSON.stringify(post.subtitle)},`)
      return `  {\n${fields.join('\n')}\n  },`
    })
    .join('\n')

  return `export const POSTS: WritingPost[] = [\n${entries}\n]`
}

// Fetches and parses a single source. Returns null (try the next source) on
// any failure — non-2xx, unparseable body, or a body that isn't actually a
// posts list (see parseSubstackFeed/parseSubstackJson doc comments).
async function fetchPosts(url) {
  const response = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(15000) })

  if (!response.ok) {
    console.warn(`[substack] ${url} returned ${response.status}`)
    return null
  }

  const body = await response.text()
  const parsed = url.includes('/api/v1/posts') ? parseSubstackJson(body) : parseSubstackFeed(body)

  if (parsed === null) {
    console.warn(`[substack] ${url} response was not a posts feed`)
    return null
  }

  return parsed
}

async function main() {
  let posts = null

  for (const url of FEED_URLS) {
    try {
      posts = await fetchPosts(url)
    } catch (error) {
      console.warn(`[substack] fetch failed for ${url} (${error.message})`)
      posts = null
    }
    if (posts !== null) break
  }

  // null after every source means an outage — a 200 carrying an interstitial
  // or a login page counts too. Writing [] there would silently empty the
  // Writing section on a cron build nobody is watching, so keep committed
  // posts instead, same as any other failure.
  if (posts === null) {
    console.warn('[substack] all sources failed; keeping committed posts')
    return
  }

  posts = posts.slice(0, MAX_POSTS)

  const source = fs.readFileSync(TARGET, 'utf8')
  const markerIndex = source.indexOf(MARKER)
  const endIndex = source.indexOf(END_MARKER)

  // Bail rather than write a half-file: a bare indexOf(...) === -1 would flow
  // into slice(-1), which returns the last character instead of throwing and
  // would silently truncate writing.ts.
  if (markerIndex === -1 || endIndex === -1 || endIndex < markerIndex) {
    console.warn('[substack] generated markers missing or out of order in writing.ts; leaving file alone')
    return
  }

  const head = source.slice(0, markerIndex + MARKER.length)
  const tail = source.slice(endIndex)

  fs.writeFileSync(TARGET, `${head}\n${serialize(posts)}${tail}`)
  console.log(`[substack] wrote ${posts.length} post(s) to lib/content/writing.ts`)
}

// An unreadable/unwritable writing.ts is not a "fetch failure" and should fail
// the build — but surface it in the same voice as the warnings above rather
// than as a bare unhandled-rejection stack trace.
main().catch((error) => {
  console.error(`[substack] ${error.stack || error.message}`)
  process.exit(1)
})
