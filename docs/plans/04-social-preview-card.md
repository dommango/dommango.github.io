# Plan 04 — Social preview card (Open Graph image)

**Priority:** P1 · **Effort:** 1–2 hours · **Value:** high — every LinkedIn/X/Slack share gets a picture
**Depends on:** nothing · **Mock-up:** section 04 of the mock-ups board

## Why

`app/layout.tsx` sets `openGraph` and `twitter` metadata but **no image**, and `twitter.card` is `summary`. Shares of https://dommango.github.io render as a bare title. A single static 1200×630 PNG in the brand system fixes this for every share, forever. GitHub Pages can't generate images at request time, so render once with Playwright (already a dev dependency) and commit the file.

## Done when

- [ ] `public/og.png` exists, 1200×630, ≤ 300 KB, in the Gold theme.
- [ ] `<meta property="og:image">`, `og:image:width/height`, `og:image:alt`, `twitter:card=summary_large_image`, `twitter:image` present in the built HTML.
- [ ] `public/apple-touch-icon.png` (180×180) and `<meta name="theme-color" content="#160000">` present.
- [ ] LinkedIn Post Inspector and X Card Validator show the image.

## Files

- `scripts/og/template.html` — new, the card
- `scripts/render-og.mjs` — new, renders template → `public/og.png` (and the touch icon)
- `public/og.png`, `public/apple-touch-icon.png` — generated, committed
- `app/layout.tsx` — metadata

## Steps

### 1. The template (`scripts/og/template.html`)

Self-contained; fonts via Google Fonts (rendering happens on a machine with network). Portrait is referenced relative to the repo.

```html
<!doctype html>
<html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
  html,body{margin:0}
  .og{width:1200px;height:630px;background:#160000;color:#f4efe6;position:relative;overflow:hidden;display:grid;grid-template-columns:1fr 420px;font-family:"JetBrains Mono",monospace}
  .rule{position:absolute;left:0;right:0;font-size:16px;letter-spacing:.3em;word-spacing:.8em;white-space:nowrap;overflow:hidden;color:#7a7060;padding:18px 56px;border-bottom:1px solid #3d0f0f}
  .rule.top{top:0}
  .rule.bot{bottom:0;border-bottom:0;border-top:1px solid #3d0f0f;color:#d4a847}
  .text{padding:120px 0 0 56px;display:flex;flex-direction:column;gap:22px}
  .brand{display:flex;align-items:center;gap:16px}
  .brand .m{width:48px;height:48px;background:#d4a847;color:#160000;font-family:"Archivo Black",sans-serif;font-size:24px;display:flex;align-items:center;justify-content:center}
  .brand .w{font-size:18px;letter-spacing:.2em;text-transform:uppercase;color:#b8ab94}
  h1{font-family:"Archivo Black",sans-serif;font-size:104px;line-height:.9;letter-spacing:-.04em;margin:0}
  h1 span{color:#d4a847}
  .k{font-size:22px;line-height:1.4;letter-spacing:.04em;color:#b8ab94;max-width:640px;margin:0}
  .portrait{padding:60px 56px 60px 0;display:flex;align-items:center;justify-content:flex-end}
  .portrait img{height:430px;width:auto;border:1px solid #7a7060;padding:10px;background:#160000}
</style></head>
<body><div class="og">
  <div class="rule top">0 0 1 1 0 0 0 1 1 0 0 1 1 0 1 0 0 1 0 1 1 1 1 0 1 1 0 1 0 1 0 1 1 0 0 0 0 0 1 1 0 1 1 0 0 1 0 1 1</div>
  <div class="text">
    <div class="brand"><span class="m">DM</span><span class="w">dommango.github.io</span></div>
    <h1>Dom<br>Mangonon<span>.</span></h1>
    <p class="k">Builds software with AI — SousIQ, Bracketeer, the Claude Code Placemat. Projects, writing, a travel map.</p>
  </div>
  <div class="portrait"><img src="../../public/images/portrait-skyline.webp" alt=""></div>
  <div class="rule bot">PROJECTS · WRITING · CAREER · TRAVEL · CONTACT</div>
</div></body></html>
```

Colors are the literal values of `--oxblood-900`, `--bone-100/400/600`, `--gold-500`, `--oxblood-600` from `app/globals.css`. If those tokens change, change them here too — there's no shared source because the template is not processed by Tailwind/Next.

### 2. The renderer (`scripts/render-og.mjs`)

```js
// Renders the Open Graph card and the apple-touch-icon once; commit the PNGs.
// Run: node scripts/render-og.mjs
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const template = 'file://' + path.join(here, 'og', 'template.html')
const out = path.join(here, '..', 'public')

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
await page.goto(template, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: path.join(out, 'og.png'), clip: { x: 0, y: 0, width: 1200, height: 630 } })

// Touch icon: the DM mark on oxblood, 180×180.
await page.setViewportSize({ width: 180, height: 180 })
await page.setContent(`<body style="margin:0;background:#160000;display:grid;place-items:center;height:180px">
  <div style="width:120px;height:120px;background:#d4a847;color:#160000;font:64px 'Archivo Black',sans-serif;display:grid;place-items:center;letter-spacing:-.04em">DM</div>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap"></body>`)
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: path.join(out, 'apple-touch-icon.png') })
await browser.close()
console.log('wrote public/og.png and public/apple-touch-icon.png')
```

Run it: `node scripts/render-og.mjs`. Open `public/og.png` and check the portrait isn't clipped and the headline fits. If the PNG is over 300 KB, run it through `pngquant` or `cwebp` is **not** an option (OG must be PNG/JPEG) — use `pngquant --quality 70-90`.

### 3. Metadata (`app/layout.tsx`)

```ts
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // ...existing title/description...
  openGraph: {
    title: "Dom Mangonon",
    description: "Building software with AI. Projects, writing, and a travel map.",
    url: SITE_URL,
    siteName: "Dom Mangonon",
    type: "website",
    locale: "en_US",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Dom Mangonon — builds software with AI" }],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@CollapseContext",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = { themeColor: "#160000" };
```

Import `Viewport` from `next` alongside `Metadata`. (`themeColor` in `metadata` is deprecated in Next 15+; it belongs on the `viewport` export.)

### 4. Verify

```bash
npm run build
grep -o '<meta[^>]*og:image[^>]*>' out/index.html
grep -o '<meta[^>]*twitter:card[^>]*>' out/index.html
grep -o '<meta name="theme-color"[^>]*>' out/index.html
```

After deploy: paste https://dommango.github.io into https://www.linkedin.com/post-inspector/ and https://cards-dev.twitter.com/validator (or share in a Slack DM to yourself). Social caches are sticky — use the inspector's "re-scrape" if an old card shows.

## Commit

`feat: Open Graph card, touch icon and theme color`
