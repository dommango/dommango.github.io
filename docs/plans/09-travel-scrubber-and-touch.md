# Plan 09 — Travel: year scrubber, touch + keyboard on the globe, theme-aware map

**Priority:** P2 (delight) · **Effort:** ~half a day · **Value:** medium; the one section friends and family come for
**Depends on:** nothing · **Mock-up:** section 09 of the mock-ups board

## Why

- `TravelMap` already accepts `selectedYear` and filters `displayedCountries` by it — nothing passes it. A scrubber turns 52 static countries into a story (first trip 1986, the BNP-era Europe run, the 2023–24 burst).
- The globe rotates with `onMouseDown/Move/Up` only. On phones you can't rotate it at all; keyboard users can't either. The hint says "drag to rotate" regardless.
- Colors are hard-coded (`#b8922f`, `#2a2a2a`, sphere `#0a0f1a`) and the tooltip uses Tailwind classes (`bg-gray-900 border-yellow-600`). Oxblood and High Contrast themes show a gold globe with a yellow tooltip.
- The world atlas TopoJSON loads at runtime from `cdn.jsdelivr.net`. If that CDN hiccups the globe is blank; the site otherwise has no runtime third-party dependency.

## Done when

- [ ] A range input (1986–2024) under the continent bars; bars, counts, the "N countries. M continents." heading and the globe all follow it. A Play button animates through the years; Stop halts it.
- [ ] Touch drag rotates the globe (`pointer` events + `touch-action: none`); arrow keys rotate it when focused; the hint reads "drag or use arrow keys".
- [ ] Map colors come from CSS tokens; tooltip uses site classes. All three themes look right.
- [ ] `countries-110m.json` is served from `public/data/world-110m.json` (no CDN).
- [ ] `buildContinentBars` lives in `lib/content/travel.ts` and has unit tests.
- [ ] Existing travel e2e updated and passing.

## Files

- `lib/content/travel.ts` — move `buildContinentBars` here; add `countriesUpTo(year)`
- `app/page.tsx` — stop precomputing bars; pass raw countries
- `components/landing/Travel.tsx` — year state, scrubber, play, recompute bars
- `components/travel/TravelMap.tsx` — pointer events, keyboard, tokens, local atlas
- `app/globals.css` — `.scrub*`, tooltip, map tokens
- `public/data/world-110m.json` — new (copied from the CDN once)
- `__tests__/travel-transforms.test.ts` — new
- `e2e/travel.spec.ts` — update color assertions

## Steps

### 1. Transforms + tests (`lib/content/travel.ts`)

```ts
export interface ContinentBar { name: string; count: number; pct: number }

/** Continent bars for the countries first visited on or before `year`. */
export function buildContinentBars(countries: Country[], year?: number): ContinentBar[] {
  const visible = year ? countries.filter((c) => c.firstVisited <= year) : countries
  const counts = visible.reduce<Record<string, number>>((acc, c) => ({ ...acc, [c.continent]: (acc[c.continent] ?? 0) + 1 }), {})
  const entries = Object.entries(counts).sort(([, a], [, b]) => b - a)
  const max = entries.length > 0 ? entries[0][1] : 1
  return entries.map(([name, count]) => ({ name, count, pct: Math.round((count / max) * 100) }))
}

export const yearBounds = (countries: Country[]): [number, number] => {
  const years = countries.map((c) => c.firstVisited)
  return [Math.min(...years), Math.max(...years)]
}
```

Delete `buildContinentBars` from `app/page.tsx`; pass `countries` only (the `Travel` component computes bars). Remove the `ContinentBar` import there.

Tests (`__tests__/travel-transforms.test.ts`) with a 5-country fixture: bars sorted by count desc; `pct` is relative to the largest continent; `year` filter excludes later countries; a year before the first trip returns `[]`; `yearBounds` returns min/max.

### 2. Scrubber in `Travel.tsx`

```tsx
const [min, max] = yearBounds(countries)
const [year, setYear] = useState(max)
const [playing, setPlaying] = useState(false)
const bars = buildContinentBars(countries, year)
const visible = countries.filter((c) => c.firstVisited <= year)
const continentsVisible = new Set(visible.map((c) => c.continent)).size
const newThisYear = countries.filter((c) => c.firstVisited === year)

useEffect(() => {
  if (!playing) return
  if (year >= max) { setPlaying(false); return }
  const id = setTimeout(() => setYear((y) => y + 1), 260)
  return () => clearTimeout(id)
}, [playing, year, max])
```

Heading becomes `{visible.length}{year === max ? '+' : ''} countries. / {continentsVisible} continents.` Render the scrubber panel in place of (or below) the current `travel-highlights` aside:

```tsx
<div className="scrub">
  <span className="ds-eyebrow">Scrub the years</span>
  <div className="scrub-year" aria-live="polite">{year}</div>
  <input type="range" min={min} max={max} step={1} value={year}
    onChange={(e) => { setPlaying(false); setYear(Number(e.target.value)) }}
    aria-label="Show countries first visited up to this year" />
  <div className="scrub-row">
    <button type="button" className="travel-map-toggle" onClick={() => { if (year >= max) setYear(min - 1); setPlaying((p) => !p) }}>
      {playing ? '■ Stop' : '▶ Play'}
    </button>
    <span className="scrub-stat"><b>{visible.length}</b> countries · <b>{continentsVisible}</b> continents · by {year}</span>
  </div>
  <div className="scrub-new">
    {newThisYear.length > 0
      ? newThisYear.map((c) => <span key={c.id} className="scrub-chip">{c.name}</span>)
      : <span className="scrub-chip is-muted">none that year</span>}
  </div>
</div>
```

