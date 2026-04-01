---
title: "PowerShell Markdown File Combiner"
date: 2026-03-02
primary_theme: [automation]
ai_functions: [generation, analysis, validation]
leverage_type: [automation, executional]
confidence_level: 0.83
estimated_time_saved_hrs: 1.2
tags: [powershell, markdown, windows, scripting, sop, file-automation]
role: "../roles/citi-svp-transformation.md"
interview_ready: true
source_doc: "AI collaboration (21-40) - Mar 16 2026 - 10-10 AM.pdf"
---

# PowerShell Markdown File Combiner

AI-assisted development of a reliable PowerShell workflow to merge multiple Markdown files into a single consolidated artifact.

---

## Executive Summary

<!-- sanitized -->

A practitioner needed a dependable method to merge multiple Markdown files from a single directory into one consolidated document while excluding non-Markdown files. The environment is Windows with PowerShell available.

**Core Challenge:** Manual concatenation was slow and error-prone. A previous attempt failed due to a relative-path assumption, causing `Get-Content` to look outside the intended folder.

**Goal:** Provide a minimal one-liner to operate directly in the target directory, ensure robust path handling with `-LiteralPath $_.FullName`, enforce UTF-8 encoding and simple, readable section headers, and offer an optional date-tag output pattern for governance.

---

## Business Context

<!-- internal -->

The working session focused on creating a reliable way to combine multiple `.md` files into a single Markdown document while ignoring PDFs. The user maintains preset prompts and schemas in local and OneDrive folders and required a fast, reproducible approach that aligns with internal naming and governance preferences (UTF-8 encoding, date-tagged variants, no spaces in key names). The immediate need arose while working in a local folder: `C:\Users\dm61019\Custom Presets`.

---

## Strategic Framing

<!-- internal -->

**Objective:** Enable a low-friction command (one-liner) and an optional reusable script to concatenate Markdown files, alphabetize input, add section headers, and write to a combined artifact, with options for recursion, ordering, and date-tagged outputs. Quality controls included using full paths to avoid path resolution errors and enforcing UTF-8 encoding.

---

## AI Utilization

<!-- internal -->

- Drafted a robust PowerShell script (`Combine-Markdown.ps1`) with ordering, recursion, and customizable output
- Produced a minimal **one-liner** for quick execution within the target directory
- Diagnosed and corrected a path-resolution error by switching `Get-Content $_` to `Get-Content -LiteralPath $_.FullName`
- Authored step-by-step instructions and optional enhancements (date-tagged output, TOC, ordering, exclusions)

---

## Deliverables Produced

<!-- internal -->

### 1. One-liner command (final corrected form):
```powershell
Get-ChildItem . -Filter *.md |
  Sort-Object Name |
  ForEach-Object {"`n---`n# $($_.BaseName)`n---`n"; Get-Content -LiteralPath $_.FullName -Raw} |
  Out-File ".\Combined-Markdown.md" -Encoding utf8
```

### 2. Optional date-tag variant:
```powershell
$dt = (Get-Date).ToString('yyyyMMdd'); Get-ChildItem . -Filter *.md | Sort-Object Name |
  ForEach-Object {"`n---`n# $($_.BaseName)`n---`n"; Get-Content -LiteralPath $_.FullName -Raw} |
  Out-File ".\Combined-Markdown_$dt.md" -Encoding utf8
```

### 3. Reusable script
`Combine-Markdown.ps1` (alphabetical/default; supports recursion, custom order, metadata separators, UTF-8 no BOM).

---

## Efficiency Impact

<!-- internal -->

- **Time saved:** ~1.2 hours vs. manual copy/paste and formatting for typical 10-15 files
- **Error reduction:** Eliminates common path mistakes by using `-LiteralPath $_.FullName` and consistent encoding
- **Repeatability:** Single command or script invocation supports future runs with minimal effort and consistent output

---

## Cognitive Offloading

<!-- meta -->

The AI handled script drafting, command minimization, and policy-aligned choices (UTF-8 encoding, deterministic ordering). It also retained the operational context (single directory scope, exclusion of PDFs) and generated concise usage instructions.

---

## Framework Generation

<!-- meta -->

Produced both a reusable script framework and a single-command pipeline:
- Input discovery (`Get-ChildItem -Filter *.md`)
- Deterministic ordering (`Sort-Object Name`)
- Content streaming (`Get-Content -LiteralPath $_.FullName -Raw`)
- Output control (`Out-File -Encoding utf8`)
- Optional governance extensions (date-tag, recursion, exclusions)

---

## Decision Structuring

<!-- meta -->

Key design decisions:
- Use **full literal paths** to avoid relative-path errors
- Alphabetical ordering as default for predictable diffs
- UTF-8 encoding for broad Markdown compatibility
- Minimal, readable section headers for traceability

---

## Prompting Analysis

<!-- meta -->

- User intent evolved from a multi-file script to a fast one-liner
- Error surfaced (path not found) and rapid correction by adjusting the content-read method
- Step-by-step instructions provided to ensure successful execution without prior scripting experience

---

## Future Recommendations

<!-- meta -->

- Add a `-Recurse` and `-Exclude` toggle to the one-liner for larger repositories
- Introduce a pre-flight check to count source files and a post-check to validate section counts
- Optionally generate a table of contents with anchors based on file names for longer outputs

---

## AI Strategy Used

<!-- sanitized -->

- Provide a minimal one-liner to operate directly in the target directory
- Ensure robust path handling with `-LiteralPath $_.FullName`
- Enforce UTF-8 encoding and simple, readable section headers
- Offer an optional date-tag output pattern for governance

---

## Iteration and Refinement

<!-- sanitized -->

- Started with a general script solution
- Added a simplified one-liner
- Resolved a path error by switching to full-path reads
- Delivered step-by-step usage instructions and variants (date-tag, ordering)

---

## Final Output

<!-- sanitized -->

A working one-liner that concatenates all `.md` files (alphabetical order), adds per-file headers, and writes `Combined-Markdown.md` in the same directory.

```powershell
Get-ChildItem . -Filter *.md |
  Sort-Object Name |
  ForEach-Object {"`n---`n# $($_.BaseName)`n---`n"; Get-Content -LiteralPath $_.FullName -Raw} |
  Out-File ".\Combined-Markdown.md" -Encoding utf8
```

---

## Scalability Potential

<!-- sanitized -->

- Extend with `-Recurse` for subdirectories
- Add exclusion patterns, custom ordering, or table of contents generation
- Integrate into CI/local task runners for repeatable builds

---

## Resume-Ready Bullets

- Automated Markdown consolidation on Windows via PowerShell, producing deterministic, UTF-8 artifacts and excluding non-target file types
- Resolved path-handling issues using literal full paths, improving reliability across environments
- Authored reusable one-liner and script patterns with governance-friendly date-tag options

---

## Status

**Complete** - All sections (Internal, Meta, Sanitized) have been merged.
