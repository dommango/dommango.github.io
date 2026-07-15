# dommango.github.io

My personal site — a single-page portfolio of the things I've built, plus writing and a travel map.

**Live:** https://dommango.github.io

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · static export to GitHub Pages.

No server runtime — everything renders at build time.

## Local development

```bash
npm install --legacy-peer-deps   # react-simple-maps declares a React <19 peer
npm run dev                      # localhost:3000
```

## Commands

```bash
npm run build         # static build -> out/
npm test -- --run     # unit tests
npx playwright test   # e2e
npm run lint
npx tsc --noEmit
```

## Environment

Copy `.env.example` to `.env.local`. The contact form uses EmailJS; without those keys it renders
but won't send.

```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
NEXT_PUBLIC_GOATCOUNTER_SITE=
```

## Deployment

Push to `main`. `.github/workflows/deploy.yml` builds and publishes to GitHub Pages.

## Architecture

See [CLAUDE.md](./CLAUDE.md) for the section structure, the design-token system, and the four
places that must stay in sync when adding a section.
