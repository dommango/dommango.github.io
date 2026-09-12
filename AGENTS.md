# personal-website — Agent Guide

Dom Mangonon's single-page portfolio, deployed to https://dommango.github.io. Accessibility
guidelines: `ACCESSIBILITY.md`.

## Stack

Next.js 16 App Router · React 19 · TS strict · Tailwind 4 · static export (no server runtime,
all data loaded at build time) · GitHub Pages deploy via `.github/workflows/deploy.yml`.

## Commands

- `npm install --legacy-peer-deps` — react-simple-maps declares a React <19 peer; CI uses it too
- `npm run dev` / `build` (→ `out/`) / `lint` · `npx tsc --noEmit`
- `npm test -- --run` (vitest; drop `-- --run` for watch mode) · `npx playwright test` (e2e)

## Hard rules

- **Never commit Citi/employer-confidential content.** History was purged once already
  (2026-08-28: filter-rewrite + force-push across `main`/feature branches) after regulator-
  confidential material (Consent Order text, MRA reporting detail) leaked into commits on this
  public repo. Career content is gitignored by design — source of record is `~/personal/career`,
  not this repo; don't re-add it or reintroduce a sync step. `'Citi · SVP, Transformation'`
  (LinkedIn-grade) is fine; verbatim regulatory/internal detail is not. A dangling old SHA
  (`cf65730`) may still be GitHub-support-GC pending — don't assume force-push alone is enough.
- Four places must stay in sync when adding/changing a landing section, or the scroll-spy breaks
  silently: the component in `components/landing/`, the `SectionId` union in `Nav.tsx`,
  `SECTION_IDS` in `BrutalistLanding.tsx` (must match DOM order — spy takes the last element with
  `offsetTop <= scrollY`), and the `link()` calls in `Nav.tsx`. A conditional section (e.g.
  Writing) needs its nav link gated by the same predicate as the section.
- Build sections from semantic tokens only (`var(--accent)`, `var(--fg)`, `var(--fg-muted)`,
  `var(--rule)`, `var(--s-N)`, `var(--font-*)`) in `app/globals.css` — that's what makes all three
  themes (Gold/Oxblood/High Contrast) work via `[data-accent]`/`[data-contrast]`. The landing
  (`.brutalist-root`) is dark-only by design and shadows the legacy `:root` light block. One
  responsive breakpoint, `@media (max-width: 900px)` at the bottom of globals.css — new grids
  aren't automatic. Structure convention: `.section` > `<BinaryRule/>` > `.*-head`, order matters
  (adjacent-sibling rule supplies top margin). `BinaryRule`'s `seed` prop drives a deterministic
  PRNG for hydration safety, not aesthetics — give new sections an unused seed.
- Content is hand-authored TS in `lib/content/`, not markdown/JSON (`resolveJsonModule` +
  `strict` infers `never[]` from an empty JSON array, which fails typecheck). Travel data is the
  exception — script-generated JSON via `scripts/process-travel-data.js` /
  `scripts/fetch-flights.js` (both manual, not automated).
- `github-actions[bot]` pushes with the default `GITHUB_TOKEN` don't trigger workflows, so a cron
  that commits data can't make the site rebuild. Anything needing fresh data at deploy time must
  fetch during the build, not commit-then-rebuild.

## Env (`.env.local`, copy from `.env.example`)

EmailJS (`NEXT_PUBLIC_EMAILJS_SERVICE_ID`/`_TEMPLATE_ID`/`_PUBLIC_KEY`,
`NEXT_PUBLIC_EMAILJS_CONTACT_TEMPLATE_ID`) — without these the contact form renders but won't
send. `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`. `NOTION_API_KEY` (flight-data sync).
`NEXT_PUBLIC_SITE_URL` / `SITE_URL`. `NEXT_PUBLIC_CHAT_API_URL` (ChatBot widget only renders when
set). GoatCounter analytics: `GOATCOUNTER_API_KEY`, `GOATCOUNTER_SITE`,
`NEXT_PUBLIC_GOATCOUNTER_SITE`. `UPTIMEROBOT_API_KEY` (dashboard). `RESUME_SOURCE` (optional,
defaults to `~/personal/career/Mangonon_Dominic_Resume.html`).
