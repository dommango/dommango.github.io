# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dom Mangonon's personal site: a **single-page** portfolio built with Next.js 16, React 19,
TypeScript, and Tailwind CSS 4. Static export (no server runtime), deployed to GitHub Pages
at https://dommango.github.io.

The page leads with the **project portfolio**, then writing, with career compressed to context.

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Build static site (output: out/)
npm test             # Run Vitest tests (watch mode)
npm test -- --run    # Run tests once
npm run lint         # ESLint check
npx tsc --noEmit     # Type check
npx playwright test  # E2E
```

Note: `npm install` needs `--legacy-peer-deps` (react-simple-maps declares a React <19 peer).
CI uses it too.

## Architecture

The whole site is **one page**. `app/page.tsx` is a server component that loads data at build
time and hands it to `components/landing/BrutalistLanding.tsx`, a client shell holding theme +
scroll-spy state and composing every section.

```
app/
├── layout.tsx            # Root layout, fonts, metadata/JSON-LD, ChatBot
├── page.tsx              # Loads projects/writing/travel data -> BrutalistLanding
├── globals.css           # All styles (see Design System below)
└── dashboard-m7x9k2/     # Private-ish analytics dashboard (obscure URL, not linked)

components/landing/       # The page, in DOM order:
├── Nav.tsx               # Sticky nav + theme cycler
├── Availability.tsx      # Status strip under nav
├── Hero.tsx              # Headline, portrait, bio
├── Projects.tsx          # THE MAIN SECTION — project cards
├── Writing.tsx           # Substack posts; renders only when posts exist
├── Resume.tsx            # Compressed career timeline
├── Travel.tsx            # Continent bars + globe
├── Contact.tsx           # EmailJS-wired form
├── Footer.tsx
└── BinaryRule.tsx        # Decorative divider (seeded PRNG — see below)

components/travel/TravelMap.tsx   # Heavy globe, dynamically imported by landing/Travel
components/chat/ChatBot.tsx       # Assistant widget
components/ui/                    # Card, Skeleton, ProgressBar — dashboard only

lib/content/              # Build-time data (no fs, no runtime fetch)
├── projects.ts           # Hand-authored PROJECTS array
├── writing.ts            # Substack posts
└── travel.ts             # Transforms content/travel/*.json
lib/services/             # emailjs.ts, chat.ts
```

## Adding or changing a section

Four places must stay in sync or the scroll-spy breaks silently:

1. `components/landing/<Section>.tsx` — the component
2. `SectionId` union in `Nav.tsx`
3. `SECTION_IDS` in `BrutalistLanding.tsx` — **must match DOM order**; the spy takes the last
   element with `offsetTop <= scrollY`, so wrong order = wrong active link
4. The `link()` calls in `Nav.tsx`

Conditional sections (Writing) need the nav link gated by the same predicate as the section,
or the link scrolls to nothing.

## Design System

All styles live in `app/globals.css` (~1130 lines). Two disjoint token systems:

- **`:root` (lines 1-121)** — legacy tokens + Tailwind bridge. Used by the dashboard/ChatBot only.
- **`.brutalist-root` (128-239)** — the landing. Everything is scoped here.

**Build new sections from semantic tokens only** — `var(--accent)`, `var(--fg)`, `var(--fg-muted)`,
`var(--fg-low)`, `var(--rule)`, `var(--s-N)` spacing, `var(--font-display|sans|mono)`. Do that and
all three themes (Gold / Oxblood / High Contrast) work for free, since the theme cycler only swaps
token values via `[data-accent]` / `[data-contrast]` attributes.

The landing is **dark-only by design** — the `prefers-color-scheme: light` block only touches
`:root`, which `.brutalist-root` shadows.

**Responsive: one breakpoint**, `@media (max-width: 900px)` at the bottom. Any new multi-column
grid must be added there manually; nothing is automatic.

Structure convention: `.section` > `<BinaryRule/>` > `.*-head`. The adjacent-sibling rule
`.section > .binary-rule + *` supplies the top margin, so keep that order.

`BinaryRule`'s `seed` prop drives a deterministic sine-hash PRNG — it exists for **hydration
safety** (server and client must render identical digits), not aesthetics. Give new sections an
arbitrary unused seed.

## Content

Hand-authored TypeScript in `lib/content/`, not markdown. Prefer typed TS modules over JSON:
`resolveJsonModule` is on, and importing an empty `[]` JSON file infers `never[]`, which fails
typecheck under `strict`.

Travel data is the exception — script-generated JSON in `content/travel/`, produced by
`scripts/process-travel-data.js` and `scripts/fetch-flights.js` (both manual).

**Career content is deliberately NOT in this repo** — it's gitignored. This repo is public; the
source of record is `~/personal/career`. Don't re-add it or reintroduce a sync step.

## Deployment

`.github/workflows/deploy.yml` — on push to `main` (+ manual), builds and pushes `out/` to Pages.

**Gotcha:** pushes made by `github-actions[bot]` with the default `GITHUB_TOKEN` do **not**
trigger workflows. So a cron that commits data cannot make the site rebuild. Anything needing
fresh data at deploy time must fetch **during the build**, not commit-then-rebuild.

`update-dashboard-data.yml` crons analytics/uptime/performance JSON into `public/data/`.

## Testing

Vitest + jsdom for units (`__tests__/`), Playwright for E2E (`e2e/`). `vitest.setup.ts` mocks
`matchMedia` and `IntersectionObserver`.

Test nontrivial logic (parsers, transforms, conditional-render invariants). Skip ceremony tests.