Pass `selectedYear={year}` to `<TravelMap … />`. Keep `HIGHLIGHTS` as a small list under the scrubber or drop it — Dom's call; the mock-up drops it.

CSS:

```css
.scrub { border: 1px solid var(--rule); padding: var(--s-5); display: flex; flex-direction: column; gap: var(--s-4); }
.scrub-year { font-family: var(--font-display); font-size: 64px; line-height: .9; letter-spacing: -.04em; color: var(--accent); }
.scrub input[type=range] { width: 100%; accent-color: var(--accent); }
.scrub-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.scrub-stat { font-family: var(--font-mono); font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: var(--fg-muted); }
.scrub-stat b { color: var(--fg); font-weight: 500; }
.scrub-new { display: flex; flex-wrap: wrap; gap: 6px; }
.scrub-chip { font-family: var(--font-mono); font-size: 10px; letter-spacing: .08em; padding: 4px 8px; border: 1px solid var(--accent); color: var(--accent); }
.scrub-chip.is-muted { border-color: var(--rule); color: var(--fg-low); }
```

### 3. Pointer + keyboard on the globe (`TravelMap.tsx`)

Replace the three mouse handlers with pointer handlers (they cover mouse, touch, pen):

```tsx
onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); handleMouseDown(e) }}
onPointerMove={handleMouseMove}
onPointerUp={handleMouseUp}
onPointerCancel={handleMouseUp}
onPointerLeave={() => { hideTooltip(); handleMouseUp() }}
style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
tabIndex={0}
role="img"
aria-label={`Globe showing ${displayedCountries.length} visited countries. Drag or use the arrow keys to rotate.`}
onKeyDown={(e) => {
  const step = 10
  const [lon, lat] = rotation
  if (e.key === 'ArrowLeft') setRotation([lon - step, lat, 0])
  else if (e.key === 'ArrowRight') setRotation([lon + step, lat, 0])
  else if (e.key === 'ArrowUp') setRotation([lon, Math.max(-90, lat - step), 0])
  else if (e.key === 'ArrowDown') setRotation([lon, Math.min(90, lat + step), 0])
  else return
  e.preventDefault()
}}
```

The handler signatures change from `React.MouseEvent` to `React.PointerEvent` — `clientX/Y` are the same. While you're here, fix the two lint errors in this file: drop `useCallback` from `showCountryTooltip` (its dependency is recomputed every render anyway) or include `isoToCountryMap` in its deps. Change the hint in `Travel.tsx` to "The map · drag or use arrow keys".

### 4. Theme-aware colors and tooltip

Add tokens in `.brutalist-root`:

```css
  --map-sphere: var(--oxblood-1000);
  --map-land: #2a2a2a;
  --map-land-hover: #3a3a3a;
  --map-visited: var(--accent-press);
  --map-visited-hover: var(--accent);
  --map-stroke: #1a1a1a;
```

and in `[data-contrast="high"]`: `--map-land: #333; --map-visited: #fff; --map-visited-hover: #ddd; --map-stroke: #000;`.

In `TravelMap.tsx` use `style={{ fill: 'var(--map-visited)' }}` etc. instead of `fill="#b8922f"` (react-simple-maps passes `style` through to the `<path>`; the `default/hover/pressed` style objects accept CSS vars). Sphere: `style={{ fill: 'var(--map-sphere)' }}`. Flight lines: `stroke="var(--accent)"` with `strokeOpacity={0.6}`. Airport markers: `fill: 'var(--accent)'`.

Add `data-visited="true"` / `"false"` to each `<Geography>` so tests don't depend on colors.

Tooltip: replace the Tailwind classes with `className="map-tip"`:

```css
.map-tip { position: fixed; z-index: 60; background: var(--bg-elevated); border: 1px solid var(--accent); padding: 6px 10px; pointer-events: none; font-family: var(--font-mono); font-size: 12px; color: var(--fg); }
.map-tip small { display: block; color: var(--fg-muted); font-size: 11px; }
```

Also drop `className="relative w-full bg-surface-1 rounded-xl border border-border overflow-hidden"` on the container in favour of `className="map-frame"` with `position: relative; width: 100%; overflow: hidden;` — the `.travel-map-frame :where(.relative)` override in globals.css then becomes dead and can go.

### 5. Local atlas

```bash
curl -sL https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json -o public/data/world-110m.json
```

`const geoUrl = '/data/world-110m.json'`. ~110 KB, cached by GitHub Pages like everything else.

### 6. e2e updates (`e2e/travel.spec.ts`)

Replace the `fill === "#b8922f"` / `"#2a2a2a"` checks with `[data-visited="true"]` / `[data-visited="false"]` counts. Add:

```ts
  test("year scrubber filters the map and the bars", async ({ page }) => {
    const slider = page.getByRole("slider", { name: /countries first visited/i });
    await slider.fill("2000");
    await expect(page.locator("#travel .scrub-year")).toHaveText("2000");
    const visited = await page.locator('path[data-visited="true"]').count();
    expect(visited).toBeGreaterThan(0);
    expect(visited).toBeLessThan(20);
  });

  test("globe rotates with the keyboard", async ({ page }) => {
    const globe = page.getByRole("img", { name: /globe showing/i });
    await globe.focus();
    const before = await page.locator("#travel svg path").first().getAttribute("d");
    await page.keyboard.press("ArrowRight");
    await expect.poll(() => page.locator("#travel svg path").first().getAttribute("d")).not.toBe(before);
  });
```

## Verify

```bash
npm test -- --run && npx tsc --noEmit && npm run lint && npm run build && npx playwright test e2e/travel.spec.ts
```

Manual on a phone (or DevTools touch emulation): drag the globe; press Play; cycle themes.

## Commit

`feat: travel year scrubber, touch and keyboard rotation, theme-aware globe`
