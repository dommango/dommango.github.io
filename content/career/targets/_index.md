# Target Companies

Pipeline of companies under consideration, organized into three buckets:

1. **AI Talent Density Index** — 50 AI-native companies from [Paraform](https://www.paraform.com/talent-density-index) (fetched 2026-05-05).
2. **AI Forward Consulting** — services firms with strong AI practices.
3. **Fintech** — financial services operators + adjacent infra/investors per your framing.

## Schema

| Field                              | Values                                                                                                 | Notes                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `bucket`                           | paraform-tdi, ai-consulting, fintech, personal, fastest-growing                                        | Your sector framing (separate from `category` which is what the company actually does) |
| `fit_tier`                         | A / B / C / pass                                                                                       | Your priority. **Blank = not yet reviewed.**                                           |
| `fit_score`                        | 1–5                                                                                                    | Optional finer-grained rank within tier                                                |
| `category`                         | frontier-lab, dev-tools, enterprise-ai, vertical-ai, infra, defense, consumer, consulting, fintech, vc | Auto-derived from what the company does                                                |
| `role_archetype`                   | strategy-bizops, transformation, enterprise-gtm, chief-of-staff, product-strategy                      | What you'd do there                                                                    |
| `stage`                            | seed (<50), series-a-b (50–200), scale-up (200–1000), mature (1000+)                                   | Auto-derived from headcount                                                            |
| `location`                         | sf, nyc, nj, ba (bay area, non-SF), other                                                              | NJ-commutability matters                                                               |
| `status`                           | researching, interested, applied, networking, interviewing, passed, on-hold                            | Pipeline state                                                                         |
| `network`                          | Free text — people you know there                                                                      | Warm intros                                                                            |
| `last_touch`                       | YYYY-MM-DD                                                                                             | Recency                                                                                |
| `paraform_rank` / `paraform_score` | From Paraform (only applies to bucket=paraform-tdi)                                                    | External signal                                                                        |

## AI Talent Density Index (bucket: paraform-tdi)

Sorted by Paraform rank. `fit_tier`, `role_archetype`, `status`, `network`, `last_touch` left blank for review.

| #   | Company               | Paraform | Score | HC   | Stage      | Category      | Location | Tier | Role | Status | Network | Last Touch | Notes                                                                                       |
| --- | --------------------- | -------- | ----- | ---- | ---------- | ------------- | -------- | ---- | ---- | ------ | ------- | ---------- | ------------------------------------------------------------------------------------------- |
| 1   | Thinking Machines Lab | 1        | 0.817 | 140  | series-a-b | frontier-lab  | sf       |      |      |        |         |            | AI research lab building frontier models                                                    |
| 2   | OpenAI                | 2        | 0.805 | 4500 | mature     | frontier-lab  | sf       |      |      |        |         |            | Frontier AI research, ChatGPT. Your interest: enterprise consulting / Forward Deployed team |
| 3   | Anthropic             | 3        | 0.802 | 2500 | mature     | frontier-lab  | sf       |      |      |        |         |            | AI safety lab, Claude                                                                       |
| 4   | Cursor                | 4        | 0.799 | 400  | scale-up   | dev-tools     | sf       |      |      |        |         |            | AI-native code editor                                                                       |
| 5   | Applied Intuition     | 5        | 0.796 | 1400 | mature     | vertical-ai   | ba       |      |      |        |         |            | Sim platform for AVs                                                                        |
| 6   | Modal Labs            | 6        | 0.780 | 120  | series-a-b | infra         | nyc      |      |      |        |         |            | Serverless cloud for AI                                                                     |
| 7   | Decagon               | 7        | 0.769 | 300  | scale-up   | enterprise-ai | sf       |      |      |        |         |            | AI customer support agents                                                                  |
| 8   | Voyage AI             | 8        | 0.764 | 20   | seed       | infra         | ba       |      |      |        |         |            | Embedding & reranking models                                                                |
| 9   | Cohere                | 9        | 0.761 | 850  | scale-up   | frontier-lab  | other    |      |      |        |         |            | Toronto. Enterprise LLMs                                                                    |
| 10  | Glean                 | 10       | 0.756 | 1500 | mature     | enterprise-ai | ba       |      |      |        |         |            | Enterprise AI search                                                                        |
| 11  | LangChain             | 11       | 0.748 | 290  | scale-up   | infra         | sf       |      |      |        |         |            | Framework + platform for LLM apps                                                           |
| 12  | Ramp                  | 12       | 0.743 | 2000 | mature     | vertical-ai   | nyc      |      |      |        |         |            | Corporate cards + finance automation                                                        |
| 13  | Together AI           | 13       | 0.742 | 340  | scale-up   | infra         | sf       |      |      |        |         |            | Open-source AI cloud + inference                                                            |
| 14  | Fireworks AI          | 14       | 0.742 | 180  | series-a-b | infra         | ba       |      |      |        |         |            | Fast inference for open models                                                              |
| 15  | Cognition             | 15       | 0.741 | 300  | scale-up   | dev-tools     | sf       |      |      |        |         |            | AI coding agents                                                                            |
| 16  | Harvey                | 16       | 0.741 | 1000 | mature     | vertical-ai   | sf       |      |      |        |         |            | GenAI for legal                                                                             |
| 17  | Scale AI              | 17       | 0.724 | 1000 | mature     | infra         | sf       |      |      |        |         |            | Data labeling + AI infra                                                                    |
| 18  | Warp                  | 18       | 0.722 | 50   | series-a-b | dev-tools     | sf       |      |      |        |         |            | Modern terminal with AI                                                                     |
| 19  | Hebbia                | 19       | 0.720 | 140  | series-a-b | enterprise-ai | nyc      |      |      |        |         |            | AI search & analysis                                                                        |
| 20  | Rogo                  | 20       | 0.718 | 110  | series-a-b | vertical-ai   | nyc      |      |      |        |         |            | GenAI for investment bankers                                                                |
| 21  | Augment               | 21       | 0.713 | 150  | series-a-b | vertical-ai   | sf       |      |      |        |         |            | AI productivity for logistics                                                               |
| 22  | Parallel Web Systems  | 22       | 0.712 | 50   | series-a-b | infra         | sf       |      |      |        |         |            | Web retrieval infra for AI                                                                  |
| 23  | Baseten               | 23       | 0.709 | 200  | scale-up   | infra         | sf       |      |      |        |         |            | ML model deployment + inference                                                             |
| 24  | Brain Co.             | 24       | 0.706 | 60   | series-a-b | enterprise-ai | sf       |      |      |        |         |            | AI for institutional workflows                                                              |
| 25  | Linear                | 25       | 0.701 | 200  | scale-up   | dev-tools     | sf       |      |      |        |         |            | Project mgmt for software teams                                                             |
| 26  | Mercor                | 26       | 0.700 | 300  | scale-up   | vertical-ai   | sf       |      |      |        |         |            | AI talent platform                                                                          |
| 27  | Mistral AI            | 27       | 0.700 | 850  | scale-up   | frontier-lab  | other    |      |      |        |         |            | Paris. Open-weight frontier LLMs                                                            |
| 28  | Nuro                  | 28       | 0.700 | 1000 | mature     | vertical-ai   | ba       |      |      |        |         |            | Autonomous driving                                                                          |
| 29  | Adept                 | 29       | 0.699 | 70   | series-a-b | frontier-lab  | sf       |      |      |        |         |            | AI agents that act on software                                                              |
| 30  | Vanta                 | 30       | 0.699 | 1500 | mature     | vertical-ai   | sf       |      |      |        |         |            | Automated security & compliance                                                             |
| 31  | Traversal             | 31       | 0.692 | 70   | series-a-b | enterprise-ai | nyc      |      |      |        |         |            | AI incident response                                                                        |
| 32  | Metronome             | 32       | 0.688 | 150  | series-a-b | infra         | sf       |      |      |        |         |            | Usage-based billing for SaaS                                                                |
| 33  | ElevenLabs            | 33       | 0.687 | 700  | scale-up   | frontier-lab  | nyc      |      |      |        |         |            | AI voice synthesis                                                                          |
| 34  | Factory               | 34       | 0.686 | 70   | series-a-b | dev-tools     | sf       |      |      |        |         |            | AI coding agents                                                                            |
| 35  | Anyscale              | 35       | 0.686 | 500  | scale-up   | infra         | sf       |      |      |        |         |            | Managed compute for scalable AI                                                             |
| 36  | Vannevar Labs         | 36       | 0.685 | 200  | scale-up   | defense       | ba       |      |      |        |         |            | Defense tech for national security                                                          |
| 37  | Abridge               | 37       | 0.684 | 500  | scale-up   | vertical-ai   | sf       |      |      |        |         |            | AI patient intelligence (healthcare)                                                        |
| 38  | The Browser Company   | 38       | 0.678 | 100  | series-a-b | consumer      | nyc      |      |      |        |         |            | Consumer browser w/ AI                                                                      |
| 39  | Reevo                 | 39       | 0.675 | 100  | series-a-b | vertical-ai   | ba       |      |      |        |         |            | AI-native GTM/revenue platform                                                              |
| 40  | Chalk                 | 40       | 0.675 | 90   | series-a-b | infra         | sf       |      |      |        |         |            | Real-time ML feature platform                                                               |
| 41  | Nominal               | 41       | 0.674 | 160  | series-a-b | vertical-ai   | other    |      |      |        |         |            | LA. Test data for hardware eng                                                              |
| 42  | Cartesia              | 42       | 0.672 | 100  | series-a-b | frontier-lab  | sf       |      |      |        |         |            | Real-time multimodal & voice                                                                |
| 43  | Pinecone              | 43       | 0.671 | 130  | series-a-b | infra         | nyc      |      |      |        |         |            | Managed vector DB                                                                           |
| 44  | Hex Technologies      | 44       | 0.670 | 240  | scale-up   | enterprise-ai | sf       |      |      |        |         |            | Collaborative AI workspace for data                                                         |
| 45  | Merge                 | 45       | 0.669 | 120  | series-a-b | infra         | sf       |      |      |        |         |            | Connective infra to production APIs                                                         |
| 46  | Whatnot               | 46       | 0.668 | 1000 | mature     | consumer      | other    |      |      |        |         |            | LA. Live shopping marketplace                                                               |
| 47  | Eventual              | 47       | 0.666 | 30   | seed       | infra         | sf       |      |      |        |         |            | Data engine for multimodal AI                                                               |
| 48  | Faire                 | 48       | 0.664 | 1500 | mature     | consumer      | sf       |      |      |        |         |            | Wholesale marketplace                                                                       |
| 49  | Arena                 | 49       | 0.662 | 50   | series-a-b | infra         | sf       |      |      |        |         |            | Public leaderboard for frontier AI                                                          |
| 50  | Bedrock Robotics      | 50       | 0.662 | 100  | series-a-b | vertical-ai   | sf       |      |      |        |         |            | Autonomous robotics for heavy industry                                                      |

## AI Forward Consulting (bucket: ai-consulting)

Services firms with strong AI practices. Headcounts approximate.

| Company                   | HC       | Stage      | Category     | Location | Tier | Role | Status | Network | Last Touch | Notes                                                                              |
| ------------------------- | -------- | ---------- | ------------ | -------- | ---- | ---- | ------ | ------- | ---------- | ---------------------------------------------------------------------------------- |
| Every                     | 40       | seed       | consulting   | nyc      |      |      |        |         |            | Media + AI products studio (Spiral, Lex, Cora). Editorial-meets-product hybrid     |
| OpenAI (enterprise / FDE) | (subset) | mature     | frontier-lab | sf       |      |      |        |         |            | See #2 in Paraform table — your interest is the Forward Deployed / enterprise team |
| Leeway                    | ~250     | scale-up   | consulting   | sf       |      |      |        |         |            | **Confirm: LeewayHertz?** AI dev services consultancy                              |
| EY                        | 395000   | mature     | consulting   | nyc      |      |      |        |         |            | Big 4. EY.ai / GenAI consulting practice                                           |
| Infosys                   | 340000   | mature     | consulting   | other    |      |      |        |         |            | Bangalore HQ. Topaz AI platform; large enterprise transformations                  |
| Deeper Insight            | ~30      | seed       | consulting   | other    |      |      |        |         |            | London-based AI consultancy                                                        |
| Addepto                   | ~100     | series-a-b | consulting   | nyc      |      |      |        |         |            | NYC + Warsaw. AI/ML/data consultancy                                               |
| Cambridge Consultants     | ~750     | scale-up   | consulting   | other    |      |      |        |         |            | UK deep-tech consultancy (Capgemini-owned)                                         |

## Fintech (bucket: fintech)

Per your framing — includes operators (Stripe, Plaid, SoFi, BlackRock), AI/data infra you grouped here (Databricks, CoreWeave), and an investor (General Catalyst). `category` reflects what each actually is.

| Company          | HC    | Stage      | Category | Location | Tier | Role | Status | Network | Last Touch | Notes                                                                            |
| ---------------- | ----- | ---------- | -------- | -------- | ---- | ---- | ------ | ------- | ---------- | -------------------------------------------------------------------------------- |
| Stripe           | 8000  | mature     | fintech  | sf       |      |      |        |         |            | Payments. Also Dublin                                                            |
| Plaid            | 1200  | mature     | fintech  | sf       |      |      |        |         |            | Financial data API                                                               |
| SoFi             | 5000  | mature     | fintech  | sf       |      |      |        |         |            | Online bank/lending. **Clarify: "cooperation" — typo? Or specific partnership?** |
| BlackRock        | 21000 | mature     | fintech  | nyc      |      |      |        |         |            | Asset management. Aladdin platform; AI Labs                                      |
| General Catalyst | ~150  | series-a-b | vc       | nyc      |      |      |        |         |            | **Note: VC firm, not operator.** Multi-office (also SF, Cambridge MA, London)    |
| Databricks       | 7000  | mature     | infra    | sf       |      |      |        |         |            | Data + AI platform. **Note: not really fintech — bucket reflects your framing**  |
| CoreWeave        | ~1000 | mature     | infra    | nj       |      |      |        |         |            | **Roseland, NJ — local commute fit.** GPU cloud. Recent IPO                      |

## Personal Watchlist (bucket: personal)

Companies you flagged directly (not from Paraform). Devin = Cognition (already #15 in Paraform table above).

| Company    | HC   | Stage      | Category      | Location | Tier | Role | Status | Network | Last Touch | Notes                                                                            |
| ---------- | ---- | ---------- | ------------- | -------- | ---- | ---- | ------ | ------- | ---------- | -------------------------------------------------------------------------------- |
| Superhuman | ~120 | series-a-b | consumer      | sf       |      |      |        |         |            | AI email client (Grammarly-owned). Tracked in career-ops portals; watch for new roles |
| HappyRobot | ~60  | series-a-b | vertical-ai   | sf       |      |      |        |         |            | AI voice agents for logistics/freight. YC + a16z + Base10, Series B. Has FDE roles — strong fit |

## Fastest-Growing (bucket: fastest-growing)

From a "Fastest growing tech-companies by 90-day hiring rate" list (captured 2026-06-06). Only companies with an explicit **NYC** presence were added (NJ-commutability). HC/stage left blank — not yet researched. **Cursor** was also on this list but is already tracked as Paraform #4.

| Company         | HC | Stage | Category    | Location | Tier | Role | Status | Network | Last Touch | Notes                                                                                  |
| --------------- | -- | ----- | ----------- | -------- | ---- | ---- | ------ | ------- | ---------- | -------------------------------------------------------------------------------------- |
| Fleet           |    |       | infra       | nyc      |      |      |        |         |            | Simulation environments for AI training. Also SF / remote                              |
| Lio             |    |       | vertical-ai | nyc      |      |      |        |         |            | AI procurement automation. Also Munich                                                 |
| Conveo          |    |       | vertical-ai | nyc      |      |      |        |         |            | AI qualitative research. Also Antwerp / London / SF                                    |
| Outset          |    |       | vertical-ai | nyc      |      |      |        |         |            | AI-moderated research platform. Also SF                                                |
| Mecka AI        |    |       | infra       | nyc      |      |      |        |         |            | Movement data for robotics training. Also Toronto                                      |
| Reflection      |    |       | dev-tools   | nyc      |      |      |        |         |            | AI automation for engineering tasks. Also SF / London / DC                             |
| Peec AI         |    |       | vertical-ai | nyc      |      |      |        |         |            | AI search visibility analytics (GEO/SEO). Also Berlin                                  |
| Beacon Software |    |       | —           | nyc      |      |      |        |         |            | Vertical software acquisition (roll-up); not AI-native — bucket reflects list source. Also Toronto / SF / remote |
| Polymarket      |    |       | fintech     | nyc      |      |      |        |         |            | Prediction market. Also remote. (Also appears as a research source in last30days tooling) |
| Yuzu            |    |       | vertical-ai | nyc      |      |      |        |         |            | Custom health plan platform                                                            |

## Quick Slices

Counts include all three buckets unless noted.

### By Bucket

- **paraform-tdi** (50): see Paraform table
- **ai-consulting** (8): Every, OpenAI (FDE), Leeway, EY, Infosys, Deeper Insight, Addepto, Cambridge Consultants
- **fintech** (7): Stripe, Plaid, SoFi, BlackRock, General Catalyst, Databricks, CoreWeave
- **fastest-growing** (10, all NYC): Fleet, Lio, Conveo, Outset, Mecka AI, Reflection, Peec AI, Beacon Software, Polymarket, Yuzu

### By Category

- **frontier-lab** (8): Thinking Machines Lab, OpenAI, Anthropic, Cohere, Mistral, Adept, ElevenLabs, Cartesia
- **dev-tools** (5): Cursor, Cognition, Warp, Linear, Factory
- **enterprise-ai** (6): Decagon, Glean, Hebbia, Brain Co., Traversal, Hex
- **vertical-ai** (12): Applied Intuition, Ramp, Harvey, Rogo, Augment, Mercor, Nuro, Vanta, Abridge, Reevo, Nominal, Bedrock Robotics _(debate: Vanta is more SaaS than AI-native)_
- **infra** (15): Modal, Voyage, LangChain, Together, Fireworks, Scale AI, Parallel, Baseten, Metronome, Anyscale, Chalk, Pinecone, Merge, Eventual, Arena, Databricks, CoreWeave
- **defense** (1): Vannevar Labs
- **consumer** (3): The Browser Company, Whatnot, Faire
- **consulting** (7): Every, Leeway, EY, Infosys, Deeper Insight, Addepto, Cambridge Consultants
- **fintech** (4): Stripe, Plaid, SoFi, BlackRock
- **vc** (1): General Catalyst

### By Location

- **sf** (~33): majority across all buckets
- **nyc** (~12): Modal, Ramp, Hebbia, Rogo, Traversal, ElevenLabs, The Browser Company, Pinecone, Every, EY, Addepto, BlackRock, General Catalyst
- **nj** (1): **CoreWeave** (Roseland) — only true local-commute target
- **ba (Bay Area, non-SF)** (7): Applied Intuition, Voyage, Glean, Fireworks, Nuro, Vannevar, Reevo
- **other** (~7): Cohere (Toronto), Mistral (Paris), Nominal (LA), Whatnot (LA), Infosys (Bangalore), Deeper Insight (London), Cambridge Consultants (UK)

### By Stage

- **seed** (4): Voyage AI, Eventual, Every, Deeper Insight
- **series-a-b** (~25): Modal, Warp, Hebbia, Rogo, Augment, Parallel, Brain Co., Adept, Traversal, Metronome, Factory, Reevo, Chalk, Nominal, Cartesia, Pinecone, Merge, The Browser Company, Bedrock Robotics, Fireworks, Thinking Machines, LangChain (close), Cognition (close), Decagon (close), Mercor (close), Addepto, General Catalyst
- **scale-up** (~16): Cursor, Cohere, Together, Harvey, Scale AI, Linear, Mistral, Vannevar, Abridge, Anyscale, ElevenLabs, Hex, Baseten, Leeway, Cambridge Consultants
- **mature** (~17): OpenAI, Anthropic, Applied Intuition, Glean, Ramp, Nuro, Vanta, Whatnot, Faire, EY, Infosys, Stripe, Plaid, SoFi, BlackRock, Databricks, CoreWeave

## How to Promote a Company to a Detail File

When a company moves past `researching` (you've talked to someone, applied, or want to track ongoing notes), create `targets/{company-slug}.md` with:

```markdown
---
company: "Company Name"
fit_tier: A
fit_score: 5
category: frontier-lab
role_archetype: transformation
stage: scale-up
location: sf
status: networking
network: ["Name (Title)"]
last_touch: 2026-05-05
paraform_rank: 3
paraform_score: 0.802
---

## Why this company

…

## Why me

…

## Open roles tracked

…

## Contacts & touchpoints

| Date | Person | Channel | Notes |

## Research notes

…
```

## Open Questions

- Are there target companies _not_ on this list (non-AI, traditional enterprise, etc.) that should also live here? If so, we add a `source` column (`paraform-tdi` vs `personal`) and seed those too.
- Comp/equity expectations to filter out roles below threshold?
- Visa/relocation/remote requirements?
