# Plan 06 — An honest assistant (or none)

**Priority:** P1 · **Effort:** ~1 day for path A, ~20 minutes for path B · **Value:** high — removes the one thing on the page that actively misinforms
**Depends on:** plan 01 step 6 (stopgap hides the widget) · **Mock-up:** section 06 of the mock-ups board

## Why

`components/chat/ChatBot.tsx` presents itself as "Dom's AI assistant". With `NEXT_PUBLIC_CHAT_API_URL` unset (it is, on the live site) every answer comes from `getOfflineResponse()` in `lib/services/chat.ts` — a keyword matcher that tells visitors to "visit the Skills page", "check the Education page" and "request Dom's resume through the Contact page". None of those exist. The widget is also styled with the pre-redesign Tailwind tokens (rounded-2xl, `bg-accent-gold`, gray bubbles) and floats over the brutalist page like a leftover.

Two honest options. **Pick one; do not leave the current state.**

- **Path A — make it real.** A ~60-line Cloudflare Worker holds the API key, rate-limits per IP, and calls Claude with the brief that already exists (`DOM_CONTEXT`). The widget is restyled in the site's tokens and says plainly what it can and cannot see. Cost is capped by the rate limit.
- **Path B — remove it.** Delete the widget and the service. Twenty minutes, zero risk.

If Dom doesn't want to run a Worker, do path B. A site whose thesis is "Unapologetically AI-pilled" is better off with no assistant than a fake one.

## Done when (path A)

- [ ] `NEXT_PUBLIC_CHAT_API_URL` set in the deploy build env → widget renders; unset → nothing renders (no offline mode remains in the code).
- [ ] Worker rejects origins other than `https://dommango.github.io` (and `http://localhost:3000` in dev), enforces 20 requests / IP / hour, truncates input to 500 chars, caps history to 6 turns, `max_tokens: 300`.
- [ ] The widget uses only `.brutalist-root` tokens; square corners; visible focus; `prefers-reduced-motion` honoured; honest sub-label.
- [ ] Four suggested-question chips; Enter sends; errors are plain sentences.
- [ ] `lib/services/chat.ts` no longer contains `getOfflineResponse` or the page names.

## Done when (path B)

- [ ] `components/chat/`, `lib/services/chat.ts` deleted; `<ChatBot />` removed from `app/layout.tsx`; `clsx` stays (dashboard uses it).
- [ ] `grep -rn "Skills page\|Education page" .` returns nothing outside `docs/`.

---

## Path A

### A1. Worker (`worker/src/index.js`, new directory at repo root)

Create the project:

```bash
mkdir -p worker && cd worker && npm init -y && npm i -D wrangler && npm i @anthropic-ai/sdk
```

`worker/wrangler.toml`:

```toml
name = "dommango-site-assistant"
main = "src/index.js"
compatibility_date = "2026-08-01"
compatibility_flags = ["nodejs_compat"]

[[kv_namespaces]]
binding = "RATE"
id = "<create with: npx wrangler kv namespace create RATE>"

[vars]
ALLOWED_ORIGINS = "https://dommango.github.io,http://localhost:3000"
MODEL = "claude-opus-5"
```

`worker/src/index.js`:

