// Projects — hand-authored portfolio data, read at build time.
//
// Typed TS rather than JSON on purpose: these are written by hand, not
// generated, and an empty JSON array would infer never[] under strict.
//
// `href` is the single link the card points at. Omit it for projects with
// neither a public repo nor a reachable URL — those render as plain cards.

export interface Project {
  /** Catalog ID in the card's top-left, e.g. "#sous-0001/05". */
  id: string
  name: string
  /** Stack line, rendered uppercase in the card. */
  stack: string
  year: string
  /** The one number or fact worth leading with. Rendered in the accent color. */
  impact: string
  points: string[]
  href?: string
  /** Where `href` goes — sets the card's link label. */
  hrefKind?: 'live' | 'repo'
}

export const PROJECTS: Project[] = [
  {
    id: '#sous-0001/05',
    name: 'SousIQ',
    stack: 'Express · React 19 · Postgres + pgvector · Claude',
    year: '2025 →',
    impact: 'Live · field-tested in a working bakery',
    points: [
      'Parses vendor invoices into line items, then matches them to inventory products with embeddings + fuzzy search',
      'Multi-tenant on Postgres row-level security; 5,437-item USDA reference set for grounding',
      'Claude Haiku for parsing and detection, Sonnet for the harder passes',
    ],
    href: 'https://sousiq-production.up.railway.app',
    hrefKind: 'live',
  },
  {
    id: '#brkt-0002/05',
    name: 'Bracketeer',
    stack: 'Next 16 · Prisma 7 · Auth.js · Railway',
    year: '2026 →',
    impact: 'Live · ran a real World Cup pool',
    points: [
      'Create a pool, invite friends, make bracket picks, watch a leaderboard update from live results',
      'Knockout seeding follows FIFA Annex C — the tiebreak rules are genuinely gnarly',
      'Started as a pool for friends, grew into a multi-tenant platform',
    ],
    href: 'https://fifawc26.up.railway.app',
    hrefKind: 'live',
  },
  {
    id: '#plcm-0003/05',
    name: 'Claude Code Placemat',
    stack: 'Static HTML · GitHub Actions · scheduled agent',
    year: '2026 →',
    impact: 'Maintains itself · MIT',
    points: [
      'A one-page reference for Claude Code: shortcuts, slash commands, flags, hooks, MCP',
      'A scheduled agent re-reads the latest release every day and opens a PR when anything drifts',
      'The interesting part is not the page — it is that nobody updates it by hand',
    ],
    href: 'https://dommango.github.io/claude-code-placemat/',
    hrefKind: 'live',
  },
  {
    id: '#modm-0004/05',
    name: 'modular-mind',
    stack: 'Python · 10-stage pipeline',
    year: '2026',
    impact: '3,500+ patches · 269 module profiles',
    points: [
      'Builds a corpus of VCV Rack modular-synth patches, then generates new ones from learned patterns',
      'Decodes the binary patch format, profiles each module, validates signal flow before emitting',
      'Teaching a model what a patch that actually makes sound looks like',
    ],
    href: 'https://github.com/dommango/modular-mind',
    hrefKind: 'repo',
  },
  {
    id: '#prial-0005/05',
    name: 'PRIAL Pipeline',
    stack: 'Python · SEC bulk data',
    year: '2026',
    impact: '23,000+ firms from raw filings',
    points: [
      'Turns monthly SEC Form ADV bulk filings into a deduped registry of investment-adviser firms',
      'Pulls officers from Schedule A/B and firm sites from Schedule D, then enriches with AUM growth',
      'Mostly an exercise in wrangling government data that was never meant to be joined',
    ],
  },
]
