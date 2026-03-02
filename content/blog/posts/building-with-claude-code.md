---
title: "Building a Personal Website Through Vibecoding with Claude Code"
date: 2026-03-01
description: "How I built this entire website using AI-assisted development—lessons learned from vibecoding with Claude Code."
tags: [ai, claude-code, vibecoding, web-development, next-js]
published: true
---

## The Experiment

This website exists because I wanted to test a hypothesis: Can AI-assisted development (what some call "vibecoding") produce a production-quality website?

The answer, after several sessions with Claude Code, is a qualified **yes**—with important caveats.

## What is Vibecoding?

"Vibecoding" is a term that's emerged to describe AI-assisted software development where you describe what you want in natural language and let an AI handle the implementation details. Instead of writing every line of code yourself, you collaborate with an AI that can:

- Generate code based on descriptions
- Understand existing codebases
- Make edits across multiple files
- Run builds and fix errors
- Suggest improvements and alternatives

It's not "no-code"—you still need to understand what's happening. But it shifts the work from typing syntax to describing intent.

## How This Website Was Built

### The Stack

- **Next.js 16** with React 19 and TypeScript
- **Tailwind CSS 4** for styling
- **gray-matter** for markdown content parsing
- Static site export (no server runtime)

### The Process

1. **Initial scaffolding**: Started with a basic Next.js template
2. **Design direction**: Specified dark mode primary, gold accents, modern minimalist aesthetic
3. **Component development**: Described component needs; Claude Code generated implementations
4. **Content structure**: Created markdown-based content system for career data
5. **Iterative refinement**: Multiple rounds of "this doesn't look right, try X instead"

### What Worked Well

**Speed of iteration**: Changes that might take hours of googling and trial-and-error happen in minutes. "Make the hover state more subtle" produces immediate results.

**Consistency**: Once patterns are established, Claude Code applies them across files. No forgetting to update one place while updating another.

**Cross-cutting changes**: "Update all buttons to use the gold accent color" affects every file simultaneously.

**Build error resolution**: When TypeScript complains, Claude Code can usually fix it faster than I could diagnose it.

### What Required Human Judgment

**Design decisions**: AI can implement your vision, but you need to have a vision. "Make it look professional" isn't specific enough.

**Content strategy**: What to highlight, what to emphasize, how to tell your story—these require human understanding of context and goals.

**Quality control**: Generated code isn't always optimal. You still need to review, test, and verify.

**Edge cases**: AI-generated code works for the happy path. Edge cases and error handling often need human attention.

## Lessons Learned

### 1. Specificity Matters

Vague instructions produce vague results. "Add a contact section" gives you something generic. "Add a contact section with email link styled as a prominent gold button, below the profile summary" gives you what you actually want.

### 2. Iteration is the Process

Don't expect perfection on the first try. Vibecoding is a conversation. You describe, it implements, you refine, it adjusts. The back-and-forth is the process, not a bug.

### 3. Understanding Still Required

You can vibecode a website without knowing React syntax. You can't vibecode a good website without understanding component architecture, state management, and CSS fundamentals. AI amplifies your capabilities; it doesn't replace them.

### 4. Context is Everything

Claude Code works better when it understands the project. A well-structured codebase with clear patterns produces better AI-assisted changes than a messy project with inconsistent conventions.

## The Meta-Showcase

There's something fitting about using AI to build a website that showcases interest in AI. The website itself becomes evidence of the technology's capabilities—and its limitations.

If you're reading this, you're experiencing the output of vibecoding. Judge for yourself whether it works.

## What's Next

This is version 1.0. Future updates might include:

- More sophisticated blog features (comments, search)
- Project showcases with interactive elements
- Performance optimizations
- Mobile experience refinements

All likely built the same way: through conversation with Claude Code.

---

*This post was written by a human (me), but the website it lives on was built with significant AI assistance. The line between human and AI contribution is blurry—and that's kind of the point.*
