# Plan 03 — Writing: featured post, reading time, subscribe

**Priority:** P1 · **Effort:** ~half a day · **Value:** high for readers arriving from Substack
**Depends on:** plan 01 (posts must be committed so the section renders) · **Mock-up:** section 03 of the mock-ups board

## Why

Once plan 01 makes the Writing section visible, it renders posts as the same catalog cards as projects: no cover image, no reading time, no way to follow. Readers coming from a Substack post are the visitors most likely to return. Give the latest post a featured block with its cover, list the rest as an archive, and add a subscribe form that posts straight to Substack — no new backend on a static site.

## Done when

- [ ] The newest post renders as a featured block: cover image, date, "N min read", title, subtitle, "Read on Substack ↗", and a chip linking to the related project when one is mapped.
- [ ] Older posts render as a compact archive list (date · title · Read ↗). With one post the archive shows that one post; the section never shows placeholder rows.
- [ ] A subscribe form with an email field submits to Substack and shows a confirmation state.
- [ ] RSS link present. Section still hidden when `POSTS` is empty (existing invariant + e2e).
- [ ] `npm test -- --run` passes with the new parser tests.

## Files

- `scripts/lib/parse-substack-feed.js` — extract `image` (enclosure) and `minutes` (word count of `content:encoded`)
- `__tests__/parse-substack-feed.test.ts` — tests for the two new fields
- `scripts/fetch-substack.js` — serialise the new fields
- `lib/content/writing.ts` — type gains `image?`, `minutes?`
- `lib/content/writing-links.ts` — new: post slug → project id map
- `components/landing/Writing.tsx` — featured + archive + subscribe
- `app/globals.css` — new classes + mobile rules
- `next.config.ts` — no change needed (`<img>` is used, not `next/image`)

## Steps

### 1. Parser: cover image and reading time

In `scripts/lib/parse-substack-feed.js`, inside the `items.map(...)`:

```js
      const image = text(item?.enclosure?.['@_url']) || undefined
      const body = text(item?.['content:encoded'])
      const words = body ? stripHtml(body).split(/\s+/).filter(Boolean).length : 0
      const minutes = words > 0 ? Math.max(1, Math.round(words / 230)) : undefined

      if (!title || !url || !date) return null
      if (isPlaceholder(title)) return null

      return {
        title, url, date,
        ...(subtitle ? { subtitle } : {}),
        ...(image ? { image } : {}),
        ...(minutes ? { minutes } : {}),
      }
```

`XMLParser` is already constructed with `ignoreAttributes: false`, so `enclosure['@_url']` is available. The existing `text()` helper handles the object shape.

Substack's cover URLs are already CDN-resized on request; store the URL as-is and let the component request a sized variant (step 4).

### 2. Tests (`__tests__/parse-substack-feed.test.ts`)

Extend the `item()` helper to accept optional `extra` XML, then add:

```ts
  it('extracts the cover image from <enclosure>', () => {
    const posts = parseSubstackFeed(
      feed(item('Post', 'https://x.substack.com/p/a', 'Mon, 06 Jul 2026 12:00:00 GMT', 'Sub',
        '<enclosure url="https://cdn.example/cover.png" length="0" type="image/jpeg"/>'))
    )
    expect(posts?.[0].image).toBe('https://cdn.example/cover.png')
  })

  it('estimates reading time from content:encoded at 230 wpm, minimum 1', () => {
    const words = Array.from({ length: 690 }, () => 'word').join(' ')
    const posts = parseSubstackFeed(
      feed(item('Post', 'https://x.substack.com/p/a', 'Mon, 06 Jul 2026 12:00:00 GMT', '',
        `<content:encoded><![CDATA[<p>${words}</p>]]></content:encoded>`))
    )
    expect(posts?.[0].minutes).toBe(3)
  })

  it('omits image and minutes when absent', () => {
    const posts = parseSubstackFeed(feed(item('Post', 'https://x.substack.com/p/a', 'Mon, 06 Jul 2026 12:00:00 GMT')))
    expect(posts?.[0]).not.toHaveProperty('image')
    expect(posts?.[0]).not.toHaveProperty('minutes')
  })
```

