# Plan 02 — Project case studies with real screenshots

**Priority:** P1 (highest value) · **Effort:** ~1 day + collecting screenshots · **Value:** very high
**Depends on:** nothing (plan 03 links into this) · **Mock-up:** section 02 of the mock-ups board

## Why

The page "leads with the project portfolio" and contains no image of any project. The cards link out, but:

- **Bracketeer** → `fifawc26.up.railway.app` is a sign-in wall. A visitor sees "Sign in or create an account" and nothing else.
- **SousIQ** → a waitlist landing page. Fine, but it isn't the product.
- **PRIAL Pipeline** → no link at all. **modular-mind** → a GitHub file listing.

A hiring manager or fellow builder cannot *see* what was shipped. Each card gets a thumbnail, and each project gets an in-page case study — problem → what I built → what broke → outcome — with a facts strip and links (live, source, related post). The project data stays hand-authored TypeScript in `lib/content/projects.ts`, per CLAUDE.md.

## Done when

- [ ] Every card has a 16:10 image (real screenshot, or a rendered "data" tile for pipeline projects).
- [ ] Clicking/activating a card opens its case study below the grid; clicking again closes it. Only one open at a time.
- [ ] Case study is keyboard-operable (`Enter`/`Space` on the card, tabs by arrow keys optional) with `aria-expanded` / `aria-controls`.
- [ ] Cards still expose an external link (live / source) as a real `<a>` with `target="_blank" rel="noreferrer"`.
- [ ] Works in all three themes and at 320px wide with no horizontal scroll (existing e2e guards this).
- [ ] `npx tsc --noEmit`, `npm test -- --run`, `npx playwright test` all pass.

## Files

- `lib/content/projects.ts` — extend the `Project` type and data
- `components/landing/Projects.tsx` — thumbnails, expandable state, panel slot
- `components/landing/CaseStudy.tsx` — new
- `app/globals.css` — new classes; add grids to the `@media (max-width: 900px)` block
- `public/projects/*.webp` — images
- `e2e/landing.spec.ts` — update the "linked project cards" test, add a case-study test

## Steps

### 1. Collect the images (`public/projects/`)

Target 1280×800 source, exported as WebP ≤ 120 KB, named by project id slug:

| File | Source |
|---|---|
| `sousiq.webp` | Screenshot of the SousIQ app (a logged-in invoice → line items screen is far better than the landing page). Dom captures this; the landing page is the fallback. |
| `bracketeer.webp` | A logged-in leaderboard or bracket screen. Fallback: the Substack post's cover image (the original HTML bracket) — download `https://substackcdn.com/image/fetch/w_1280,c_limit,f_webp,q_auto:good/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1803b868-ba18-43a3-93d9-7fe96d55c7de_1440x900.png`. |
| `placemat.webp` | `https://dommango.github.io/claude-code-placemat/` — dismiss the "What's new" modal first. |
| `modular-mind.webp` | A rendered VCV Rack patch from the repo's `render-service`, or the repo README hero if one exists. Do **not** use a GitHub file listing. |
| `prial.webp` | No UI exists. Render a data tile instead (step 2) — no image file. |

A capture helper, if useful (needs a logged-in `storageState` for the private apps — capture those manually):

```js
// scripts/capture-project-shots.mjs  (run: node scripts/capture-project-shots.mjs)
import { chromium } from 'playwright'
const shots = [
  ['placemat', 'https://dommango.github.io/claude-code-placemat/'],
]
const browser = await chromium.launch()
for (const [name, url] of shots) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.keyboard.press('Escape')
  await page.screenshot({ path: `public/projects/${name}.png` })
  await page.close()
}
await browser.close()
```

Convert PNG → WebP with `cwebp -q 80 in.png -o out.webp` (install `webp` via apt) or any image tool. Delete the PNGs.

### 2. Extend the data model (`lib/content/projects.ts`)

Add to the `Project` interface:

