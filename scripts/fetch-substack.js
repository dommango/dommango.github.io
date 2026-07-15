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

const FEED_URL = 'https://dommangonon.substack.com/feed'
const TARGET = path.join(__dirname, '../lib/content/writing.ts')
const MAX_POSTS = 6
const MARKER = '// GENERATED — do not edit by hand. See scripts/fetch-substack.js.'

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

async function main() {
  let posts = []

  try {
    const response = await fetch(FEED_URL, {
      headers: { 'user-agent': 'dommango.github.io build' },
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) {
      console.warn(`[substack] feed returned ${response.status}; keeping committed posts`)
      return
    }

    posts = parseSubstackFeed(await response.text()).slice(0, MAX_POSTS)
  } catch (error) {
    console.warn(`[substack] fetch failed (${error.message}); keeping committed posts`)
    return
  }

  const source = fs.readFileSync(TARGET, 'utf8')
  const markerIndex = source.indexOf(MARKER)

  if (markerIndex === -1) {
    console.warn('[substack] generated marker missing in writing.ts; leaving file alone')
    return
  }

  const head = source.slice(0, markerIndex + MARKER.length)
  const tail = source.slice(source.indexOf('export const hasPosts'))

  fs.writeFileSync(TARGET, `${head}\n${serialize(posts)}\n\n${tail}`)
  console.log(`[substack] wrote ${posts.length} post(s) to lib/content/writing.ts`)
}

main()
