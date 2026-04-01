---
title: "IR Labor Cost Increase Analysis (Last Appearance Method)"
date: 2026-03-06
primary_theme: [automation, research]
ai_functions: [generation, analysis, validation]
leverage_type: [cognitive, executional]
confidence_level: 0.92
estimated_time_saved_hrs: 4.0
tags: [excel, python, pandas, financial-analysis, labor-cost, investment-request]
role: "../roles/citi-svp-transformation.md"
interview_ready: true
source_doc: "AI collaboration (21-40) - Mar 16 2026 - 10-10 AM.pdf"
---

# IR Labor Cost Increase Analysis (Last Appearance Method)

AI-assisted development of an executive-ready Excel workbook that identifies Investment Requests with labor cost increases using a last-appearance baseline methodology.

---

## Executive Summary

<!-- sanitized -->

This use case produces a leadership-ready spreadsheet that identifies items with **labor cost increases** by comparing a consistent **baseline** to each item's **last observed** (last-appearance) labor total across multiple snapshots.

**Core Challenge:** Leadership needs a defensible answer to: "Which IRs show meaningful labor cost growth, when measured consistently across snapshots, without confusing missing data with zero cost?"

**Goal:** Create an audit-friendly workbook with summary counts, detailed traces, state matrices, and clear methodology documentation.

---

## Business Context

<!-- internal -->

Leadership needs a defensible answer to: **"Which IRs show meaningful labor cost growth**, when measured consistently across snapshots, without confusing **missing data** with **zero cost**?"

---

## Scope

<!-- internal -->

### Included
- **Labor-only** financial subtype filter (Financial_SubType_2):
  - Labor - Direct
  - Labor - FPC
  - Labor - T&M
- Snapshot-to-snapshot tracking across provided extracts

### Excluded
- Non-labor subtypes (Software, Hardware, Other Cost, etc.)
- Non-project record types (variance extracts filtered to RecordType=Projects)

---

## Source Files Used (SoR inventory)

<!-- internal -->

1. **Variance 02102025.csv** (Snapshot: 2025-02-10)
   - 2025 variance extract; no PeriodYear field (treated as 2025 by explicit assumption)

2. **IRCost_26thNoV_2026_2025.csv** (Snapshot: 2025-11-26)
   - Cost extract; contains 2025 and 2026 values via PeriodYear

3. **Variance 12022025.csv** (Snapshot: 2025-12-02)
   - 2025 variance extract; no PeriodYear field (treated as 2025 by explicit assumption)

4. **Investment Cost_03042026.csv** (Snapshot: 2026-03-04)
   - Cost extract; contains 2025 and 2026 values via PeriodYear
   - Supersedes prior 2026-02-27 snapshot

---

## Definitions & Assumptions

<!-- internal -->

### Presence Rule (A)
An IR "appears" at a snapshot **only if** it has at least one row **after** labor-only filtering.

### Aggregation
- Per row: **RowLaborTotal** = Sum(Jan..Dec)
- Per IR: **LaborTotal** = Sum(RowLaborTotal) aggregated at IR/SnapshotDate/PeriodYear

### Baseline
- **BaselineDate / BaselineAmt** per IR and metric = **first** snapshot where LaborTotal > 0

### Latest (Key refinement)
- **LatestDate / LatestAmt / LatestState** per IR and metric = **last** snapshot where the IR appears (Present-Zero or Present-Positive) after labor-only filtering
- This prevents treating disappearance as $0 and avoids forcing all IRs to compare against a single global snapshot

### PeriodYear caveat
- Variance extracts lack PeriodYear and are treated as **2025 totals** for this analysis

---

## Execution Approach (repeatable pipeline)

<!-- internal -->

1. Load each snapshot and tag rows with SnapshotDate
2. Apply labor-only subtype filter (Direct/FPC/T&M)
3. Coerce month columns to numeric; treat non-numeric as 0
4. Aggregate to IR totals by SnapshotDate and PeriodYear
5. Build IR/Snapshot state matrices to preserve Absent vs Present-Zero vs Present-Positive
6. Compute baseline (first >0) and latest (last appearance) per IR/metric
7. Compute deltas: Delta$ = LatestAmt - BaselineAmt; Delta% = Delta$ / BaselineAmt
8. Produce outputs: Summary, Increases, Detail, StateMatrix, and LatestDate distributions
9. Add governance layer: Summary_Overview (TOC, assumptions, key insights), Data Dictionary, and Copilot narrative

---

## Outputs Produced

<!-- internal -->

**Workbook:** `IR-LaborCost-Increase_LastAppearanceLatest_20260305_v1_clean2.xlsx`

### Key tabs:
- Summary_Overview (Citi logo, TOC, Key Insights, Source Files Used)
- How Copilot Was Used
- Data Dictionary
- Summary
- LatestDateDist_2025 / _2026 / _Combined
- 2025_Breakdown
- Increases_* (2025 / 2026 / Combined)
- Detail_* (2025 / 2026 / Combined)
- StateMatrix_* (2025 / 2026 / Combined)

---

## QA / Controls

<!-- internal -->

- **State integrity:** LatestDate must correspond to a non-Absent state
- **Monotonicity check:** LatestDate >= BaselineDate for each IR/metric
- **Reconciliation:** Increase band counts reconcile to total increases (including >30% bucket)
- **Usability controls:** Gridlines hidden; TOC hyperlinks; Home links in A1

---

## Implementation Notes / Lessons Learned

<!-- internal -->

- Excel "repair" errors can occur if merged-cell ranges are modified after creation; safest pattern is to **rebuild** the cover sheets deterministically rather than inserting rows into already-merged layouts
- Key decision: LatestDate is per-IR last appearance after labor filter (rule A)
- Outputs: final workbook includes Summary_Overview with TOC, Key Insights (2025 baselined denom), Source Files Used, Data Dictionary, and analyst trace tabs
- Resolved issue: Excel repair errors fixed by rebuilding cover sheets deterministically to avoid invalid merged-cell/drawing structures

---

## Key Insights (2025 metric)

<!-- internal -->

- **Baselined 2025 IRs** (denominator): 3,820 (excludes 1,286 IRs with 2025 presence but never >$0 baseline)
- **Increases:** 1,011 (26.5% of baselined 2025 IRs)
- **Increase distribution** (count; % of baselined 2025 IRs):
  - 0-10%: 320 (8.4%)
  - 10-20%: 122 (3.2%)
  - 20-30%: 87 (2.3%)
  - >30%: 482 (12.6%)

---

## Tooling

<!-- meta -->

- Python (pandas, openpyxl) used to compute metrics and generate the workbook

---

## Known Limitations

<!-- meta -->

- Variance extracts lack PeriodYear; treated as 2025 by explicit assumption
- Percent banding excludes items without a positive baseline

---

## Compact carry-forward summary (for next session)

<!-- meta -->

- Objective: find labor cost increases by IR using baseline vs last appearance
- Files: two variance snapshots (2025-only), two cost snapshots (contain 2025 & 2026 via PeriodYear)

---

## Resume-Ready Bullets

- Architected and delivered an AI-assisted financial analysis workbook identifying 1,011 Investment Requests with labor cost increases across 3,820 baselined items, providing executive leadership with audit-ready insights
- Developed a repeatable Python/pandas pipeline to aggregate labor costs by IR across multiple snapshots, applying a "last-appearance" methodology to prevent false-zero comparisons
- Produced comprehensive governance documentation including Summary_Overview, Data Dictionary, Key Insights, and state matrices to ensure analytical transparency and auditability

---

## Status

**Complete** - All sections (Internal, Meta, Sanitized) have been merged.