```js
import Anthropic from '@anthropic-ai/sdk'
import { SITE_BRIEF } from './brief.js'

const LIMIT_PER_HOUR = 20
const MAX_TURNS = 6
const MAX_CHARS = 500

const cors = (origin, allowed) => ({
  'access-control-allow-origin': allowed.includes(origin) ? origin : allowed[0],
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
  'content-type': 'application/json',
})

export default {
  async fetch(request, env) {
    const allowed = env.ALLOWED_ORIGINS.split(',')
    const origin = request.headers.get('origin') || ''
    const headers = cors(origin, allowed)

    if (request.method === 'OPTIONS') return new Response(null, { headers })
    if (request.method !== 'POST') return new Response('{"error":"POST only"}', { status: 405, headers })
    if (!allowed.includes(origin)) return new Response('{"error":"origin not allowed"}', { status: 403, headers })

    // Per-IP hourly counter in KV. Key rolls over each hour, so no cleanup needed.
    const ip = request.headers.get('cf-connecting-ip') || 'unknown'
    const hour = Math.floor(Date.now() / 3_600_000)
    const key = `${ip}:${hour}`
    const used = Number((await env.RATE.get(key)) || 0)
    if (used >= LIMIT_PER_HOUR) {
      return new Response('{"error":"That is enough questions for one hour — the Contact form is always open."}', { status: 429, headers })
    }
    await env.RATE.put(key, String(used + 1), { expirationTtl: 3600 })

    let body
    try { body = await request.json() } catch { return new Response('{"error":"bad json"}', { status: 400, headers }) }
    const messages = (Array.isArray(body.messages) ? body.messages : [])
      .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-MAX_TURNS)
      .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }))
    if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
      return new Response('{"error":"send at least one user message"}', { status: 400, headers })
    }

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
    try {
      const response = await client.messages.create({
        model: env.MODEL,
        max_tokens: 300,
        output_config: { effort: 'low' },
        system: [{ type: 'text', text: SITE_BRIEF, cache_control: { type: 'ephemeral' } }],
        messages,
      })
      if (response.stop_reason === 'refusal') {
        return new Response(JSON.stringify({ message: "I can't help with that one. The Contact form goes straight to Dom." }), { headers })
      }
      const text = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('')
      return new Response(JSON.stringify({ message: text }), { headers })
    } catch (error) {
      if (error instanceof Anthropic.RateLimitError) {
        return new Response('{"error":"Busy right now — try again in a minute."}', { status: 503, headers })
      }
      console.error('assistant error', error)
      return new Response('{"error":"Something went wrong on my side. The Contact form still works."}', { status: 500, headers })
    }
  },
}
```

