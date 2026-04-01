---
title: "Re-engineering a Budgeting & Resourcing Monitoring EUC into an Audit-Ready Data Pipeline"
competency: "execution"
interview_ready: true
tags: [data-engineering, powerquery, euc, governance, automation, regulatory, citi]
role: "../roles/citi-svp-transformation.md"
---

## STAR Format

### Situation

CPMC (Corporate Project Management Controls) required a monthly, controlled, audit-ready monitoring process for budgeting and resourcing across Org PMOs. The process needed to track approved IRs, TBD resource exposure, labor actuals, and IR-level variance.

**The Challenge:**
- Early versions were manual and error-prone
- Later versions required automation, governance, and repeatable evidence
- The data came from multiple systems (PTS, Cognos, Gold Source) with no single source of truth

I served as the **architectural lead and release approver** for the EUC (End-User Computing) pipeline that powered this reporting.

### Task

My remit was to:
1. Transform the B&R Monitoring EUC from manual copy-paste workflows into a controlled PowerQuery data pipeline
2. Establish monthly release protocols with quality control and governance
3. Author critical sections of the PCM (Policy and Control Manual) and design the operating model

I was Secondary Owner for both the **B&R Monitoring EUC (102418640)** and the **IR Variance Dataset (102421708)**. While I didn't dictate metric thresholds (group decision), I owned *how* the system operationalized them.

### Action

**1. Re-engineered the EUC into a Controlled PowerQuery Pipeline**
- Drove the transition from manual copy-paste workflows (v1.x) to a **PQ-parameterized v5.0 pipeline**
- Added file-path parameters, month-end parameters, schema-drift resilience, consistent transformations, and structured refresh
- Reduced operational error risk and enabled monthly "refresh-and-review"

**2. Established Monthly Release Protocol**
- Defined the runbook: create Use Copy, register via EUC Control Toolbar, update parameters, refresh queries/pivots, conduct QC checks, and approve final release
- The BA produced the "Lite" version; I sent communications and performed final approval of accuracy/controls

**3. Authored Critical PCM Sections**
- Wrote/updated sections of the Budgeting & Resourcing PCM (v2.0 → v3.1) that codified inputs, cadence, maker-checker, evidence handling, exception flow, and Segment-A variance pipeline integration
- Embedded the automated pipeline in BAU governance

**4. Designed Lineage Boundaries**
- Supported the approach to compute IR-level variance in 102421708 and append outputs into B&R reporting
- Met stakeholder cadence expectations without compromising traceability

### Result

**Technical Outcomes:**
- **Pivot table integrity:** Monthly refreshes sometimes reset month filters. I consistently identified and corrected these resets to prevent publishing incorrect Org PMO performance statuses
- **PowerQuery breakpoint diagnosis:** Isolated failures to specific query steps (schema drift, header promotion, data-type mismatches, parameter path errors) and corrected root causes to prevent corrupted or partial datasets

**Governance Outcomes:**
- Metric thresholds were group-approved; my impact was on the controlled operationalization and release
- I was Secondary Owner on the EUCs (Primary listed separately) with architecture and release-approval rights
- PCM ownership remained with CPMC Governance; I contributed as an author

**What I'm Proud Of:**
- Taking a fragile manual process and engineering it into something robust and auditable
- Balancing technical rigor with stakeholder pragmatism — meeting cadence without compromising traceability
- Building the release protocol so others could execute it without me

---

## Interview Angles

- **Tell me about a time you improved a data process:** Transformed manual copy-paste workflow into parameterized PowerQuery pipeline with governance controls
- **How do you handle complex, multi-source data?** Design lineage boundaries, standardize transformations, build refresh-and-review protocols
- **What does "audit-ready" mean to you?** Documented evidence paths, version control, maker-checker, traceable from source to output

---

## Skills Demonstrated

- Data pipeline design & modernization in Excel/PowerQuery under audit-grade controls
- Quality-gate design for recurring regulatory/controls reporting
- Operating model & governance authorship (PCM)
- Cross-functional alignment on metric lineage, cadence, and BAU embed
- Risk-mitigating architecture decisions in complex, multi-source reporting environments

---

## Keywords

PowerQuery • EUC governance • Data pipeline • Regulatory reporting • Audit controls • Version control • Schema drift • Operational resilience • BAU sustainability
