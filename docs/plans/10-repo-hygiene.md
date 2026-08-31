# Plan 10 — Repo hygiene: commit noise, dead code, lint in CI, small perf

**Priority:** P3 · **Effort:** ~2 hours · **Value:** maintainability; makes every other plan cheaper to review
**Depends on:** nothing (do it after 01 so the analytics change lands in one go)

## Why — what's there today

| Finding | Evidence |
|---|---|
| **670 of 713 commits are `chore: update dashboard data`** (94%) | `git log --oneline \| grep -c 'update dashboard data'`. The 6-hourly cron writes placeholder JSON with a fresh `lastUpdated` every run, so there is always a diff and always a commit — of zeros, because GoatCounter isn't wired into the build (plan 01). |
| Lint has 2 errors and CI never runs lint | `npm run lint` → `TravelMap.tsx:199` React-Compiler memoization error; `vitest.setup.ts:34` `no-explicit-any`. `ci.yml` runs typecheck, tests, build, e2e — not lint. |
| Stale docs describing files that don't exist | `IMPROVEMENTS.md` lists `components/ErrorBoundary.tsx`, `hooks/*`, `app/api/contact/route.ts`, `lib/constants.ts`, `lib/utils.ts` — none exist. `ACCESSIBILITY.md` is a generic WCAG primer with examples from a multi-page site. |
| Dead assets | `public/logos/*` (8 files, unreferenced since the timeline lost logos), `public/{file,globe,next,vercel,window}.svg` (create-next-app leftovers). |
| Dead CSS | `.resume-download`, `.resume-form`, `.resume-sent`, `.btn-text`, `.resume-meta*`, `.animate-fade-in`, `.animation-delay-*` — no component references them. |
| Unused dependency | `@tailwindcss/typography` — no `prose` class anywhere; `@types/react-google-recaptcha` sits in `dependencies` instead of `devDependencies`. |
| `scripts/fetch-performance.js` tests `/career` | 404 since the redesign. |
| Theme choice isn't remembered | Reload → back to Gold. |
| Scroll-spy sets state on every scroll event | `BrutalistLanding.tsx` `onScroll` calls `setSection` unconditionally; React bails out on equal values but the loop still runs `getElementById` ×6 per frame. |
| Five font families load on the landing | Geist + Geist Mono are only used by the dashboard and the old chat widget; the landing preloads them anyway (5 `<link rel="preload">` woff2). |
| `.env.example` is gitignored | `.gitignore` has `.env*`; README tells contributors to copy a file that isn't in the repo. |

## Done when

- [ ] `update-dashboard-data.yml` produces **no commit** when the fetched data is unchanged apart from `lastUpdated`, and runs daily, not 6-hourly.
- [ ] `npm run lint` is clean and runs in `ci.yml`.
- [ ] Stale docs, dead assets, dead CSS, unused dependency removed; `npm run build` output shrinks accordingly.
- [ ] Theme persists across reloads without a hydration warning.
- [ ] Landing preloads only Archivo Black, Space Grotesk and JetBrains Mono.
- [ ] `.env.example` is tracked.

## Steps

### 1. Stop the placeholder commits

In each of `scripts/fetch-analytics.js`, `fetch-performance.js`, `fetch-uptime.js`: when the required env is missing, **do not write a placeholder** if the output file already exists — log and `return`. (First run on a fresh clone still writes one so the dashboard has a file to read.)

```js
if (!API_KEY || !SITE) {
  if (existsSync(OUTPUT_PATH)) { console.log('no credentials; leaving existing analytics.json alone'); return }
  // …existing placeholder write…
}
```

Then make the commit step diff-aware in `.github/workflows/update-dashboard-data.yml`:

```yaml
      - name: Commit updated data
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add public/data/
          # Ignore diffs that only touch lastUpdated — those are not data changes.
          if git diff --staged -U0 | grep '^[+-]' | grep -v '^[+-][+-]' | grep -qv '"lastUpdated"'; then
            git commit -m "chore: update dashboard data"
            git push
          else
            git reset -q
            echo "No dashboard data changes."
          fi
```

And `cron: '0 6 * * *'` (daily). With plan 01 wiring GoatCounter, real numbers will start changing daily — those commits are legitimate.

In `scripts/fetch-performance.js` change `PAGES_TO_TEST` to `['/']`.

### 2. Lint clean, lint in CI

