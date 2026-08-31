# Plan 05 — "Now" strip: dated proof the site is alive

**Priority:** P1 · **Effort:** ~half a day · **Value:** high for anyone deciding whether to reach out
**Depends on:** plan 01 (Substack posts committed) · **Mock-up:** section 05 of the mock-ups board

## Why

A static portfolio gives no signal that anything happened since it was built. The only date on the page is "© 2026". The Availability strip under the nav already occupies the right slot; replace it with four dated facts:

| Cell | Source | Freshness |
|---|---|---|
| Status — "Open to conversations · NYC metro" | hand-set in `lib/content/now.ts` | when Dom changes it |
| Latest post — title + "27 days ago" | `POSTS[0]` (already fetched at build) | every deploy |
| Last shipped — repo + "3 days ago" | GitHub API at build, public repos only | every deploy (nightly cron already exists) |
| Building — one line | hand-set in `lib/content/now.ts` | when Dom changes it |

The deploy workflow already rebuilds nightly (`schedule: '0 11 * * *'`), so the "ago" values stay honest without anyone touching the site.

## Done when

- [ ] The strip under the nav shows the four cells; on phones they stack.
- [ ] "Latest post" and "Last shipped" show an absolute date server-side and a relative "N days ago" that is computed client-side (no hydration mismatch).
- [ ] `scripts/fetch-github-activity.js` writes `lib/content/activity.ts` between `GENERATED` markers, never fails the build, and keeps the committed value when GitHub is unreachable.
- [ ] Unit tests cover the activity transform (pure function) and the relative-time formatter.
- [ ] The old `Availability` "Get in touch →" CTA survives — in the Status cell.

## Files

- `lib/content/now.ts` — new, hand-set
- `lib/content/activity.ts` — new, generated between markers (like `writing.ts`)
- `scripts/lib/pick-latest-activity.js` — new, pure transform (tested)
- `scripts/fetch-github-activity.js` — new, build-time fetch
- `lib/format/relative-time.ts` — new (tested)
- `components/landing/NowStrip.tsx` — new; replaces `Availability.tsx`
- `components/landing/BrutalistLanding.tsx` — swap the component
- `app/globals.css` — `.now*` classes + mobile rules
- `.github/workflows/deploy.yml` — run the fetch before `npm run build`
- `__tests__/pick-latest-activity.test.ts`, `__tests__/relative-time.test.ts`

## Steps

### 1. Hand-set content (`lib/content/now.ts`)

```ts
// The two lines on the Now strip that a human maintains. Change them when they change.
export const NOW = {
  status: 'Open to conversations · NYC metro',
  statusNote: 'SVP at Citi by day',
  building: 'SousIQ · vendor bid comparison',
  buildingSince: '2026-08',
} as const
```

### 2. Generated activity (`lib/content/activity.ts`)

```ts
// Latest public activity across Dom's GitHub repos, written at build time by
// scripts/fetch-github-activity.js. Same marker convention as writing.ts.
export interface Activity {
  repo: string
  /** Human label, e.g. "Placemat" */
  label: string
  url: string
  /** ISO date of the newest commit on the default branch. */
  date: string
  summary: string
}

// GENERATED — do not edit by hand. See scripts/fetch-github-activity.js.
export const LATEST_ACTIVITY: Activity | null = null
// END GENERATED
```

### 3. Pure transform (`scripts/lib/pick-latest-activity.js`)

```js
// Given the GitHub /repos/{owner}/{repo}/commits?per_page=1 responses for
// several repos, return the newest as an Activity, or null. Never throws.
const LABELS = {
  'claude-code-placemat': 'Placemat',
  'modular-mind': 'modular-mind',
  'dommango.github.io': 'This site',
}

function pickLatestActivity(results) {
  const rows = (results || [])
    .map(({ repo, commits }) => {
      const c = Array.isArray(commits) ? commits[0] : null
      const date = c?.commit?.committer?.date || c?.commit?.author?.date
      if (!repo || !date || Number.isNaN(new Date(date).getTime())) return null
      const firstLine = String(c?.commit?.message || '').split('\n')[0].trim()
      return {
        repo,
        label: LABELS[repo] || repo,
        url: c?.html_url || `https://github.com/dommango/${repo}`,
        date: new Date(date).toISOString(),
        summary: firstLine.slice(0, 80),
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.date.localeCompare(a.date))
  return rows[0] || null
}

module.exports = { pickLatestActivity, LABELS }
```

Tests (`__tests__/pick-latest-activity.test.ts`): newest wins across repos; a repo with an empty array is skipped; a malformed date is skipped; all-empty returns `null`; summary is the first line, truncated to 80 chars; label falls back to the repo name.

### 4. Build-time fetch (`scripts/fetch-github-activity.js`)

Copy the structure of `scripts/fetch-substack.js` exactly (markers, bail-outs, warnings). Differences:

```js
const REPOS = ['claude-code-placemat', 'modular-mind', 'dommango.github.io']
const { pickLatestActivity } = require('./lib/pick-latest-activity')

