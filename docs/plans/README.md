# Site audit — 2026-08-31 — and the plans that come out of it

Audit of https://dommango.github.io (this repo at `cc965be`), done by reading every tracked file, the deployed HTML and JS, the GitHub Actions logs, and the live Substack feed. Two companion artifacts:

- **Audit report (readable version of this page):** https://claude.ai/code/artifact/3e90ee8d-9695-4563-9ea4-894b7fb3fda3
- **Working mock-ups of the top changes, in brand tokens, with the theme cycler:** https://claude.ai/code/artifact/64124f03-8fc4-4cb6-93e7-e2fdf2411a7f

Each numbered plan in this folder is written so a smaller model can execute it without this audit in context: goal, evidence, exact files, code, tests, verification commands, commit message.

## Who the site is for

"Members" of a personal site are its visitors. Four kinds show up here, and the ranking below is by value to them:

| Visitor | Arrives from | Wants |
|---|---|---|
| Hiring manager / senior leader | LinkedIn | Who is this, what has he actually shipped, how do I reach him |
| Fellow builder | X, the Placemat, a Substack post | The how — stack, what broke, code, more writing |
| Reader | a Substack post | More posts, who writes this, a way to subscribe |
| Friend / pool member | Bracketeer, word of mouth | The human side: travel, the fun projects |

## What is broken today (P0)

All four verified on the live site on 2026-08-31, not inferred from code:

| # | Finding | Evidence | Plan |
|---|---|---|---|
| 1 | **Contact form cannot send.** The deploy build receives no `NEXT_PUBLIC_EMAILJS_*` env, so every submission returns "Email service not configured". | Live JS chunk contains that string and no EmailJS service id; `deploy.yml` passes no env to `npm run build`. | 01 |
| 2 | **Writing section never appears.** Substack answers GitHub Actions with 403, the committed `POSTS` is `[]`, so the post published Aug 4 is invisible. | Deploy job log: `[substack] feed returned 403; keeping committed posts`. Live HTML has no `id="writing"`. Feed has 1 real post. | 01 |
| 3 | **Assistant misinforms.** No chat API is configured, so the widget answers with a keyword matcher that points at a "Skills page", an "Education page" and "request Dom's resume through the Contact page". | `lib/services/chat.ts` `getOfflineResponse`; strings present in the live bundle. | 01 (hide), 06 (fix) |
| 4 | **Old URLs dead-end.** `/career`, `/travel`, `/contact`, `/skills`, `/education`, `/blog` render Next's default white 404 with the gold chat bubble on it. | `curl -o /dev/null -w '%{http_code}' https://dommango.github.io/travel` → 404; screenshot in the report. | 07 |

