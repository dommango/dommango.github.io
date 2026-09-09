# Case study copy — working draft

Scratch file for iterating on Plan 02 content before it goes into `lib/content/projects.ts`.
Not shipped, not linked from the site. Edit freely; I'll re-read this file to pick up changes.

## Standard (for reference — edit here too if it should change)

- Direct, evidence-led, active voice, concrete verbs, short paragraphs (~60 words max)
- No generic pleasantries, corporate filler, inflated praise, unsupported certainty, hidden ownership, or em dashes
- Own it explicitly — "I built," "I decided," not passive constructions
- No superlative without a fact under it
- Sections from: Problem → What I built → What broke → Outcome. 2–4 per project, skip one if there's nothing real to say
- Facts strip: only what's confirmed right now — unknowns get omitted, never estimated

---

## 1. Bracketeer — PILOT

**Headline**
Made an app for the 2026 FIFA World Cup...three days before kickoff...with everyone's picks already made.

**Problem**
A buddy's pool started as one HTML file: fill in a bracket, export picks as a CSV, email it to the commissioner. Forty-some friends and family did exactly that before the opening match. The plan was to re-enter results by hand after each round.

Three days before kickoff, I decided that wasn't good enough. That set the first constraint before the first commit: every pick already existed, made in a tool I now had to treat as law.

**What I built**
A multi-tenant pool platform on Next 16, Prisma 7, and Auth.js, deployed to Railway. Create a pool, invite by link, make picks, watch a leaderboard update from live results. Knockout seeding implements FIFA Annex C.

The first piece I built wasn't a feature. It was a test: I kept the original scoring function verbatim as an oracle and ran the new engine against it across two thousand randomized brackets.

**What broke**
<!-- NOTE: original draft used an em dash here ("It was building fast without ever changing an answer — one point off..."). Rewritten as two sentences below per the no-em-dash rule. Keep this version, or was the rule meant for exec comms only? -->
The hard problem wasn't building fast. It was building fast without ever changing an answer. One point off on one bracket, and someone's standing changes under them.

The oracle test never left the codebase. Every refactor for six weeks had to walk past it.

**Outcome**
The pool ran on the app from the round of 32 through the final. Nobody's score moved during the migration.

**Facts**
- Status: Concluded · account required to view
- Players: 40+ in one pool
- Built in: 3 days to launch
- Source: Public — github.com/dommango/bracketeer

**Links**
- Read the build story ↗ — https://dommangonon.substack.com/p/the-game-had-already-started
- Open live ↗ — https://fifawc26.up.railway.app

**Image**
- BLOCKED on you: real screenshot of the leaderboard mid-tournament (not the pick sheet the old mock-up used)

---

## 2. SousIQ — LIVE

**Headline**
A pilot bakery's real invoices, and a bug that looked exactly like a broken AI parser.

**Problem**
Restaurant operators buy from a handful of vendors on prices that shift often, tracked mostly in spreadsheets and inboxes. Catching a price hike, or a vendor billing above its own quoted price, means matching every invoice line against what's already on file. It's tedious enough that most operators don't do it.

**What I built**
A parsing and matching pipeline on Express, Postgres with pgvector, and Claude, deployed on Railway. Upload an invoice or bid sheet: OCR and a Claude vision pass read it, then a tiered matcher checks SKU, exact name, fuzzy name, vector embedding, and purchase history against the restaurant's own catalog. Above 85% confidence it auto-approves; below 70%, a person reviews it.

I decided the match had to be provably right, not just plausible. Get it wrong, and the tool's whole reason for existing (showing an operator where they're overpaying) stops working.

**What broke**
Migration 041 added the table that stores agent-parse jobs but missed a permission grant for the tenant role. Every image-based upload started failing "permission denied" at the database, and from the user's side it looked like a network error. The fix landed two weeks later. The bug had nothing to do with the parser, and looked exactly like it did.

Delete a vendor, a recipe, a bid sheet, and it kept reappearing in the list. The mutation hooks invalidated the cache on success instead of updating it right away, so a fast refetch could still catch the old row before the delete landed. I rewrote every delete hook to update state immediately and roll back on failure.

**Outcome**
The pipeline ran against a real bakery's invoices for two months. Coverage was the real constraint: of about 700 purchase lines in one month, fewer than 40 had a competing quote to check against. A same-vendor check instead, catching a vendor billing above its own listed price, needed no competitor data and held up as the steadier signal.

**Facts**
- Status: Live · field-tested in a working bakery
- Pilot: Real vendor invoices, two months, Jul-Aug 2026
- Built in: Active development since March 2026
- Source: Private

**Links**
- Open live ↗ — https://sousiq-production.up.railway.app

**Image**
- BLOCKED on you: real screenshot of the matching review screen or the price-gap view

---

## 3. Claude Code Placemat — LIVE

**Headline**
Claude Code ships most days. The reference page has to keep up without me.

**Problem**
Claude Code's feature set changes fast enough that a hand-maintained reference goes stale within days. I started from reference material curated by AI Edge and built a one-page HTML sheet: shortcuts, slash commands, flags, hooks, MCP. A static page is only accurate on the day you write it.

**What I built**
A scheduled Claude Code agent, not a GitHub Actions cron, runs daily at 9am UTC. It reads the version documented on the page, fetches the official changelog, and exits silently if nothing changed. When something changed, it categorizes the update, edits the page, tags new entries, demotes anything three releases old, and opens a PR.

104 of the repo's 116 pull requests are these automated syncs, and the agent merges every one of them itself: no review step, no human in the loop for the routine case.

**What broke**
The automation had a rule to demote entries after three releases, but no matching rule to promote them once confirmed. Nothing catches that before it ships: /plan and /fast sat marked "unverified" live on the page for roughly twenty-five releases before I noticed. The fix added a check that runs the comparison on every pass, not just when an item is first added.

Two days after the first commit, the automation also bumped the wrong version: its own template number, not the Claude Code release it was tracking. I noticed it live on the page and reverted it before it compounded. A separate attempt to poll an X account for faster updates got built out in full and never shipped; daily turned out to be fast enough.

**Outcome**
It has run since March 2026: about five months of daily checks, 116 pull requests total, 104 of them opened and merged by the agent with no human step in between. The reference page has never gone stale long enough for anyone to notice.

**Facts**
- Status: Live · self-updating · MIT
- Cadence: Daily checks since March 2026
- Pull requests: 116 total, 104 auto-generated
- Source: Public

**Links**
- Open live ↗ — https://dommango.github.io/claude-code-placemat/
- Source ↗ — https://github.com/dommango/claude-code-placemat

**Image**
- BLOCKED on you: screenshot of the reference page itself

---

## 4. modular-mind — TODO (blocked on facts beyond `points`)

## 5. PRIAL Pipeline — TODO (blocked on facts beyond `points`, no image — data tile only)