async function fetchCommits(repo) {
  const res = await fetch(`https://api.github.com/repos/dommango/${repo}/commits?per_page=1`, {
    headers: {
      accept: 'application/vnd.github+json',
      'user-agent': 'dommango.github.io build',
      ...(process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    },
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) throw new Error(`${repo}: ${res.status}`)
  return { repo, commits: await res.json() }
}

// In main(): Promise.allSettled over REPOS; pass the fulfilled values to
// pickLatestActivity; if null, warn and return without writing. Serialise as
// `export const LATEST_ACTIVITY: Activity | null = ${JSON.stringify(activity, null, 2)}`.
```

Filter out commits whose first line starts with `chore: update dashboard data` (the bot noise) before picking — otherwise "This site" wins every six hours with nothing to show.

`deploy.yml`, before the build step:

```yaml
      - name: Fetch GitHub activity
        env:
          GITHUB_TOKEN: ${{ github.token }}   # raises the API rate limit; read-only
        run: node scripts/fetch-github-activity.js
```

### 5. Relative time (`lib/format/relative-time.ts`)

```ts
const DAY = 86_400_000

/** "today", "yesterday", "12 days ago", "3 months ago", "2 years ago". */
export function relativeTime(iso: string, now: Date = new Date()): string {
  const days = (now.getTime() - new Date(iso).getTime()) / DAY
  if (!Number.isFinite(days) || days < 0) return ''
  if (days < 1) return 'today'
  if (days < 2) return 'yesterday'
  if (days < 30) return `${Math.round(days)} days ago`
  if (days < 365) return `${Math.round(days / 30)} months ago`
  return `${Math.round(days / 365)} years ago`
}
```

Tests: each branch, an invalid ISO returns `''`, a future date returns `''`.

### 6. Component (`components/landing/NowStrip.tsx`)

```tsx
'use client'
import { useEffect, useState } from 'react'
import { NOW } from '@/lib/content/now'
import { LATEST_ACTIVITY } from '@/lib/content/activity'
import { POSTS } from '@/lib/content/writing'
import { relativeTime } from '@/lib/format/relative-time'

const absolute = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })

/** Renders the absolute date on the server, swaps in "N days ago" after hydration. */
function Ago({ iso }: { iso: string }) {
  const [text, setText] = useState(absolute(iso))
  useEffect(() => { setText(relativeTime(iso) || absolute(iso)) }, [iso])
  return <span className="now-ago">{text}</span>
}

export function NowStrip({ onGetInTouch }: { onGetInTouch: () => void }) {
  const post = POSTS[0]
  return (
    <div className="now" aria-label="What's happening now">
      <div className="now-cell">
        <span className="now-k"><span className="avail-dot" aria-hidden="true" />Status</span>
        <span className="now-v">{NOW.status}</span>
        <button type="button" className="avail-cta" onClick={onGetInTouch}>Get in touch →</button>
      </div>
      {post && (
        <div className="now-cell">
          <span className="now-k">Latest post</span>
          <span className="now-v"><a href={post.url} target="_blank" rel="noreferrer">{post.title}</a></span>
          <Ago iso={post.date} />
        </div>
      )}
      {LATEST_ACTIVITY && (
        <div className="now-cell">
          <span className="now-k">Last shipped</span>
          <span className="now-v"><a href={LATEST_ACTIVITY.url} target="_blank" rel="noreferrer">{LATEST_ACTIVITY.label} · {LATEST_ACTIVITY.summary}</a></span>
          <Ago iso={LATEST_ACTIVITY.date} />
        </div>
      )}
      <div className="now-cell">
        <span className="now-k">Building</span>
        <span className="now-v">{NOW.building}</span>
        <span className="now-ago">since {NOW.buildingSince}</span>
      </div>
    </div>
  )
}
```

In `BrutalistLanding.tsx` replace `<Availability available onGetInTouch=… />` with `<NowStrip onGetInTouch={() => navigate('contact')} />`. Delete `Availability.tsx` and the `.availability`/`.avail-sep` CSS; keep `.avail-dot` and `.avail-cta` (reused).

### 7. CSS

```css
.now { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border-bottom: 1px solid var(--rule); }
.now-cell { padding: 14px 16px 14px 0; display: flex; flex-direction: column; gap: 5px; border-right: 1px solid var(--rule); }
.now-cell + .now-cell { padding-left: 16px; }
.now-cell:last-child { border-right: 0; }
.now-k { font-family: var(--font-mono); font-size: 10px; letter-spacing: .18em; text-transform: uppercase; color: var(--fg-low); display: flex; align-items: center; gap: 8px; }
.now-v { font-size: 14px; font-weight: 500; line-height: 1.3; }
.now-v a { color: inherit; text-decoration: none; border-bottom: 1px solid var(--rule); }
.now-v a:hover { color: var(--accent); border-color: var(--accent); }
.now-ago { font-family: var(--font-mono); font-size: 11px; letter-spacing: .06em; color: var(--accent); }
.now .avail-cta { margin-left: 0; align-self: flex-start; }
```

Mobile block: `.now { grid-template-columns: 1fr; } .now-cell { border-right: 0; border-top: 1px solid var(--rule); padding: 12px 0; } .now-cell:first-child { border-top: 0; } .now-cell + .now-cell { padding-left: 0; }`

### 8. Tests and e2e

- Unit: the two test files above.
- e2e (`landing.spec.ts`): `await expect(page.locator('.now .now-cell')).toHaveCount(POSTS.length > 0 ? 4 : 3)` — adjust if `LATEST_ACTIVITY` is null in CI (it will be unless the fetch runs in CI; CI doesn't run it, so expect 3 with posts, 2 without: `2 + (POSTS.length > 0 ? 1 : 0)`). Import `LATEST_ACTIVITY` in the spec and compute: `2 + (POSTS.length > 0 ? 1 : 0) + (LATEST_ACTIVITY ? 1 : 0)`.

## Verify

```bash
node scripts/fetch-github-activity.js && git diff lib/content/activity.ts
npm test -- --run && npx tsc --noEmit && npm run lint && npm run build && npx playwright test
```

## Commit

`feat: Now strip with latest post and last shipped, fetched at build`