The `feed()` wrapper must declare the namespace for `content:encoded` to parse: add `xmlns:content="http://purl.org/rss/1.0/modules/content/"` to its `<rss>` tag (fast-xml-parser doesn't require it, but the real feed has it and the test should match reality).

### 3. Serialiser and type

`scripts/fetch-substack.js` → in `serialize()` add after the subtitle line:

```js
      if (post.image) fields.push(`    image: ${JSON.stringify(post.image)},`)
      if (post.minutes) fields.push(`    minutes: ${post.minutes},`)
```

`lib/content/writing.ts`:

```ts
export interface WritingPost {
  title: string
  url: string
  date: string
  subtitle?: string
  /** Cover image URL from the feed's <enclosure>. */
  image?: string
  /** Estimated reading time. */
  minutes?: number
}
```

Re-run `node scripts/fetch-substack.js` and commit the regenerated `POSTS`.

### 4. Post → project map (`lib/content/writing-links.ts`)

```ts
// Hand-maintained: which project a post is about, keyed by the post's URL slug.
// Used by Writing to show an "About → <project>" chip on the featured post.
export const POST_PROJECT: Record<string, string> = {
  'the-game-had-already-started': '#brkt-0002/05',
}

export const slugOf = (url: string): string => url.replace(/\/+$/, '').split('/').pop() ?? ''
```

### 5. Component (`components/landing/Writing.tsx`)

```tsx
'use client'
import { useState } from 'react'
import { POSTS, SUBSTACK_URL, type WritingPost } from '@/lib/content/writing'
import { POST_PROJECT, slugOf } from '@/lib/content/writing-links'
import { PROJECTS } from '@/lib/content/projects'
import { BinaryRule } from './BinaryRule'

const formatDate = /* unchanged */

// Substack CDN accepts sizing directives in the path; request a 900px WebP.
const sized = (url: string) => url.replace('/image/fetch/', '/image/fetch/w_900,c_limit,f_webp,q_auto:good/')

function Featured({ post }: { post: WritingPost }) {
  const projectId = POST_PROJECT[slugOf(post.url)]
  const project = PROJECTS.find((p) => p.id === projectId)
  return (
    <article className="featured">
      {post.image && (
        <div className="featured-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={sized(post.image)} alt="" width={900} height={563} loading="lazy" />
        </div>
      )}
      <div className="featured-text">
        <div className="meta-row"><span className="is-accent">Latest</span><span>{formatDate(post.date)}</span>{post.minutes && <span>{post.minutes} min read</span>}</div>
        <h3 className="featured-title">{post.title}</h3>
        {post.subtitle && <p className="featured-sub">{post.subtitle}</p>}
        {project && <a className="chip" href="#projects">About → {project.name}</a>}
        <a className="writing-all is-accent" href={post.url} target="_blank" rel="noreferrer">Read on Substack ↗</a>
      </div>
    </article>
  )
}

function Subscribe() {
  const [done, setDone] = useState(false)
  return (
    <div className="sub-block">
      <div>
        <h4 className="sub-title">Get the next one in your inbox.</h4>
        <p className="sub-copy">Build notes, roughly monthly. Unsubscribe is one click.</p>
      </div>
      <form
        className="sub-form"
        action={`${SUBSTACK_URL}/api/v1/free?nojs=true`}
        method="post"
        target="substack-subscribe"
        onSubmit={() => setDone(true)}
      >
        <div className="field">
          <label htmlFor="sub-email">Email</label>
          <input id="sub-email" name="email" type="email" required placeholder="you@company.com" autoComplete="email" />
        </div>
        <button className="btn-primary" type="submit">Subscribe →</button>
        {done && <span className="sub-ok" role="status">Check your inbox to confirm.</span>}
      </form>
      <iframe name="substack-subscribe" title="Substack subscribe" hidden />
    </div>
  )
}

export function Writing() {
  const [latest, ...rest] = POSTS
  return (
    <section id="writing" className="writing section">
      <BinaryRule seed={71} />
      <div className="projects-head">{/* unchanged */}</div>
      <Featured post={latest} />
      <Subscribe />
      <ul className="archive" aria-label="All posts">
        {POSTS.map((post) => (
          <li key={post.url}>
            <span className="archive-date">{formatDate(post.date)}</span>
            <span>{post.title}</span>
            <a className="writing-all" href={post.url} target="_blank" rel="noreferrer">Read ↗</a>
          </li>
        ))}
      </ul>
      <div className="writing-foot">
        <a className="writing-all" href={SUBSTACK_URL} target="_blank" rel="noreferrer">All posts on Substack ↗</a>
        <a className="writing-all" href={`${SUBSTACK_URL}/feed`} target="_blank" rel="noreferrer">RSS ↗</a>
      </div>
    </section>
  )
}
```

`rest` is unused when the archive lists everything; drop the destructure if lint complains and use `POSTS[0]`.

**Subscribe endpoint check (do this before styling):** Substack's own embed posts to `<publication>/api/v1/free?nojs=true` with a form field named `email`. Verify with a throwaway address by submitting the built page; if Substack has changed the endpoint, fall back to the official iframe embed: `<iframe src="https://dommangonon.substack.com/embed" width="100%" height="320" frameBorder="0" scrolling="no" title="Subscribe to Context//Collapse" />` inside `.sub-block`. The hidden-iframe target keeps the visitor on the page in the form version.

### 6. CSS (`app/globals.css`, Writing block)

```css
.featured { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); border: 1px solid var(--rule); margin-top: var(--s-7); }
.featured-media { border-right: 1px solid var(--rule); background: var(--bg-elevated); }
.featured-media img { width: 100%; height: 100%; object-fit: cover; display: block; }
.featured-text { padding: var(--s-5); display: flex; flex-direction: column; gap: var(--s-3); align-items: flex-start; }
.featured-title { font-family: var(--font-display); font-size: clamp(24px, 3vw, 36px); line-height: 1; letter-spacing: -0.02em; margin: 0; }
.featured-sub { font-size: 15px; color: var(--fg-muted); max-width: 48ch; margin: 0; }
.meta-row { display: flex; gap: 14px; flex-wrap: wrap; font-family: var(--font-mono); font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: var(--fg-low); }
.meta-row .is-accent, .writing-all.is-accent { color: var(--accent); border-color: var(--accent); }
.chip { display: inline-flex; gap: 6px; padding: 4px 9px; border: 1px solid var(--rule); font-family: var(--font-mono); font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: var(--fg-muted); text-decoration: none; }
.chip:hover { border-color: var(--accent); color: var(--accent); }
.sub-block { margin-top: var(--s-5); display: grid; grid-template-columns: 1fr 1fr; gap: var(--s-5); border: 1px solid var(--rule); padding: var(--s-5); align-items: center; }
.sub-title { font-size: 19px; font-weight: 700; line-height: 1.15; margin: 0; }
.sub-copy { color: var(--fg-muted); font-size: 14px; margin: 6px 0 0; max-width: 44ch; }
.sub-form { display: flex; gap: var(--s-3); align-items: flex-end; flex-wrap: wrap; }
.sub-form .field { flex: 1 1 200px; }
.sub-ok { font-family: var(--font-mono); font-size: 12px; color: var(--accent); }
.archive { list-style: none; padding: 0; margin: var(--s-5) 0 0; border-top: 1px solid var(--rule); }
.archive li { display: grid; grid-template-columns: 110px 1fr auto; gap: var(--s-4); padding: 12px 0; border-bottom: 1px solid var(--rule); align-items: baseline; font-size: 14px; }
.archive-date { font-family: var(--font-mono); font-size: 11px; letter-spacing: .08em; color: var(--fg-low); }
.writing-foot { display: flex; gap: var(--s-5); flex-wrap: wrap; }
```

Mobile block additions:

```css
  .featured, .sub-block { grid-template-columns: 1fr; }
  .featured-media { border-right: 0; border-bottom: 1px solid var(--rule); aspect-ratio: 16 / 10; }
  .archive li { grid-template-columns: 1fr; gap: 4px; }
```

### 7. e2e

Add to `e2e/landing.spec.ts` inside the structure suite (runs only when posts exist):

```ts
  test("writing leads with a featured post and a subscribe form", async ({ page }) => {
    test.skip(POSTS.length === 0, "no posts committed");
    await expect(page.locator("#writing .featured-title")).toHaveText(POSTS[0].title);
    await expect(page.locator("#writing form.sub-form input[type=email]")).toBeVisible();
  });
```

## Verify

```bash
npm test -- --run && npx tsc --noEmit && npm run lint && npm run build && npx playwright test
```

Check the featured image loads in all three themes and the form's confirmation state appears.

## Commit

`feat: featured post, reading time and subscribe form in Writing`
