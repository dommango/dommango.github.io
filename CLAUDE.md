# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio site built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4. Static export (no server runtime).

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Build static site (output: out/)
npm test             # Run Vitest tests (watch mode)
npm test -- --run    # Run tests once
npm test -- Button   # Run tests matching "Button"
npm run lint         # ESLint check
npm run lint -- --fix # Auto-fix lint issues
tsc --noEmit         # Type check without emitting
```

## Build Process

The `prebuild` script runs automatically before `npm run build`:
1. **sync-career-content.js** - Copies career markdown from `$CAREER_DIR` (default: `/home/dom/personal/career`) to `content/career/`
2. **generate-resume-pdf.js** - Uses Puppeteer to generate PDF from HTML resume (gracefully skips if Chrome unavailable)

Static export config in `next.config.ts`: `output: 'export'` with `images.unoptimized: true`.

## Architecture

```
app/                      # Next.js App Router pages
├── layout.tsx            # Root layout with Header, Footer, ChatBot
├── page.tsx              # Home - ProfileHero, ProfileSummary, CareerThemes
├── career/               # Career timeline page
├── education/            # Education page
├── skills/               # Skills grid page
├── travel/               # Travel map page
├── blog/                 # Blog listing/posts
├── contact/              # Contact form (uses EmailJS)
└── api/contact/          # Contact API route

components/
├── layout/               # Header, Footer
├── profile/              # ProfileHero, ProfileSummary, CareerThemes
├── chat/                 # ChatBot widget
├── timeline/             # Career timeline
├── skills/               # Skills grid
├── education/            # Education section
├── travel/               # Travel map (react-simple-maps)
├── contact/              # Contact form
└── ui/                   # Reusable primitives (Card, Badge, Section, Button)

lib/
├── content/              # Content loaders parsing markdown with gray-matter
│   ├── profile.ts        # getProfile() - parses profile.md frontmatter
│   ├── roles.ts          # getRoles() - career positions
│   ├── education.ts      # getEducation()
│   ├── skills.ts         # getSkills()
│   ├── blog.ts           # getBlogPosts()
│   └── travel.ts         # getCountries()
├── constants.ts          # Shared constants
├── utils.ts              # Utility functions
└── services/             # External service integrations

content/                  # Markdown content (synced from CAREER_DIR)
├── career/               # Career entries with frontmatter
├── blog/                 # Blog posts
└── travel/               # Travel data (JSON)
```

## Content System

Career content lives in markdown files with gray-matter frontmatter:
- Source: `$CAREER_DIR` environment variable (default: `/home/dom/personal/career`)
- Build destination: `content/career/`
- Profile data parsed from `profile.md` frontmatter + content sections

Content loaders in `lib/content/` read files synchronously at build time for static generation.

## Environment Variables

```bash
# EmailJS for contact form
NEXT_PUBLIC_EMAILJS_SERVICE_ID=
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=

# Career content source (optional, defaults to /home/dom/personal/career)
CAREER_DIR=/path/to/career
```

## Key Dependencies

- **gray-matter** - Parse markdown frontmatter
- **react-simple-maps** / **d3-geo** / **topojson-client** - Travel map visualization
- **@emailjs/browser** - Contact form email delivery
- **date-fns** - Date formatting
- **clsx** - Conditional class composition

## Testing

Vitest with jsdom environment. Setup in `vitest.setup.ts` includes mocks for:
- `window.matchMedia`
- `IntersectionObserver`

Tests located in `__tests__/` directory. Use `@testing-library/react` for component tests.