```ts
export interface ProjectImage {
  src: string
  alt: string
}

export interface CaseStudySection {
  /** Tab label, e.g. "Problem". */
  label: string
  /** Paragraphs. Plain text; no markup. */
  paragraphs: string[]
}

export interface CaseStudy {
  headline: string
  sections: CaseStudySection[]
  facts: { label: string; value: string }[]
  links: { label: string; href: string }[]
}

export interface Project {
  // ...existing fields...
  /** Card thumbnail. Omit for projects with no UI; the card renders a data tile from `impact`. */
  image?: ProjectImage
  /** Short label over the thumbnail, e.g. "Live · sign-in". */
  status?: string
  caseStudy?: CaseStudy
}
```

Fill in the data. Bracketeer's text comes from Dom's own post — use it nearly verbatim:

```ts
  {
    id: '#brkt-0002/05',
    name: 'Bracketeer',
    // ...existing...
    image: { src: '/projects/bracketeer.webp', alt: 'Bracketeer leaderboard mid-tournament' },
    status: 'Live · sign-in',
    caseStudy: {
      headline: 'Three days before kickoff, with everyone’s picks already made.',
      sections: [
        { label: 'Problem', paragraphs: [
          'The pool started as one HTML file: fill in a bracket, click Export my picks (.csv), email it to the commissioner. Forty-some friends and family did exactly that before the opening match. The plan was to re-enter results after each round and score by hand.',
          'Three days before kickoff I decided that wasn’t good enough. Which set the first constraint before the first commit: every pick already existed, made in a tool I now had to treat as law.',
        ]},
        { label: 'What I built', paragraphs: [
          'A multi-tenant pool platform on Next 16, Prisma 7 and Auth.js, deployed to Railway. Create a pool, invite by link, make picks, watch a leaderboard update from live results. Knockout seeding implements FIFA Annex C.',
          'The first real piece wasn’t a feature. It was a test: the original JavaScript scoring function kept verbatim as an oracle, and the new engine run against it across two thousand randomized brackets.',
        ]},
        { label: 'What broke', paragraphs: [
          'The hard problem wasn’t building fast. It was building fast without ever changing an answer. If the port scored one bracket a single point differently, someone’s standing changed under them.',
          'That oracle test never left the codebase. Every refactor for six weeks had to walk past it.',
        ]},
        { label: 'Outcome', paragraphs: [
          'The pool ran on the app from the round of 32 through the final. Nobody’s score moved during the migration.',
        ]},
      ],
      facts: [
        { label: 'Status', value: 'Live · account required' },
        { label: 'Players', value: '40+ in one pool' },
        { label: 'Built in', value: '3 days to launch' },
        { label: 'Source', value: 'Private' },
      ],
      links: [
        { label: 'Read the build story ↗', href: 'https://dommangonon.substack.com/p/the-game-had-already-started' },
        { label: 'Open live ↗', href: 'https://fifawc26.up.railway.app' },
      ],
    },
  },
```

Write SousIQ, Placemat, modular-mind and PRIAL case studies in the same shape from the existing `points` plus what Dom knows. Keep each paragraph under ~60 words; 2–4 sections each. If a fact isn't known, leave it out — never invent numbers.

### 3. Build `components/landing/CaseStudy.tsx`

Client component. Props: `{ project: Project; id: string }`. Renders:

