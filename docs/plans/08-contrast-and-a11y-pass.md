# Plan 08 — Contrast, focus, motion and mobile-nav pass

**Priority:** P2 · **Effort:** 2–3 hours · **Value:** medium–high (low-vision readers, phones in daylight, keyboard users)
**Depends on:** nothing; plans 02/03/05/06 use the new tokens if this lands first · **Mock-up:** section 08 of the mock-ups board

## Why — measured, not guessed

WCAG AA needs 4.5:1 for text under ~18px. Ratios computed from the token values in `app/globals.css` (script in step 6 reproduces them):

| Pair | Where it's used | Ratio | AA |
|---|---|---|---|
| `#fff` on `--gold-500 #d4a847` | `.btn-primary` text, `.brand-mark` "DM" (Gold theme) | **2.21** | fail |
| `--bone-600 #7a7060` on `#160000` | `--fg-low`: `.work-year`, `.work-link`, `.hero-portrait-cap`, `.travel-map-cap`, `.footer-legal`, `.binary-rule` — 10–11px | **4.17** | fail |
| `--blood-500 #c8102e` on `#160000` | Oxblood theme accent as text: `.work-impact` 14px, `.hero-kicker-alt` 13px, `.hl-num` 11px, `.avail-cta` 12px, `.nav-link.is-active` 12px | **3.45** | fail |
| `#fff` on `--blood-500` | `.btn-primary` (Oxblood) | 5.88 | pass |
| `--bone-400 #b8ab94` on `#160000` | `--fg-muted` | 8.98 | pass |
| `--gold-500` on `#160000` | Gold accent as text | 9.18 | pass |

Other findings in the same area:

- **High Contrast theme hides focus.** `--accent`, `--border-strong`, `--rule` and `--fg` all become `#fff`; inputs use `outline: none` with a border-color change on focus — which is white → white. Keyboard users can't see where they are in the mode built for them.
- `.contact-tracked` renders `L E T ' S   T A L K` as text. Screen readers read it letter by letter. It's decorative.
- No `prefers-reduced-motion` handling: `.avail-dot::after` pulses forever; `.work-card:hover` translates; `scroll-behavior: smooth` via `scrollIntoView`.
- `<nav>` has no accessible name; no skip link.
- Mobile nav (`≤900px`) scrolls horizontally with the scrollbar hidden and no affordance — the last link is cut mid-word ("CO"). The availability strip wraps into three lines.
- `.travel-map-frame` tooltip uses Tailwind `bg-gray-900 border-yellow-600` — yellow in Oxblood/HC themes (plan 09 fixes that; listed here for completeness).

## Done when

- [ ] `__tests__/contrast.test.ts` passes: every listed pair ≥ 4.5.
- [ ] Focus is visible on every focusable element in all three themes (tab through the page).
- [ ] `L E T ' S  T A L K` is `aria-hidden`.
- [ ] With "reduce motion" on (DevTools → Rendering), nothing pulses or lifts and section navigation jumps instantly.
- [ ] Mobile nav shows a fade at the trailing edge and an arrow while more links are off-screen.
- [ ] Existing e2e (no horizontal overflow at 320–1440) still passes.

## Files

- `app/globals.css` — tokens, focus, motion, nav
- `components/landing/Contact.tsx` — `aria-hidden` on the tracked line
- `components/landing/Nav.tsx` — `aria-label`, skip link target
- `components/landing/BrutalistLanding.tsx` — skip link, reduced-motion scroll
- `__tests__/contrast.test.ts`, `lib/format/contrast.ts` — new

## Steps

### 1. Tokens (`app/globals.css`, in `.brutalist-root`)

```css
  --bone-500: #948872;            /* new: 5.83:1 on --bg */
  --fg-low: var(--bone-500);      /* was --bone-600 (4.17:1) */

  --accent: var(--blood-500);
  --accent-text: var(--blood-400); /* new: accent usable for small text. 4.98:1 */
  --fg-inverse: var(--oxblood-900);
  --btn-fg: var(--ink-000);        /* new: text on an accent-filled surface */
```

Gold variant:

```css
.brutalist-root[data-accent="gold"] {
  --accent: var(--gold-500);
  --accent-text: var(--gold-500);   /* 9.18:1 — fine as text */
  --accent-hover: var(--gold-400);
  --accent-press: var(--gold-700);
  --btn-fg: var(--oxblood-900);     /* 9.18:1 instead of white's 2.21:1 */
}
```

High contrast:

```css
.brutalist-root[data-contrast="high"] {
  /* existing lines … */
  --accent-text: var(--ink-000);
  --btn-fg: var(--ink-999);
}
```

Keep `--bone-600` defined (the OG template and nothing else references it now) — or delete it if `grep -n "bone-600" app/globals.css` shows only the definition.

### 2. Use `--accent-text` wherever the accent is text at ≤ 16px

Search-and-replace `color: var(--accent)` → `color: var(--accent-text)` on exactly these selectors: `.nav-link:hover`, `.nav-link.is-active`, `.contrast-toggle:hover`, `.avail-cta`, `.binary-rule.is-accent`, `.hero-title-alt` (display size — optional, but consistent), `.hero-kicker-alt`, `.hl-num`, `.work-impact`, `.work-points li::before`, `.work-card:hover .work-name`, `.work-card.is-linked:focus-visible .work-name`, `.work-card.is-linked:hover .work-link`, `.writing-all:hover`, `.contact-tracked`, `.contact-email:hover`, `.contact-socials a:hover`, `.footer-socials a:hover`, `.travel-map-toggle:hover`, `.travel-map-toggle.is-active`, `.resume-sent`, `.btn-text:hover`. Leave `background: var(--accent)`, `border-color: var(--accent)` and `.continent-fill` alone — fills keep the saturated hue.