Also P0-adjacent: analytics have never been collected (`NEXT_PUBLIC_GOATCOUNTER_SITE` isn't in the build), so the private dashboard shows zeros and the 6-hourly cron has committed **670 placeholder commits (94% of history)**. Plans 01 and 10.

## Ranked changes

| # | Change | Who it helps | Effort | Value | Plan | Mock-up |
|---|---|---|---|---|---|---|
| 00 | Reconnect the plumbing (secrets → build, commit posts, hide fake chat) | everyone | ½ day | restores conversion | [01](01-reconnect-live-plumbing.md) | — |
| 02 | Project thumbnails + in-page case studies | hiring managers, builders | 1 day | very high | [02](02-project-case-studies.md) | §02 |
| 03 | Writing: featured post, reading time, subscribe form | readers | ½ day | high | [03](03-writing-featured-and-subscribe.md) | §03 |
| 04 | Open Graph card + touch icon + theme color | anyone sharing a link | 1–2 h | high | [04](04-social-preview-card.md) | §04 |
| 05 | "Now" strip: latest post, last shipped, building — dated at build time | anyone deciding to reach out | ½ day | high | [05](05-now-strip.md) | §05 |
| 06 | Honest assistant: rate-limited Worker + Claude, restyled — or remove it | curious visitors, credibility | 1 day / 20 min | high (risk removal) | [06](06-honest-assistant.md) | §06 |
| 07 | Branded 404 that redirects old URLs | anyone on an old link | 1 h | medium–high | [07](07-not-found-rescue.md) | §07 |
| 08 | Contrast tokens, visible focus in High Contrast, reduced motion, mobile nav | low-vision, keyboard, phone users | 2–3 h | medium–high | [08](08-contrast-and-a11y-pass.md) | §08 |
| 09 | Travel year scrubber, touch + keyboard globe, theme-aware map | friends, phone users | ½ day | medium (delight) | [09](09-travel-scrubber-and-touch.md) | §09 |
| 10 | Repo hygiene: commit noise, dead code, lint in CI, theme memory, fonts | maintainers | 2 h | maintainability | [10](10-repo-hygiene.md) | — |

Suggested order: **01 → 07 → 04 → 08 → 02 → 03 → 05 → 06 → 09 → 10.** 01 and 07 fix what's broken; 04 and 08 are cheap and touch tokens the later plans reuse; 02/03/05 are the visible value; 06 needs a decision from Dom (Worker or delete); 09 and 10 whenever.

## Quality findings (P2) — detail in plans 08 and 09

Contrast measured from `app/globals.css` token values:

| Pair | Used for | Ratio | AA (4.5) |
|---|---|---|---|
| white on `--gold-500` | primary button text, "DM" brand mark | 2.21 | fail |
| `--fg-low #7a7060` on `#160000` | 10–11px meta text everywhere | 4.17 | fail |
| `--blood-500` on `#160000` (Oxblood theme) | accent used as 11–14px text | 3.45 | fail |
| `--fg-muted`, gold-on-oxblood, white-on-blood | body, accent text, Oxblood button | 5.9–9.2 | pass |

Plus: High Contrast theme makes focus rings invisible (accent = border = bg = white with `outline: none` on inputs); `L E T ' S  T A L K` is read letter-by-letter; no `prefers-reduced-motion`; nav has no accessible name; mobile nav clips the last link with no scroll affordance; globe is mouse-only (no touch, no keyboard) and hard-codes gold regardless of theme; world atlas loads from a CDN at runtime.

## Hygiene findings (P3) — detail in plan 10

- 2 lint errors (`TravelMap.tsx` React-Compiler memoization; `vitest.setup.ts` `any`) and CI doesn't run lint.
- `IMPROVEMENTS.md` and `ACCESSIBILITY.md` describe files that don't exist (`ErrorBoundary`, `hooks/*`, `app/api/contact`).
- Unused: `public/logos/*` (36 KB), five create-next-app SVGs, ~60 lines of Resume/animation CSS, `@tailwindcss/typography`.
- `fetch-performance.js` tests `/career` (404). `.env.example` is gitignored though README points at it.
- Theme choice isn't persisted; scroll-spy sets state on every scroll event; Geist + Geist Mono are preloaded on the landing but only the dashboard uses them.
- Bundle: ~180 KB gzipped JS on first load; the globe (44 KB gz) is correctly split. Fine — no action beyond the font trim.

## What's good — keep it

- The brutalist token system is a real design decision, scoped cleanly under `.brutalist-root`; three themes work by swapping tokens. The mock-ups reuse it unchanged.
- The Substack fetch is defensive in exactly the right ways (null vs `[]`, marker-bounded rewrite, never fails the build) and has 13 real tests.
- CI runs typecheck, unit, build and Playwright on PRs; e2e already guards the two things that broke before (horizontal overflow, Writing visibility invariant).
- Career content is kept out of the public repo on purpose. Don't undo that.
- Copy is specific and human ("Unapologetically AI-pilled", "mostly still running"). The redesign didn't produce template slop — the unslop scanner flags only the old dashboard/chat radii and the Geist import.

## How to run a plan with a smaller model

1. `git checkout -b feat/<plan-slug> origin/main`
2. Give the model the single plan file and this instruction: *"Execute this plan exactly. Run every command under Verify and paste the output. Stop and report if any step's expectation doesn't match."*
3. Review the diff against the plan's **Done when** list; run `/code-review`; open the PR.

Plans are independent unless their **Depends on** line says otherwise.
