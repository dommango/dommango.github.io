# AI Collaborations Directory

Documented case studies of professional AI collaboration workflows demonstrating strategic human-AI partnership patterns.

## Purpose

This directory captures structured analyses of AI-assisted work sessions, serving as:
- Portfolio pieces demonstrating AI collaboration competency
- Methodology documentation for replicable workflows
- Evidence of quantified efficiency gains
- Prompting strategy reference material

## Directory Structure

```
ai-collaborations/
├── CLAUDE.md                           # This file
├── _index.md                           # Index by theme, time saved, AI functions
├── 20260301-documentation-preset.md    # Use case files (YYYYMMDD-slug.md)
├── 20260301-excel-automation.md
├── 20260301-html-template-system.md
└── ...
```

## Frontmatter Schema

```yaml
---
title: "Use Case Title"
date: 2026-03-01                        # ISO 8601 date
primary_theme: [automation, governance] # Array of themes
ai_functions: [synthesis, generation]   # What AI did
leverage_type: [cognitive, executional] # How AI was leveraged
confidence_level: 0.95                  # 0-1 scale
estimated_time_saved_hrs: 6.0           # Quantified impact
tags: [tag1, tag2]                      # Searchable tags
role: "../roles/citi-svp-transformation.md"  # Link to role
interview_ready: true                   # Portfolio-ready?
source_doc: "filename.pdf"              # Original PDF in source-docs/
status: partial                         # Optional: if incomplete
notes: "Continues in next PDF"          # Optional: processing notes
---
```

## Content Structure

Each use case merges three document types from source PDFs:

### From Internal Version
- **Business_Context**: Full enterprise details, specific challenges
- **Strategic_Framing**: Alignment to company goals
- **Deliverables_Produced**: Specific artifacts, filenames
- **Efficiency_Impact**: Quantitative metrics

### From Meta Version
- **Cognitive_Offloading**: What tasks AI handled
- **Framework_Generation**: Novel patterns created
- **Decision_Structuring**: How AI organized complex decisions
- **Prompting_Analysis**: Effective vs ineffective prompts
- **Future_Recommendations**: Lessons learned

### From Sanitized Version
- **Title & Context**: Portfolio-ready framing
- **Initial_Challenge**: Anonymized obstacles
- **AI_Strategy_Used**: Transferable approach
- **Iteration_and_Refinement**: Collaboration cycles
- **Final_Output**: Deliverable summary
- **Scalability_Potential**: Industry applications
- **Resume_Ready_Bullets**: Key accomplishments

## Section Markers

Use HTML comments to track content origin:
```markdown
<!-- internal -->
Content from Internal version...

<!-- meta -->
Content from Meta version...

<!-- sanitized -->
Content from Sanitized version...
```

## Naming Conventions

- **Files**: `YYYYMMDD-slug-title.md` (e.g., `20260301-excel-automation.md`)
- **Slugs**: kebab-case, descriptive but concise
- **Tags**: lowercase, hyphenated for multi-word

## Taxonomies

### Primary Themes
- `automation` - Workflow automation, process efficiency
- `governance` - Standards, compliance, quality control
- `product_dev` - Building tools, templates, systems
- `research` - Information gathering, analysis
- `strategy` - Planning, decision-making

### AI Functions
- `synthesis` - Combining information into coherent outputs
- `generation` - Creating new content, code, documentation
- `analysis` - Examining data, identifying patterns
- `reframing` - Restructuring problems or solutions
- `validation` - Checking accuracy, quality assurance
- `retrieval` - Finding information, research
- `pattern_recognition` - Identifying trends, anomalies

### Leverage Types
- `cognitive` - Offloading mental work (planning, analysis)
- `executional` - Offloading implementation (code, writing)
- `strategic` - AI as co-designer, not just executor
- `communicative` - Adapting content for audiences
- `automation` - Replacing manual repetitive tasks

## Source Documents

Original PDFs stored in `/home/dom/personal/career/source-docs/`:
- `AI_Collaboration (1-20) - Mar 16 2026 - 10-07 AM.pdf`
- `AI collaboration (21-40) - Mar 16 2026 - 10-10 AM.pdf`
- `AI collaboration (41-60) - Mar 16 2026 - 10-12 AM.pdf`
- `AI Collaboration (61-86h - Mar 16 2026 - 10-15 AM.pdf`

## Processing Workflow

1. **Read PDF** - Extract use cases (typically 3 versions each)
2. **Create file** - Use naming convention `YYYYMMDD-slug.md`
3. **Merge versions** - Combine Internal + Meta + Sanitized
4. **Mark sections** - Use HTML comments for origin tracking
5. **Update _index.md** - Add to appropriate categories
6. **Handle partials** - Mark `status: partial` if incomplete

## Integration Points

- **Role files**: Link via `role:` frontmatter field
- **Skills**: Cross-reference from `skills/_index.md` (AI collaboration, prompt engineering)
- **Website**: Synced via `sync-career-content.js` prebuild script

## Current Status

| PDF | Use Cases | Status |
|-----|-----------|--------|
| 1-20 | 3 cases | Complete |
| 21-40 | 5 cases | Complete |
| 41-60 | 1 case | Complete |
| 61-73 | 0 new (supplementary) | Complete |
| 74-86 | 0 new (supplementary) | Complete |

**All PDFs processed.** 9 unique use cases extracted and documented.
