# Plan 07 — A 404 that rescues old links

**Priority:** P0/P1 boundary · **Effort:** ~1 hour · **Value:** medium–high; every pre-redesign URL is a dead end today
**Depends on:** nothing · **Mock-up:** section 07 of the mock-ups board

## Why

Before the single-page redesign the site had `/career`, `/skills`, `/education`, `/travel`, `/contact` and `/blog/*`. Those URLs live on in LinkedIn posts, tweets and search results. Today they render Next's default 404 — a white page in a system font with the gold chat bubble still floating in the corner (verified at https://dommango.github.io/career). There is no `app/not-found.tsx`, and `output: 'export'` turns that file into `out/404.html`, which GitHub Pages serves for every unknown path.

## Done when

- [ ] `app/not-found.tsx` exists and renders in the brutalist system (nav, binary rule, display heading).
- [ ] Known old paths show "That page moved", name the new section, count down 3 seconds, then navigate to `/#<section>`. A "Go there now →" button skips the wait.
- [ ] Unknown paths show a plain 404 with links to the sections — **no** redirect, no guessing.
- [ ] Works as `out/404.html` (verify after `npm run build`).
- [ ] e2e covers both cases.

## Files

- `app/not-found.tsx` — new (client component)
- `app/globals.css` — `.nf*` classes + mobile rule
- `e2e/not-found.spec.ts` — new

## Steps

### 1. Redirect map and page (`app/not-found.tsx`)

```tsx
'use client'

// Custom 404. Old multi-page URLs redirect to their section on the single page;
// anything else gets a plain 404. Exported as out/404.html by `output: 'export'`,
// which GitHub Pages serves for every unknown path.
import { useEffect, useState } from 'react'
import { BinaryRule } from '@/components/landing/BinaryRule'

const REDIRECTS: Array<{ test: RegExp; to: string; label: string }> = [
  { test: /^\/(career|skills|education|resume)\/?$/i, to: '/#resume', label: 'Career' },
  { test: /^\/travel\/?$/i, to: '/#travel', label: 'Travel' },
  { test: /^\/contact\/?$/i, to: '/#contact', label: 'Contact' },
  { test: /^\/(blog|writing|posts)(\/.*)?$/i, to: '/#writing', label: 'Writing' },
  { test: /^\/projects?(\/.*)?$/i, to: '/#projects', label: 'Projects' },
]

const SECTIONS = [
  ['Projects', '/#projects'], ['Writing', '/#writing'], ['Career', '/#resume'], ['Travel', '/#travel'], ['Contact', '/#contact'],
] as const

export default function NotFound() {
  const [path, setPath] = useState('')
  const [seconds, setSeconds] = useState(3)
  const match = REDIRECTS.find((r) => r.test.test(path))

  useEffect(() => { setPath(window.location.pathname) }, [])

  useEffect(() => {
    if (!match) return
    if (seconds <= 0) { window.location.replace(match.to); return }
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [match, seconds])

  return (
    <div className="brutalist-root" data-accent="gold" data-contrast="default">
      <div className="page">
        <nav className="site-nav" aria-label="Main">
          <a href="/" className="brand" aria-label="Home"><span className="brand-mark">DM</span><span className="brand-word">Dom Mangonon</span></a>
        </nav>
        <main className="section">
          <BinaryRule seed={404} accent />
          <div className="nf">
            <div>
              <span className="ds-eyebrow">404</span>
              <h1 className="nf-title">{match ? <>That page<br />moved.</> : <>Nothing<br />here.</>}</h1>
              <p className="nf-lead">
                {path && <>You asked for <code>{path}</code>. </>}
                {match
                  ? <>It now lives on the front page, under <strong>{match.label}</strong>.</>
                  : <>There’s nothing at that address — no guessing where you meant.</>}
              </p>
              {match && <p className="nf-count" role="status">Taking you there in {seconds}…</p>}
              <div className="nf-actions">
                <a className="btn-primary" href={match ? match.to : '/'}>{match ? 'Go there now →' : 'Start at the top →'}</a>
              </div>
            </div>
            <ul className="nf-map" aria-label="Sections">
              {SECTIONS.map(([label, href]) => (
                <li key={href}><a className="writing-all" href={href}>{label} →</a></li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </div>
  )
}
```

`useEffect` reads `window.location` after mount so the static `404.html` (rendered with no path) hydrates cleanly — the first paint is the generic "Nothing here" and switches to the redirect copy immediately on the client. That's acceptable for a 404; don't try to read the path during render.

Note `BinaryRule seed={404}`: any unused seed is fine; it exists for hydration stability.

### 2. CSS (`app/globals.css`)

```css
.nf { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: var(--s-6); align-items: start; margin-top: var(--s-7); padding-bottom: var(--s-8); }
.nf-title { font-family: var(--font-display); font-size: clamp(44px, 8vw, 110px); line-height: .88; letter-spacing: -.04em; margin: 10px 0 0; }
.nf-lead { font-family: var(--font-mono); font-size: 13px; line-height: 1.6; letter-spacing: .04em; color: var(--fg-muted); max-width: 52ch; margin: var(--s-4) 0 0; }
.nf-lead code { color: var(--fg); background: var(--bg-elevated); padding: 2px 6px; }
.nf-count { font-family: var(--font-mono); font-size: 13px; color: var(--accent); letter-spacing: .06em; margin: var(--s-3) 0 0; }
.nf-actions { margin-top: var(--s-5); }
.nf-map { list-style: none; margin: 0; padding: var(--s-5); border: 1px solid var(--rule); display: flex; flex-direction: column; gap: var(--s-3); }
```

Mobile block: `.nf { grid-template-columns: 1fr; }`.

### 3. e2e (`e2e/not-found.spec.ts`)

```ts
import { test, expect } from "@playwright/test";

test.describe("Custom 404", () => {
  test("old /career URL redirects to the career section", async ({ page }) => {
    await page.goto("/career");
    await expect(page.getByRole("heading", { name: /that page moved/i })).toBeVisible();
    await expect(page.getByRole("status")).toContainText(/taking you there/i);
    await page.waitForURL(/\/#resume$/, { timeout: 6000 });
  });

  test("unknown paths get a plain 404 with no redirect", async ({ page }) => {
    await page.goto("/definitely-not-a-page");
    await expect(page.getByRole("heading", { name: /nothing here/i })).toBeVisible();
    await page.waitForTimeout(4000);
    expect(page.url()).toContain("/definitely-not-a-page");
  });

  test("404 is branded, not the Next default", async ({ page }) => {
    await page.goto("/career");
    await expect(page.locator(".brutalist-root .brand-mark")).toBeVisible();
    await expect(page.getByText("This page could not be found.")).toHaveCount(0);
  });
});
```

The dev server serves `not-found.tsx` for unknown routes, so the tests work locally and in CI.

## Verify

```bash
npx tsc --noEmit && npm run lint && npm run build && ls out/404.html && grep -c "That page" out/404.html && npx playwright test e2e/not-found.spec.ts
```

After deploy: open https://dommango.github.io/travel — should land on the map within 3 seconds.

## Commit

`feat: branded 404 that redirects pre-redesign URLs to their sections`
