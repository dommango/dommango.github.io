# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a **professional experience database** — a structured knowledge base capturing career history, skills, competencies, and interview-ready examples. It's designed to support career development activities: interviews, job applications, performance reviews, and self-assessment.

Unlike a traditional codebase, this is a **documentation system** organized as interconnected Markdown files with YAML frontmatter for structured metadata. There is no build process, tests, or deployment — the primary "output" is preparation materials extracted from the structured content.

## Architecture & Data Model

### Core Directory Structure

```
├── profile.md              # Professional identity, summary, contact info
├── context.md              # Current career positioning (input to materials)
├── roles/                  # Employment history (9 roles, reverse chronological)
│   ├── _index.md          # Timeline, by industry, by function
│   └── {company}-*.md     # Individual role details
├── projects/              # Notable projects with outcomes
│   └── _index.md          # Project index and links
├── stories/               # Interview-ready examples (STAR/CAR format)
│   └── _index.md          # Stories indexed by competency
├── skills/                # Skills inventory with proficiency levels
│   └── _index.md          # Technical, soft, domain skills with evidence
├── targets/               # Job search pipeline (companies under consideration)
│   └── _index.md          # Bucketed table with fit_tier, role_archetype, status
├── achievements/          # Timeline of notable accomplishments
├── certifications/        # Professional credentials and training
├── education/             # Degrees, coursework, GPA
│   ├── carnegie-mellon-mba.md
│   ├── rutgers-bs-finance.md
│   └── coursework/_index.md
├── leadership/            # Mentorship, teams led, communities
├── ai-collaborations/     # AI partnership case studies (9 cases, YYYYMMDD-slug.md)
│   └── CLAUDE.md          # Processing spec for this directory
├── images/                # Logos and visual assets (DM-LOGO-WB.jpg)
├── source-docs/           # Supporting documents (PDFs, transcripts)
├── _processing/           # Scratch space (currently empty)
└── Mangonon_Dominic_Resume.{pdf,html}  # Generated resume artifacts
```

### Key Structural Concepts

**Frontmatter Metadata**: All content files use YAML frontmatter for structured data:

```markdown
---
title: "Role Title"
company: "Company Name"
start_date: 2021-09-07
end_date: present
tags: [tag1, tag2]
skills: [skill1, skill2]
---
```

**Index Files**: Each category has an `_index.md` that serves as a table of contents and cross-reference hub:

- Provides timelines and tables summarizing content
- Groups content multiple ways (chronological, by industry, by function, by competency)
- Links to individual detailed files
- Identifies patterns and themes

**Evidence-Based Skills**: The `skills/_index.md` file links skill claims back to specific roles and projects where they were demonstrated (e.g., "Complex-to-Simple Communication: CEO dashboards at Citi").

**Tagging System**: Two primary tag taxonomies:

- **Competencies**: leadership, problem-solving, communication, collaboration, strategic-thinking, execution, innovation
- **Impact Types**: revenue, efficiency, team-growth, customer-satisfaction, technical-excellence

### Data Relationships

The database is interconnected via **internal markdown links**:

- Roles reference relevant skills via links to `../skills/_index.md`
- Stories are indexed by competency in `stories/_index.md`
- Achievements link back to roles that produced them
- Each role file is linked from both `roles/_index.md` and potentially from projects/achievements

### Target Companies Pipeline

`targets/_index.md` is the active job-search pipeline (last updated 2026-05-05). It's a single table per bucket, not individual files.