```tsx
'use client'
import { useState } from 'react'
import type { Project } from '@/lib/content/projects'

export function CaseStudy({ project, id }: { project: Project; id: string }) {
  const cs = project.caseStudy!
  const [active, setActive] = useState(0)
  return (
    <div className="case" id={id}>
      <div className="case-media">
        {project.image ? (
          <img src={project.image.src} alt={project.image.alt} width={1280} height={800} loading="lazy" />
        ) : (
          <div className="case-tile"><span className="ds-eyebrow">No UI — it’s a pipeline</span><strong>{project.impact}</strong></div>
        )}
      </div>
      <div className="case-text">
        <span className="ds-eyebrow">Case study · {project.name}</span>
        <h3 className="case-headline">{cs.headline}</h3>
        <div className="case-tabs" role="tablist" aria-label={`${project.name} case study`}>
          {cs.sections.map((s, i) => (
            <button key={s.label} type="button" role="tab" id={`${id}-tab-${i}`} aria-selected={i === active}
              aria-controls={`${id}-pane-${i}`} className={`travel-map-toggle ${i === active ? 'is-active' : ''}`}
              onClick={() => setActive(i)}>{s.label}</button>
          ))}
        </div>
        {cs.sections.map((s, i) => (
          <div key={s.label} role="tabpanel" id={`${id}-pane-${i}`} aria-labelledby={`${id}-tab-${i}`} hidden={i !== active} className="case-pane">
            {s.paragraphs.map((p) => <p key={p}>{p}</p>)}
          </div>
        ))}
        <dl className="case-facts">
          {cs.facts.map((f) => (<div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>))}
        </dl>
        <div className="case-links">
          {cs.links.map((l) => (<a key={l.href} className="writing-all" href={l.href} target="_blank" rel="noreferrer">{l.label}</a>))}
        </div>
      </div>
    </div>
  )
}
```

`next/image` is unoptimized in this project (static export), so a plain `<img>` with explicit `width`/`height` is fine; add `// eslint-disable-next-line @next/next/no-img-element` above it. Reuse `.travel-map-toggle` for the tab buttons — it's already the site's ghost-button style.

### 4. Rework `components/landing/Projects.tsx`

Make it a client component holding `openId: string | null`. Each card becomes an `<article>` with a `<button>` covering the top (thumbnail + text) and a separate `<a>` for the external link in the footer, so the card is both expandable and linkable:

```tsx
'use client'
import { useState } from 'react'
import { PROJECTS, type Project } from '@/lib/content/projects'
import { BinaryRule } from './BinaryRule'
import { CaseStudy } from './CaseStudy'

const slug = (p: Project) => p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

export function Projects() {
  const [openId, setOpenId] = useState<string | null>(null)
  const open = PROJECTS.find((p) => p.id === openId)

  return (
    <section id="projects" className="projects section">
      <BinaryRule seed={57} />
      {/* head unchanged */}
      <div className="projects-grid">
        {PROJECTS.map((project) => {
          const isOpen = project.id === openId
          const panelId = `case-${slug(project)}`
          return (
            <article key={project.id} className={`work-card ${isOpen ? 'is-open' : ''}`}>
              <button type="button" className="work-card-hit" aria-expanded={isOpen}
                aria-controls={project.caseStudy ? panelId : undefined}
                onClick={() => setOpenId(isOpen ? null : project.id)}>
                <div className="work-shot">
                  {project.image
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={project.image.src} alt={project.image.alt} width={1280} height={800} loading="lazy" />
                    : <div className="work-tile"><strong>{project.impact}</strong></div>}
                  {project.status && <span className="work-status">{project.status}</span>}
                </div>
                <div className="work-body">
                  {/* existing card-top / name / stack / impact / points markup */}
                </div>
              </button>
              <div className="work-foot">
                {project.caseStudy && <span className="work-link is-accent">{isOpen ? 'Close ↑' : 'Case study ↓'}</span>}
                {project.href && (
                  <a className="work-link" href={project.href} target="_blank" rel="noreferrer">
                    {project.hrefKind === 'repo' ? 'View source ↗' : 'Open live ↗'}
                  </a>
                )}
              </div>
            </article>
          )
        })}
      </div>
      {open?.caseStudy && <CaseStudy project={open} id={`case-${slug(open)}`} />}
    </section>
  )
}
```

Nesting rule: **no `<a>` inside the `<button>`** — the external link lives in `.work-foot`, outside the button.

### 5. CSS (`app/globals.css`, in the Projects block)

