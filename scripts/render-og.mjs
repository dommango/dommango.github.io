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
