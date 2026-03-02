---
title: "Strategic Investment Data Architecture"
company: "Citi"
project_type: "Data Architecture & Governance"
start_date: 2022-06-01
end_date: 2023-09-30
scale: "Enterprise-wide"
budget: "$1.1B visibility across 150+ strategic investments"
tags: [data-architecture, financial-governance, strategic-reporting, portfolio-management, data-reconciliation]
skills: [data-modeling, systems-integration, stakeholder-management, governance-design, financial-analysis]
competencies: [problem-solving, strategic-thinking, execution, communication]
impact_types: [efficiency, regulatory-compliance, technical-excellence]
---

## Executive Summary

Re-engineered Citi's strategic investment data architecture to provide leadership with real-time visibility into ~$1.1B of spend across 150+ strategic investments. Built end-to-end data lineage, reconciliation frameworks, and governance processes that unified fragmented reporting across three core systems (RET, iCAPS, PTS).

**Scope:** Data architecture design → System reconciliation → Governance framework → Executive reporting

---

## Strategic Context

**Business Challenge:** Citi's strategic investment portfolio lacked a unified view. Leadership couldn't answer basic questions: *How much are we spending? Where? On what outcomes?* Data was fragmented across multiple systems with inconsistent definitions, different refresh cycles, and no clear ownership.

**Systems Landscape:**
- **RET (Gold Source):** Investment tracking system of record
- **iCAPS:** Project and program management data
- **PTS:** Resource and timeline tracking

**Regulatory Pressure:** Article XII.1.e requirements demanded auditable governance over strategic investments, with clear evidence of oversight and financial controls.

**Transformation Objective:** Create a **single source of truth** for strategic investment data that could:
- Support executive decision-making with timely, accurate information
- Satisfy regulatory requirements for auditability and evidence
- Enable portfolio segmentation and prioritization
- Reduce manual reconciliation effort

---

## My Core Contributions

### 1. Data Architecture Design

**Problem:** No documented data lineage. Teams didn't know which system was authoritative for which fields.

**What I Did:**
- Mapped **field-level sourcing logic** across all three systems: which fields came from where, when they refreshed, who owned them
- Documented **data quality rules** and validation criteria for each field
- Created **single management view** specification with explicit definitions to prevent misinterpretation
- Established **refresh frequency and success criteria** for automated data pulls

**Outcome:**
- **Field Inventory Document:** Comprehensive mapping of 50+ data fields with sourcing logic, refresh cadence, and QC approach
- **Pre-populated vs. manual field classification:** Minimized free-text entry to reduce EUC risk
- Enabled downstream reporting with defensible, cited definitions

### 2. Cross-System Reconciliation

**Problem:** Week-over-week variance reporting was inconsistent. Numbers didn't match across systems, eroding leadership confidence.

**What I Did:**
- Built **reconciliation workbooks** showing field-level alignment between RET, iCAPS, and PTS
- Created **illustrative one-time reconciliation** with week-over-week snapshots and variance explanations
- Documented **exception handling rules** for known discrepancies (timing differences, data entry lag)
- Established **tolerance thresholds** for acceptable variance

**What Made It Hard:**
- **Different taxonomies:** Systems used different naming conventions for the same concepts
- **Timing differences:** Data refreshed at different cadences, creating apparent mismatches
- **Ownership ambiguity:** No clear accountability for cross-system consistency

**Outcome:**
- **Reconciliation Framework:** Repeatable process for validating data consistency
- Leadership confidence in reported numbers increased significantly
- Variance explanations available on demand for any reporting period

### 3. Governance Architecture

**Problem:** Data quality was everyone's job, which meant it was no one's job.

**What I Did:**
- Designed **QC decision matrices** defining Pass/Fail/N/A criteria for data quality checks
- Established **data stewardship model** with clear ownership by field and system
- Created **escalation constructs** for data quality issues
- Built **governance calendar** aligning data pulls with reporting cadence

**Outcome:**
- **Data Governance Framework:** Documented roles, responsibilities, and checkpoints
- Sustainable BAU process owned by portfolio management team
- Quality issues caught and resolved before executive reporting

### 4. Executive Reporting Enablement

**Problem:** Leadership wanted a dashboard, but the underlying data wasn't trustworthy or well-defined.

**What I Did:**
- Created **Board-grade dashboard framework** with defensible, sourced definitions
- Built **portfolio segmentation logic** enabling drill-down by category, business unit, and lifecycle phase
- Documented **metric calculations** with explicit formulas and data sources
- Designed **variance tracking** showing week-over-week changes with root cause explanations

**Outcome:**
- **Strategic Investment Dashboard:** Single view of $1.1B portfolio with real-time data
- **Segmentation Capabilities:** Filter by priority tier, investment type, delivery risk
- Executive confidence in data enabled faster decision-making

---

## Key Outcomes

**Technical:**
- Unified data architecture across 3 core systems
- 50+ field mappings with documented lineage
- Automated reconciliation reducing manual effort by ~60%

**Business:**
- $1.1B strategic investment visibility for executive leadership
- Portfolio segmentation enabling prioritization decisions
- Reduced reporting cycle time from days to hours

**Governance:**
- Sustainable data stewardship model
- Evidence-based quality controls satisfying regulatory requirements
- Foundation for future automation and AI-powered analytics

---

## Lessons Learned

1. **Start with field-level clarity:** Abstract "data architecture" becomes concrete when you document every field's source, owner, and quality criteria

2. **Build trust through reconciliation:** Leadership won't use data they don't trust. Showing your work (reconciliation evidence) builds confidence

3. **Design for BAU first:** If the architecture requires your ongoing involvement to maintain, it's not done. Sustainability is the goal

4. **Cross-system integration is a people problem:** Technical reconciliation is straightforward; getting teams to agree on ownership and definitions is the real challenge

---

## Interview Angles

- **How do you approach data quality challenges?** Start with field-level sourcing, build reconciliation frameworks, establish clear ownership
- **How do you build trust in data?** Transparency about methodology, documented definitions, evidence of validation
- **How do you design for sustainability?** BAU teams must be able to execute without you; document everything, train owners

---

## Keywords

Data architecture • Field-level sourcing • Cross-system reconciliation • Portfolio visibility • Executive dashboards • Data governance • Financial tracking • Strategic investments

---

**Prepared:** March 1, 2026
**Associated Role:** [Citi SVP Transformation](../roles/citi-svp-transformation.md)
**Related Projects:** [MRA Reporting Transformation](citi-mra-transformation.md)