Buttons and the brand mark:

```css
.brand-mark { background: var(--accent); color: var(--btn-fg); }
.btn-primary { background: var(--accent); color: var(--btn-fg); }
.brutalist-root[data-accent="gold"] .btn-primary:hover { background: var(--gold-400); }   /* keep */
```

Delete the `[data-contrast="high"] .btn-primary { color: #000 }` override — `--btn-fg` handles it now.

### 3. Focus that survives High Contrast

Add once, near the top of the `.brutalist-root` styles:

```css
.brutalist-root :focus-visible { outline: var(--bw-2) solid var(--accent); outline-offset: 3px; }
.brutalist-root[data-contrast="high"] :focus-visible { outline: 3px solid #fff; outline-offset: 3px; box-shadow: 0 0 0 6px #000; }
.field input:focus-visible, .field textarea:focus-visible { outline-offset: 6px; border-bottom-width: 2px; }
```

Remove `outline: none;` from `.field input, .field textarea`. Remove the per-component `:focus-visible` rules that only restate this (`.work-card.is-linked:focus-visible` may stay — it also sets `border-color`).

### 4. Motion and semantics

```css
@media (prefers-reduced-motion: reduce) {
  .brutalist-root *, .brutalist-root *::before, .brutalist-root *::after {
    animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important;
  }
  .work-card:hover { transform: none; }
  .btn-primary:hover { transform: none; }
}
```

`BrutalistLanding.tsx` → `scrollToSection`:

```ts
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
```

`Contact.tsx`: `<div className="contact-tracked" aria-hidden="true">L E T ' S …</div>`.

`Nav.tsx`: `<nav className="site-nav" aria-label="Main">`. Add a skip link as the first child of `.page` in `BrutalistLanding.tsx`:

```tsx
<a className="skip-link" href="#projects">Skip to projects</a>
```

```css
.skip-link { position: absolute; left: -9999px; top: 8px; z-index: 60; padding: 8px 12px; background: var(--accent); color: var(--btn-fg); font-family: var(--font-mono); font-size: 12px; letter-spacing: .12em; text-transform: uppercase; }
.skip-link:focus { left: var(--gutter); }
```

Give `main` an `id="main"` if you'd rather target that; `#projects` is where visitors want to be.

### 5. Mobile nav affordance and availability strip (in the `@media (max-width: 900px)` block)

```css
  .nav-links {
    /* existing overflow rules … */
    -webkit-mask-image: linear-gradient(to right, #000 82%, transparent);
    mask-image: linear-gradient(to right, #000 82%, transparent);
    padding-right: 32px;
  }
  .nav-links.is-scrolled-end { -webkit-mask-image: none; mask-image: none; }
  .site-nav { position: relative; }
  .site-nav::after { content: "→"; position: absolute; right: 0; bottom: 10px; font-family: var(--font-mono); font-size: 12px; color: var(--accent-text); pointer-events: none; }
  .site-nav.is-scrolled-end::after { display: none; }
  .availability { gap: 10px; }
  .availability > span:nth-child(2) { display: none; }   /* drop "New York metropolitan area." on phones; keep it in the Now strip (plan 05) */
```

In `Nav.tsx`, add a scroll listener on `.nav-links` that toggles `is-scrolled-end` on the nav when `scrollLeft + clientWidth >= scrollWidth - 2`. Five lines in a `useEffect` with a ref; make `Nav` a client component (it already receives handlers from one).

### 6. Test the tokens

`lib/format/contrast.ts`:

```ts
const lin = (c: number) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4 }
const lum = (hex: string) => { const h = hex.replace('#', ''); const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) }
export const contrastRatio = (a: string, b: string): number => { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05) }
```

`__tests__/contrast.test.ts` reads `app/globals.css`, pulls hex values with a regex per token name, and asserts:

```ts
import { readFileSync } from 'node:fs'
import { contrastRatio } from '../lib/format/contrast'

const css = readFileSync('app/globals.css', 'utf8')
const token = (name: string) => css.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, 'i'))![1]

const BG = token('oxblood-900')
const pairs: Array<[string, string, string]> = [
  ['fg-low on bg', token('bone-500'), BG],
  ['fg-muted on bg', token('bone-400'), BG],
  ['gold accent text on bg', token('gold-500'), BG],
  ['oxblood accent text on bg', token('blood-400'), BG],
  ['button text on gold', token('oxblood-900'), token('gold-500')],
  ['button text on blood', '#ffffff', token('blood-500')],
]

describe('brand token contrast (WCAG AA, 4.5:1)', () => {
  it.each(pairs)('%s', (_, fg, bg) => { expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5) })
})
```

This is the guard that stops a future "let's make the meta text a bit dimmer" from quietly failing AA.

## Verify

```bash
npm test -- --run && npx tsc --noEmit && npm run lint && npm run build && npx playwright test
```

Manual: keyboard-tab the whole page in each theme; enable reduced motion in DevTools; open at 390px and scroll the nav.

## Commit

`fix: AA contrast tokens, visible focus in high contrast, reduced motion, mobile nav affordance`