Notes for whoever implements this:
- `claude-opus-5` at `effort: 'low'` is the default the Claude API guidance recommends; if Dom prefers the cheapest option, set `MODEL = "claude-haiku-4-5"` and **remove** the `output_config` line (Haiku 4.5 rejects `effort`).
- `cache_control` on the system block means the brief is billed at the cached rate after the first request in a 5-minute window.
- Move `DOM_CONTEXT` from `lib/services/chat.ts` into `worker/src/brief.js` as `export const SITE_BRIEF = \`...\``. Update its "Response Guidelines" to add: "You only know what is in this brief. If asked about anything else, say so and point to the Contact section." Delete the "Career page/Skills page" remnants — they are only in `getOfflineResponse`, which is deleted.
- Secrets: `cd worker && npx wrangler secret put ANTHROPIC_API_KEY` (paste at the prompt; never in a file or chat). Deploy: `npx wrangler deploy`. The URL it prints is `NEXT_PUBLIC_CHAT_API_URL`.
- Add `NEXT_PUBLIC_CHAT_API_URL` to the deploy build env (plan 01's block) and to `.env.local` for dev.

### A2. Frontend (`components/chat/ChatBot.tsx` rewrite)

Replace the Tailwind-styled component with one built on the site's classes. Keep the message state logic; change:

- Delete `getOfflineResponse` and the `if (!apiUrl)` branch in `lib/services/chat.ts`. `sendChatMessage` sends `{ messages }` only (no system prompt from the client). Handle `429`/`503` by surfacing the server's `error` string.
- Markup:

```tsx
<>
  <button type="button" className="chat-fab" onClick={() => setIsOpen(true)} aria-label="Ask about the work">Ask</button>
  {isOpen && (
    <div className="chat" role="dialog" aria-label="Ask about the work">
      <div className="chat-head">
        <div>
          <strong>Ask about the work</strong>
          <small>Answers come from a short brief Dom wrote for it. It can't see your data, the web, or anything not on this page.</small>
        </div>
        <button type="button" className="chat-x" onClick={() => setIsOpen(false)} aria-label="Close">×</button>
      </div>
      <div className="chat-log" role="log" aria-live="polite">{/* messages */}</div>
      {messages.length === 1 && (
        <div className="chat-chips">
          {SUGGESTED.map((q) => <button key={q} type="button" onClick={() => send(q)}>{q}</button>)}
        </div>
      )}
      <form className="chat-in" onSubmit={handleSubmit}>
        <input ref={inputRef} value={input} onChange={…} placeholder="Ask a question" aria-label="Your question" disabled={isLoading} />
        <button type="submit" disabled={isLoading || !input.trim()}>Send</button>
      </form>
    </div>
  )}
</>
```

```ts
const SUGGESTED = ['What is SousIQ?', 'How does Bracketeer score?', 'Is Dom open to roles?', 'What is this site built with?']
```

Put the widget **inside** `.brutalist-root` so it inherits tokens: render `<ChatBot />` from `BrutalistLanding.tsx` (after `<Footer />`) instead of `app/layout.tsx`, gated on `process.env.NEXT_PUBLIC_CHAT_API_URL`. The dashboard doesn't need it.

- CSS (`app/globals.css`, new block before Responsive):

```css
.chat-fab { position: fixed; right: 24px; bottom: 24px; z-index: 40; width: 52px; height: 52px; background: var(--accent); color: var(--fg-inverse); border: 0; box-shadow: 4px 4px 0 0 var(--accent-press); font-family: var(--font-mono); font-size: 11px; letter-spacing: .1em; text-transform: uppercase; cursor: pointer; }
.chat { position: fixed; right: 24px; bottom: 24px; z-index: 50; width: min(420px, calc(100vw - 32px)); height: min(520px, calc(100vh - 48px)); background: var(--bg); border: 1px solid var(--accent); display: flex; flex-direction: column; }
.chat-head { padding: 12px 14px; border-bottom: 1px solid var(--rule); display: flex; justify-content: space-between; gap: 10px; align-items: flex-start; }
.chat-head strong { font-family: var(--font-mono); font-size: 11px; letter-spacing: .16em; text-transform: uppercase; display: block; }
.chat-head small { display: block; font-size: 11.5px; color: var(--fg-muted); margin-top: 3px; line-height: 1.35; }
.chat-x { background: none; border: 1px solid var(--rule); color: var(--fg); width: 28px; height: 28px; cursor: pointer; }
.chat-log { flex: 1; overflow: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
.chat-msg { max-width: 88%; padding: 9px 12px; font-size: 13.5px; line-height: 1.45; border: 1px solid var(--rule); }
.chat-msg.is-assistant { align-self: flex-start; border-left: 2px solid var(--accent); }
.chat-msg.is-user { align-self: flex-end; background: var(--bg-elevated); }
.chat-chips { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 14px 10px; }
.chat-chips button { background: transparent; border: 1px solid var(--rule); color: var(--fg-muted); font-family: var(--font-mono); font-size: 10px; letter-spacing: .08em; padding: 5px 9px; cursor: pointer; }
.chat-chips button:hover { border-color: var(--accent); color: var(--accent); }
.chat-in { display: flex; border-top: 1px solid var(--rule); }
.chat-in input { flex: 1; min-width: 0; background: transparent; border: 0; padding: 12px 14px; color: var(--fg); font-family: var(--font-sans); font-size: 14px; }
.chat-in input:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
.chat-in button { background: var(--accent); color: var(--fg-inverse); border: 0; padding: 0 16px; font-family: var(--font-mono); font-size: 11px; letter-spacing: .14em; text-transform: uppercase; cursor: pointer; }
.chat-in button:disabled { opacity: .5; cursor: not-allowed; }
```

`--fg-inverse` is white-on-accent today; after plan 08 it becomes the oxblood-on-gold value automatically.

- Remove the `clsx` import from the widget (dashboard keeps the dependency).
- The "thinking" indicator: three `.chat-dot` spans with a CSS animation wrapped in `@media (prefers-reduced-motion: no-preference)`.

### A3. Tests

- Unit: `__tests__/chat-service.test.ts` — mock `fetch`; `sendChatMessage` returns `{success:false, error}` with the server's message on 429; returns `{success:true, message}` on 200; never throws on malformed JSON.
- e2e: with `NEXT_PUBLIC_CHAT_API_URL` unset (CI), assert `.chat-fab` count is 0. That guards the "no fake mode" invariant.

### A4. Verify

```bash
cd worker && npx wrangler dev   # then from the site: NEXT_PUBLIC_CHAT_API_URL=http://localhost:8787 npm run dev
```

Ask the four chips; ask something off-brief ("what's the weather") — expect it to say it doesn't know and point to Contact. Hit it 21 times in a minute from one IP — expect the 429 sentence. Then `npm test -- --run && npx tsc --noEmit && npm run lint && npx playwright test`.

## Path B

```bash
git rm -r components/chat lib/services/chat.ts
```

In `app/layout.tsx` remove the `ChatBot` import and `<ChatBot />`. Run `npx tsc --noEmit && npm run lint && npm run build && npx playwright test`. Commit as `chore: remove the placeholder chat assistant`.

## Commit (path A)

`feat: real assistant backed by a rate-limited Worker, restyled in brand tokens`
