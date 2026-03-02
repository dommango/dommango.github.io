---
title: "Building Governance Frameworks Under Regulatory Deadline Pressure"
competency: "execution"
interview_ready: true
tags: [governance-design, regulatory-compliance, stakeholder-management, execution, citi]
project: "../projects/citi-mra-transformation.md"
---

## STAR Format

### Situation

At Citi, we had compressed quarter-end timelines for delivering MRA (Mapped Remedial Actions) reporting evidence to regulators. Leadership needed **Board-grade dashboards by specific dates** — 03/31/22 and 04/15/22 — with no room for delay.

The problem: The underlying data was fragmented, inconsistent, and sometimes contradictory. We had to:
- Reconcile data across business lines with different definitions and taxonomies
- Create dashboards that could be challenged by auditors and regulators
- Do it fast enough to meet the deadline

If we moved slowly (trying to be perfect), we'd miss the deadline. If we moved fast (with shortcuts), we'd have audit pushback.

### Task

I was responsible for **designing the data architecture and governance framework** that would:
1. Reconcile inconsistencies quickly without creating debt
2. Build defensible dashboards with clear sourcing logic
3. Document assumptions so reviewers could challenge them *before* we went to the Board

### Action

**Step 1: Scoped the Work Ruthlessly**
- Identified which data points were critical vs. nice-to-have
- Made **explicit scope calls** on thorny issues (e.g., "Should ARC be excluded from past-due counts?")
- Documented each decision with **footnoted rationales** — not to hide from scrutiny, but to invite it early

**Step 2: Built a One-Time Reconciliation Framework**
- Created an **illustrative reconciliation workbook** (FRB Correspondence Reconciliation v1.xlsx) that showed:
  - Gold Source alignment (reconciling iCAPS with hand-maintained data)
  - Week-over-week snapshots showing where numbers diverged
  - Explicit "type of work" required to produce senior reporting (not a recurring artifact)
- Ensured every number could be traced back to a source system with documented assumptions

**Step 3: Created the Operating Model**
- Once the one-time reconciliation showed us what was possible, I **transitioned to a repeatable BAU process:**
  - Built a **Management Summary deck** with severity/1-2 views and unmapped population by EMT and phase
  - Designed the **BAU Transition Draft** (task matrix, POCs, QC steps, calendars, inputs/outputs, process flow)
  - Created a **governance framework** with named roles, clear responsibilities, and escalation paths

**Step 4: Handled Cross-Silo Normalization**
- Different businesses used different naming conventions and phase logic; the reconciliation would fail if we didn't align upfront
- Rather than force a single taxonomy (which would take forever to agree on), I created a **mapping layer:**
  - Field-level definitions with footnotes explaining where conventions differed
  - QC decision matrices that accommodated multiple interpretations (but with clear escalation if assumptions were wrong)
  - Weekly trails showing timing/definition drivers so reviewers could preempt questions

**Step 5: Maintained Attention to Detail While Moving Fast**
- Tracked week-over-week changes across snapshot counts to catch unexpected divergences
- Documented **near-cutoff figures** where small changes drove big portfolio moves
- Called out timing/definition drivers explicitly so senior reviewers didn't have to ask "why did this number change?"

**Step 6: Transitioned to Sustainable Governance**
- After the one-time dashboard was delivered, I **authored the Transition Draft** to move production from "craft build" to **repeatable BAU**
- Built the **Weekly MRA Oversight Tracker** and **Committee presentation template** for ongoing governance
- Ensured the framework didn't require me — BAU could own it and Oversight could challenge it

### Result

**Outcome:**
- **Dashboard delivered on time** (Q1'22 and updated 04/15/22) with defensible definitions and clear sourcing logic
- **Regulatory confidence:** No pushback from auditors or regulators on assumptions — the documentation meant reviewers could challenge *before* it went to the Board
- **Repeatable process established:** BAU didn't have to recreate the reconciliation every quarter; the governance framework made it sustainable
- **Audit-ready:** Reconciliation workbook, dashboard, and sourcing logic all available for Consent Order reviews

**Business Impact:**
- Avoided rework by handling scope and definitions upfront
- Reduced risk of regulatory pushback by inviting challenge early
- Established a governance model that Oversight Function and MRAAOF could use independently

**What I'm Proud Of:**
- Balanced speed with rigor. Compressed timelines don't mean sloppy — they mean ruthless prioritization and clear rationales.
- The reconciliation workbook was a *one-time* artifact, but it informed everything downstream. No waste.
- Moved seamlessly from "here's what the data actually shows" to "here's a repeatable process the team can sustain" — that's the real value.

---

## Interview Angles

- **How do you prioritize under constraints?** Ruthless scope calls, explicit rationales, invite challenge early
- **How do you move fast without cutting corners?** Front-load definitions and assumptions; document the 'why'; test before you scale
- **What does 'governance-ready' mean to you?** Clear roles, documented decisions, audit trails, and a process that doesn't depend on any one person

---

## Keywords

Operating under pressure • Governance design • Data reconciliation • Cross-silo alignment • Executive communication • Regulatory readiness • Sustainable process design