- `components/travel/TravelMap.tsx` line ~199: remove `useCallback` around `showCountryTooltip` (a plain function is fine; the React Compiler handles memoization) **or** add `[isoToCountryMap]` to its deps. Plan 09 touches this file too — coordinate.
- `vitest.setup.ts`: replace `as any` with `as unknown as typeof IntersectionObserver`; delete the unused `expect` import.
- `app/dashboard-m7x9k2/components/AnalyticsPanel.tsx`: drop the unused `clsx` import.
- `ci.yml`: add after Typecheck:

```yaml
      - name: Lint
        run: npm run lint
```

### 3. Delete what's dead

```bash
git rm IMPROVEMENTS.md ACCESSIBILITY.md
git rm -r public/logos public/file.svg public/globe.svg public/next.svg public/vercel.svg public/window.svg
npm uninstall @tailwindcss/typography
npm uninstall @types/react-google-recaptcha && npm i -D @types/react-google-recaptcha --legacy-peer-deps
```

`scripts/process-logos.js` only exists to produce `public/logos` — delete it too.

In `app/globals.css` delete: the `.animate-fade-in` keyframes block and `.animation-delay-*` (lines ~100–121), and the Resume leftovers `.resume-download`, `.resume-form`, `.resume-sent`, `.btn-text`, `.btn-text:hover`, `.resume-meta`, `.resume-meta li`, `.resume-meta li :last-child`. Confirm with `grep -rn "<class>" components app` before each deletion.

Update `CLAUDE.md`'s "All styles live in app/globals.css (~1130 lines)" count after the edit — it's the one doc that must stay accurate.

### 4. Remember the theme

`BrutalistLanding.tsx`:

```ts
const STORAGE_KEY = 'theme-mode'
const [mode, setMode] = useState<ThemeMode>('gold')

// Read after mount so server and first client render agree (avoids a hydration mismatch).
useEffect(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'gold' || saved === 'oxblood' || saved === 'contrast') setMode(saved)
  } catch { /* storage unavailable — keep default */ }
}, [])

const cycleMode = () =>
  setMode((m) => {
    const next: ThemeMode = m === 'gold' ? 'oxblood' : m === 'oxblood' ? 'contrast' : 'gold'
    try { localStorage.setItem(STORAGE_KEY, next) } catch { /* ignore */ }
    return next
  })
```

There will be a one-frame flash from Gold to the saved theme on load; acceptable for a cycler that's a novelty. (A no-flash version needs an inline script in `layout.tsx` setting a `data-` attribute before hydration; not worth it here.)

### 5. Cheaper scroll-spy

```ts
useEffect(() => {
  let raf = 0
  const compute = () => {
    raf = 0
    const y = window.scrollY + 140
    let current: SectionId = 'hero'
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id)
      if (el && el.offsetTop <= y) current = id
    }
    setSection((prev) => (prev === current ? prev : current))
  }
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(compute) }
  window.addEventListener('scroll', onScroll, { passive: true })
  compute()
  return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf) }
}, [])
```

### 6. Fonts only where used

Move the `Geist` and `Geist_Mono` loaders from `app/layout.tsx` into `app/dashboard-m7x9k2/layout.tsx` and apply their `.variable` classes on that layout's wrapper `div`. Remove them from the root `<body>` className. The `:root` `--font-sans: var(--font-geist-sans)` bridge in `globals.css` now only resolves inside the dashboard, which is the only place Tailwind `font-sans` is used (after plan 06 the chat widget uses brand fonts). Verify: `npm run build && grep -c 'rel="preload"' out/index.html` drops from 5 font preloads to 3 (+ the portrait + the JS chunk).

### 7. Track `.env.example`

`.gitignore`: add `!.env.example` after `.env*`. Trim the example to the keys that exist today (`NEXT_PUBLIC_EMAILJS_*`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `NEXT_PUBLIC_GOATCOUNTER_SITE`, `NEXT_PUBLIC_CHAT_API_URL`) — drop `NOTION_API_KEY` and `RESUME_SOURCE`, which nothing reads any more. `git add .env.example`.

## Verify

```bash
npm run lint && npx tsc --noEmit && npm test -- --run && npm run build && npx playwright test
git log --oneline -5   # after the next cron: no new "update dashboard data" commit unless numbers changed
```

## Commit

Split into small commits: `chore: stop placeholder dashboard commits`, `chore: lint clean and lint in CI`, `chore: remove dead assets, docs and CSS`, `feat: remember theme choice`, `perf: rAF-throttled scroll spy, dashboard-only Geist fonts`.