- **Buckets**: `paraform-tdi` (50 AI-native companies from Paraform's Talent Density Index), `ai-consulting` (services firms with AI practices), `fintech` (financial services operators + adjacent infra/investors).
- **Key fields**: `fit_tier` (A/B/C/pass — blank means not yet reviewed), `role_archetype` (strategy-bizops, transformation, enterprise-gtm, chief-of-staff, product-strategy), `stage` (seed / series-a-b / scale-up / mature), `status` (researching → interested → applied → networking → interviewing → passed / on-hold), `network` (warm intros), `last_touch` (YYYY-MM-DD), `paraform_rank` / `paraform_score` (only for `paraform-tdi`).
- **Workflow**: review rows with blank `fit_tier` first; advance `status` as outreach progresses; record names in `network` when warm intros are identified.

## Common Development Tasks

### Adding a New Role

1. Create file: `roles/{company-descriptive-name}.md`
2. Add frontmatter with: title, company, start_date, end_date, employment_type, level, manager, team_size, tags (enterprise-transformation, regulatory, etc.), skills
3. Structure content:
   - Summary (1-2 sentences)
   - Key Responsibilities (bulleted list)
   - Notable Achievements (organized by category, with metrics/impact)
   - Performance History (if available)
4. Update `roles/_index.md`:
   - Add row to Timeline table
   - Add to appropriate "By Industry" section
   - Add to appropriate "By Function" section
   - Update Career Progression ascii diagram if needed

### Adding a Story (Interview Example)

1. Create file: `stories/{story-slug}.md`
2. Add frontmatter with: title, competency (single), interview_ready: true/false, tags (optional)
3. Structure as STAR or CAR format:
   - **Situation**: Context and challenge
   - **Task**: Your specific responsibility
   - **Action**: What you did
   - **Result**: Quantified outcome or learning
4. Update `stories/_index.md`:
   - Add to appropriate competency section
   - Add to "Interview-Ready" if `interview_ready: true`

### Updating Skills Inventory

1. Edit `skills/_index.md`
2. For each skill, provide:
   - Name and proficiency level (Expert, Advanced, Intermediate, Practitioner, Developing)
   - Evidence link back to specific role or project where demonstrated
3. Organized into:
   - Technical Skills (Excel, VBA, SQL, etc.)
   - Soft Skills (communication, stakeholder management, etc.)
   - Domain Knowledge (regulatory compliance, wealth management, etc.)

### Adding Education/Certification

1. Create file: `education/{institution-degree}.md` or `certifications/{cert-name}.md`
2. Include: institution, degree/cert, graduation date, relevant courses/details, GPA
3. Update corresponding `_index.md` file
4. For coursework: add to `education/coursework/_index.md` with course name, grade, relevance

## Content Guidelines

### Metadata Standards

- **Dates**: ISO 8601 format (YYYY-MM-DD), use "present" for current roles
- **Employment Type**: full-time, contractor, intern, part-time
- **Level**: Use company-specific leveling (e.g., "C14 / SVP" for Citi)
- **Team Size**: Number of direct reports or team members managed
- **Proficiency Levels**: Expert, Advanced, Intermediate, Practitioner, Developing
- **Tags**: Use kebab-case (lowercase with hyphens)

### Writing Style

- **Role Summaries**: 1-2 sentences, action-oriented
- **Achievements**: Lead with impact (metric/outcome), then mechanism. Format: "Achievement Name - outcome, method"
- **Links**: Use relative markdown links (`../roles/file.md`) for internal references
- **Proficiency Evidence**: Link claims to supporting work (e.g., "[BNP Paribas](../roles/bnp-paribas-client-services.md) - 6 macros for trading desk")

### Completeness Checklist

Before considering content ready:

- [ ] All roles have frontmatter with required fields
- [ ] Index files link to and describe all content
- [ ] Achievement metrics are quantified where possible (%, $M, count)
- [ ] Skills have evidence links back to roles/projects
- [ ] Competency tags align with taxonomy
- [ ] Internal links are valid and relative

## Usage Patterns

### For Interview Prep

1. Browse `stories/_index.md` grouped by competency
2. Check `interview_ready: true` flag to find polished examples
3. Pull context from `roles/_index.md` to understand timeline
4. Reference `skills/_index.md` to discuss proficiency levels

### For Resume/Application Materials

1. Use `profile.md` for professional summary language
2. Pull achievements from role files (quantified, impact-focused)
3. Reference `skills/_index.md` to identify relevant skills with evidence
4. Check `education/` and `certifications/` for credentials to highlight

### For Self-Assessment & Career Planning

1. Review `education/coursework/` for knowledge areas and confidence levels
2. Use `skills/_index.md` to assess and track proficiency growth
3. Check `leadership/` for team and mentoring experience
4. Analyze `achievements/` for impact patterns and career themes

## Tools & Queries

### Find All Roles in an Industry

- See `roles/_index.md` "By Industry" section
- Example: Financial Services banking roles: Citi, Morgan Stanley, BNP Paribas, Bear Stearns

### Find Stories by Competency

- See `stories/_index.md` "By Competency" sections
- All stories tagged with matching competency tag

### Find Skills with Evidence

- See `skills/_index.md` organized by Technical, Soft, and Domain
- Each skill includes a link to the role/project demonstrating it

### Build Interview Story Set

- Filter `stories/` for `interview_ready: true`
- Verify competency coverage across required domains

### Adding an AI Collaboration Case Study

See `ai-collaborations/CLAUDE.md` for the full processing spec. Key points:

1. Create file: `ai-collaborations/YYYYMMDD-{slug}.md`
2. Frontmatter includes: title, date, primary_theme, ai_functions, leverage_type, confidence_level, estimated_time_saved_hrs, role (link), interview_ready, source_doc
3. Content merges three versions from source PDFs: Internal (business context), Meta (cognitive patterns), Sanitized (portfolio-ready)
4. Use HTML comments (`<!-- internal -->`, `<!-- meta -->`, `<!-- sanitized -->`) to track content origin
5. Update `ai-collaborations/_index.md` with new entry

**Taxonomies**: themes (automation, governance, product_dev, research, strategy), AI functions (synthesis, generation, analysis, reframing, validation, retrieval, pattern_recognition), leverage types (cognitive, executional, strategic, communicative, automation)

## File Format Notes

- All content is **Markdown** with **YAML frontmatter**
- No special processing or build system required
- Internal links use relative paths (`../roles/file.md`)
- When referencing external links (e.g., LinkedIn URLs), use absolute URLs
- Source documents (PDFs, Word docs) are archived in `source-docs/` for reference

## Career Context

**Current positioning** (from `context.md`): Exploring opportunities at the intersection of enterprise transformation and AI. Target roles leverage both business acumen and technical curiosity — AI-powered transformation, enterprise AI strategy, building/scaling new capabilities.

**Career arc**: Operations (BNP) → Strategy Consulting (PwC/Strategy&) → Advisory (Treliant) → Corporate Strategy (Morgan Stanley) → Enterprise Transformation (Citi)

**Key themes** to reinforce when crafting materials:

1. **Complex-to-Simple Translation** — synthesizing disorganized info into clear deliverables
2. **Process Optimization & Efficiency** — Hot Keys, VBA macros, streamlined workflows
3. **Regulatory & Risk Expertise** — Consent Order remediation, risk management
4. **Financial Services Breadth** — banking ops, consulting, corporate transformation
5. **Quantitative Foundation** — CMU Tepper MBA, 720 GMAT
6. **AI Partnership** — documented via `ai-collaborations/` (33.9 hrs saved across 9 cases)

## Repository Notes

- **Not a git repository** — there is no `.git/` directory. Don't try to `git commit`, `git log`, or `git diff`; changes are saved in place.
- **No build system** — `package.json` is empty. Content is consumed manually or synced into a separate personal-website project (see the `sync-career-content.js` reference in `ai-collaborations/CLAUDE.md`).
- **Resume artifacts** — `Dominic_Mangonon_Resume.pdf` and `Mangonon_Dominic_Resume.html` at the repo root are generated outputs, not sources. Source content lives in `profile.md`, `roles/`, `skills/`, etc.
- **`_processing/`** is a scratch directory, currently empty.