```css
.work-card { padding: 0; }                       /* padding moves to .work-body */
.work-card-hit { display: block; width: 100%; text-align: left; background: none; border: 0; padding: 0; color: inherit; cursor: pointer; font: inherit; }
.work-card-hit:focus-visible { outline: var(--bw-2) solid var(--accent); outline-offset: 3px; }
.work-card.is-open { border-color: var(--accent); }
.work-shot { aspect-ratio: 16 / 10; overflow: hidden; border-bottom: 1px solid var(--rule); background: var(--bg-elevated); position: relative; }
.work-shot img { width: 100%; height: 100%; object-fit: cover; object-position: top; }
.work-tile { height: 100%; display: flex; align-items: flex-end; padding: var(--s-5); font-family: var(--font-mono); font-size: 13px; letter-spacing: .04em; color: var(--accent); }
.work-status { position: absolute; left: 10px; top: 10px; padding: 4px 8px; background: var(--bg); border: 1px solid var(--rule); font-family: var(--font-mono); font-size: 10px; letter-spacing: .14em; text-transform: uppercase; }
.work-body { display: flex; flex-direction: column; gap: var(--s-3); padding: var(--s-4) var(--s-5) 0; }
.work-foot { display: flex; justify-content: space-between; gap: var(--s-3); flex-wrap: wrap; padding: var(--s-3) var(--s-5) var(--s-5); margin-top: var(--s-3); border-top: 1px solid var(--rule); }
.work-link.is-accent { color: var(--accent); }
.case { margin-top: var(--s-5); border: 1px solid var(--accent); display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); }
.case-media { padding: var(--s-4); border-right: 1px solid var(--rule); background: var(--bg-elevated); }
.case-media img { width: 100%; height: auto; border: 1px solid var(--rule); }
.case-tile { min-height: 240px; display: flex; flex-direction: column; justify-content: flex-end; gap: 8px; padding: var(--s-5); }
.case-text { padding: var(--s-5); display: flex; flex-direction: column; gap: var(--s-4); }
.case-headline { font-family: var(--font-display); font-size: 26px; line-height: 1; letter-spacing: -.02em; margin: 0; }
.case-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
.case-pane p { font-size: 14px; line-height: 1.55; margin: 0 0 10px; }
.case-facts { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--rule); border: 1px solid var(--rule); margin: 0; }
.case-facts > div { background: var(--bg); padding: 10px 12px; }
.case-facts dt { font-family: var(--font-mono); font-size: 10px; letter-spacing: .18em; text-transform: uppercase; color: var(--fg-low); }
.case-facts dd { margin: 4px 0 0; font-size: 13px; }
.case-links { display: flex; gap: var(--s-4); flex-wrap: wrap; }
```

And in the existing `@media (max-width: 900px)` block add:

```css
  .case { grid-template-columns: 1fr; }
  .case-media { border-right: 0; border-bottom: 1px solid var(--rule); }
  .case-facts { grid-template-columns: 1fr 1fr; }
```

The site's `.section > .binary-rule + *` rule is unaffected — the projects head still follows the rule.

### 6. Tests

Update `e2e/landing.spec.ts`:

- "linked project cards are anchors with a real href" → change the selector to `#projects .work-foot a[href="${project.href}"]` and the count assertion to `#projects .work-foot a`.
- "project cards are keyboard focusable" → focus `#projects .work-card-hit` first.
- Add:

```ts
  test("a project card opens its case study", async ({ page }) => {
    const first = PROJECTS.find((p) => p.caseStudy)!;
    const hit = page.locator("#projects .work-card-hit", { hasText: first.name });
    await hit.click();
    await expect(hit).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#projects .case")).toContainText(first.caseStudy!.headline);
    await hit.click();
    await expect(page.locator("#projects .case")).toHaveCount(0);
  });
```

## Verify

```bash
npx tsc --noEmit && npm run lint && npm test -- --run && npm run build && npx playwright test
```

Open `localhost:3000`, cycle Gold → Oxblood → High Contrast, open two case studies, tab through a card with the keyboard, then check at 360px wide.

## Commit

`feat: project thumbnails and in-page case studies`
