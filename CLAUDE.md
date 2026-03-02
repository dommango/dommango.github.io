# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# Personal Website - Development Guidelines

A Next.js portfolio site built with TypeScript, React 19, and Tailwind CSS. These guidelines ensure consistency, performance, and maintainability.

---

## Project Overview

**Stack:** Next.js 16 • React 19 • TypeScript • Tailwind CSS 4 • gray-matter

**Key Features:**
- Static site export (no server runtime)
- Markdown-based content with gray-matter parsing
- Pre-build career content sync from external directory
- TypeScript strict mode enabled
- ESLint + Next.js best practices
- Vitest for unit/component testing with jsdom

**Structure:**
```
components/
├── ui/              # Reusable UI primitives (Card, Button, Badge, Section)
├── layout/          # Layout components (Header, Footer)
├── profile/         # Profile section (Hero, Summary, Themes)
├── skills/          # Skills display (Grid)
├── timeline/        # Timeline component
├── education/       # Education section
└── career/          # Career-related components

app/                 # Next.js App Router pages
├── api/             # API routes (contact form endpoint)
├── career/
├── education/
├── skills/
└── page.tsx         # Home page

content/             # Markdown content (synced at build time)
├── career/          # Career entries (parsed with gray-matter)

lib/                 # Utilities
├── content/         # Content loading functions

public/              # Static assets
scripts/             # Build scripts
├── sync-career-content.js  # Copy career files from CAREER_DIR
├── process-logos.js        # Logo processing utility
```

---

## Quick Reference

### Common Commands

**Development:**
```bash
npm run dev              # Start dev server (http://localhost:3000)
npm run lint            # Check code quality with ESLint
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report
```

**Building & Deployment:**
```bash
npm run build            # Build static site (output to 'out/')
npm start               # Serve production build locally
```

**Running Specific Tests:**
```bash
npm test -- Button      # Run tests matching filename "Button"
npm test -- --run       # Run tests once (without watch)
npm test -- components/ # Run tests in specific directory
```

**Debugging:**
```bash
npm run lint -- --fix   # Auto-fix ESLint issues
tsc --noEmit            # Check TypeScript without emitting
npm run build 2>&1 | grep error  # Check build errors only
```

### Build Process

**Pre-build Hook:**
The `prebuild` script runs automatically before `npm run build`:
1. Copies career content from `$CAREER_DIR` (default: `/home/dom/career`) to `content/career/`
2. Set `CAREER_DIR` env var to override the source directory

**Static Export:**
- Next.js is configured with `output: 'export'` — builds a static site
- Images use `unoptimized: true` — no server-side image optimization
- Output directory: `out/`
- No API routes execute at runtime (must be serverless handlers or removed for static export)

---

## Component Architecture

### Component Organization

**UI Primitives** (`components/ui/`)
- Reusable, unstyled-friendly building blocks
- Pure, controlled components
- No business logic
- Examples: `Button`, `Card`, `Badge`, `Section`

**Feature Components** (`components/*/`)
- Domain-specific components
- Can contain business logic
- Combine UI primitives
- Examples: `ProfileHero`, `SkillsGrid`, `Timeline`

**Layout Components** (`components/layout/`)
- Page structure (Header, Footer)
- Global navigation
- Persisted across routes

### Component Patterns

#### 1. Composition Over Inheritance

```typescript
// ✅ GOOD: Compound components
export function Card({ children, className }: CardProps) {
  return <div className={clsx('...', className)}>{children}</div>
}

export function CardHeader({ children, className }: CardSectionProps) {
  return <div className={clsx('...', className)}>{children}</div>
}

// Usage
<Card>
  <CardHeader>Title</CardHeader>
  <CardBody>Content</CardBody>
</Card>
```

#### 2. Props Patterns

```typescript
// ✅ GOOD: Explicit props interface
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: () => void
  className?: string
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  className
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        'font-medium transition-colors',
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
        variant === 'secondary' && 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        variant === 'outline' && 'border-2 border-gray-300 text-gray-900 hover:border-gray-400',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2',
        size === 'lg' && 'px-6 py-3 text-lg',
        className
      )}
    >
      {children}
    </button>
  )
}
```

#### 3. Render Props for Complex Logic

```typescript
// ✅ Use for loading states, data fetching
interface DataLoaderProps<T> {
  data: T | null
  loading: boolean
  error: Error | null
  children: (data: T | null, loading: boolean, error: Error | null) => React.ReactNode
}

export function DataLoader<T>({ data, loading, error, children }: DataLoaderProps<T>) {
  return <>{children(data, loading, error)}</>
}

// Usage
<DataLoader data={skills} loading={isLoading} error={error}>
  {(data, loading, error) => {
    if (loading) return <Spinner />
    if (error) return <ErrorMessage error={error} />
    return <SkillsGrid skills={data} />
  }}
</DataLoader>
```

---

## Styling

### Tailwind CSS with clsx

All components use **Tailwind CSS** for styling. Use `clsx` for conditional class composition:

```typescript
import { clsx } from 'clsx'

interface SectionProps {
  children: React.ReactNode
  variant?: 'default' | 'elevated'
  className?: string
}

export function Section({ children, variant = 'default', className }: SectionProps) {
  return (
    <section
      className={clsx(
        'px-6 py-12 md:px-8 md:py-16',
        variant === 'default' && 'bg-white',
        variant === 'elevated' && 'bg-gray-50 shadow-sm',
        className
      )}
    >
      {children}
    </section>
  )
}
```

### Responsive Design

Use Tailwind's responsive prefixes (mobile-first):

```typescript
// ✅ Mobile-first approach
<div className="px-4 md:px-8 lg:px-12">
  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">Title</h1>
  <p className="text-sm md:text-base lg:text-lg">Content</p>
</div>
```

---

## Content Management

### Markdown Content with gray-matter

Career content is stored as Markdown files in `content/career/` and parsed using `gray-matter`:

```typescript
// lib/content/loadContent.ts
import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'

interface ContentFrontmatter {
  title: string
  date: string
  description?: string
  tags?: string[]
}

export async function loadCareerContent(): Promise<ContentFrontmatter[]> {
  const contentDir = path.join(process.cwd(), 'content/career')
  const files = await fs.readdir(contentDir)

  const content = await Promise.all(
    files
      .filter(file => file.endsWith('.md'))
      .map(async (file) => {
        const filePath = path.join(contentDir, file)
        const fileContent = await fs.readFile(filePath, 'utf-8')
        const { data } = matter(fileContent)
        return data as ContentFrontmatter
      })
  )

  return content
}
```

**Markdown Format:**
```markdown
---
title: "Senior Frontend Engineer"
date: "2023-01-01"
description: "Building scalable React applications"
tags: ["React", "TypeScript", "Next.js"]
---

# Experience details here...
```

---

## Performance Optimization

### 1. Code Splitting & Lazy Loading

For heavy components, use dynamic imports:

```typescript
import { lazy, Suspense } from 'react'

const HeavyChart = lazy(() => import('./HeavyChart'))
const ThreeJsVisualizer = lazy(() => import('./ThreeJsVisualizer'))

export default function Dashboard() {
  return (
    <div>
      <Suspense fallback={<ChartSkeleton />}>
        <HeavyChart />
      </Suspense>

      <Suspense fallback={null}>
        <ThreeJsVisualizer />
      </Suspense>
    </div>
  )
}
```

### 2. Image Optimization

Use Next.js `Image` component for automatic optimization:

```typescript
import Image from 'next/image'

export function ProfileHero() {
  return (
    <div className="relative">
      <Image
        src="/profile.jpg"
        alt="Profile"
        width={400}
        height={400}
        priority  // For above-the-fold images
        className="rounded-lg"
      />
    </div>
  )
}
```

### 3. Memoization

Use `React.memo` for pure components that receive stable props:

```typescript
export const SkillCard = React.memo<SkillCardProps>(({ skill }) => {
  return (
    <div className="p-4 border rounded-lg">
      <h3>{skill.name}</h3>
      <p>{skill.proficiency}</p>
    </div>
  )
})

// Use useCallback for functions passed to memoized children
const handleSkillSelect = useCallback((skillId: string) => {
  setSelectedSkill(skillId)
}, [])
```

### 4. Next.js Optimizations

**Link Prefetching:**
```typescript
import Link from 'next/link'

export function Navigation() {
  return (
    <nav>
      <Link href="/career" prefetch>
        Career
      </Link>
    </nav>
  )
}
```

**Static Generation:**
```typescript
// app/career/page.tsx - Static by default
export const revalidate = 3600 // ISR: revalidate every hour

export default async function CareerPage() {
  const careerData = await loadCareerContent()
  return <CareerSection data={careerData} />
}
```

---

## Testing & Verification

### Test Setup

**Framework:** Vitest with jsdom environment
**Configuration:**
- `vitest.config.ts` — Main config with jsdom environment, React plugin
- `vitest.setup.ts` — Global setup: cleanup, window.matchMedia mock, IntersectionObserver mock
- Coverage: v8 provider, HTML + JSON reporting

**Running Tests:**
```bash
npm test                      # Watch mode (re-runs on file change)
npm run test:watch            # Explicit watch mode
npm test -- --run             # Run once without watch
npm run test:coverage         # Generate coverage report (opens HTML report)
npm test -- components/ui/    # Test specific directory
npm test -- Button            # Test files matching name
```

### Test Patterns

```typescript
// ✅ Component test example
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('applies variant styles', () => {
    render(<Button variant="primary">Primary</Button>)
    const button = screen.getByText('Primary')
    expect(button).toHaveClass('bg-blue-600')
  })

  it('calls onClick handler', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    screen.getByText('Click').click()
    expect(handleClick).toHaveBeenCalled()
  })
})
```

### Build Verification

Always verify before deployment:

```bash
npm run lint      # Check code quality
npm test -- --run # Ensure tests pass
npm run build     # Build static site
```

Check for:
- ✅ TypeScript errors (`tsc --noEmit` if needed)
- ✅ ESLint warnings
- ✅ Build errors
- ✅ Accessibility issues (Next.js core-web-vitals config)

---

## File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components (*.tsx) | PascalCase | `ProfileHero.tsx` |
| Utilities (*.ts) | camelCase | `formatDate.ts` |
| Pages | lowercase | `page.tsx` |
| Types/Interfaces | PascalCase + Props | `ButtonProps` |
| Hooks | camelCase + `use` | `useCareerData.ts` |
| Constants | UPPER_CASE | `DEFAULT_PAGE_SIZE` |

---

## Best Practices

### ✅ DO

- **Use TypeScript strictly** — enable `strict: true`
- **Keep components small** — single responsibility
- **Extract hooks** — reusable stateful logic
- **Use composition** — build complex UIs from simple parts
- **Memoize expensive operations** — useMemo, useCallback
- **Lazy load heavy components** — improve initial load time
- **Test critical paths** — user interactions, data loading
- **Document complex components** — JSDoc comments

### ❌ DON'T

- **Avoid prop drilling** — use context for deeply nested props
- **Don't over-memoize** — only memoize when necessary
- **Avoid inline styles** — use Tailwind classes
- **Don't mix concerns** — separate UI from business logic
- **Avoid magic numbers** — use named constants
- **Don't hardcode strings** — extract to constants or config

---

## Common Tasks

### Adding a New Component

1. Create file in appropriate directory
2. Define TypeScript interface for props
3. Export component as named export
4. Use composition patterns
5. Add tests

```typescript
// components/ui/Tag.tsx
import { clsx } from 'clsx'

interface TagProps {
  children: React.ReactNode
  color?: 'blue' | 'green' | 'red'
  className?: string
}

export function Tag({ children, color = 'blue', className }: TagProps) {
  return (
    <span
      className={clsx(
        'inline-block px-3 py-1 rounded-full text-sm font-medium',
        color === 'blue' && 'bg-blue-100 text-blue-800',
        color === 'green' && 'bg-green-100 text-green-800',
        color === 'red' && 'bg-red-100 text-red-800',
        className
      )}
    >
      {children}
    </span>
  )
}
```

### Adding a New Page

1. Create directory in `app/`
2. Add `page.tsx` file
3. Import components and layout
4. Use async/await for data fetching

```typescript
// app/projects/page.tsx
import { Section } from '@/components/ui/Section'
import { ProjectGrid } from '@/components/projects/ProjectGrid'

export const metadata = {
  title: 'Projects',
  description: 'My recent work and projects'
}

export default async function ProjectsPage() {
  const projects = await loadProjects()

  return (
    <Section>
      <h1 className="text-4xl font-bold mb-8">Projects</h1>
      <ProjectGrid projects={projects} />
    </Section>
  )
}
```

### Adding Content

1. Create `.md` file in `content/career/` (or relevant directory)
2. Add frontmatter with metadata
3. Write markdown content
4. Content automatically loads via `loadContent()` functions

---

## Environment & Configuration

### Environment Variables

**Build-time Variables:**
- `CAREER_DIR` — Source directory for career content (default: `/home/dom/career`)
  - Used by `scripts/sync-career-content.js` before build
  - Example: `CAREER_DIR=/path/to/career npm run build`

**TypeScript Configuration:**
- `strict: true` — Strict type checking enabled
- `@/*` path alias points to project root for imports

**ESLint Configuration:**
- Extends `eslint-config-next/core-web-vitals` and typescript configs
- Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

---

## Debugging & Troubleshooting

### Common Issues

**Build Fails - Career Content Not Found:**
```bash
# Verify career directory exists
ls /home/dom/career
# Or specify custom path
CAREER_DIR=/path/to/career npm run build
```

**Hydration Mismatch:**
- Ensure server-rendered content matches client-rendered content
- Avoid reading browser APIs (localStorage, window) in server components
- Use `'use client'` directive in components that need browser APIs

**Performance Issues:**
- Run `npm run build` and check bundle size in `out/` directory
- Use React DevTools Profiler for component render performance
- Check Lighthouse scores against `out/` static files
- Identify slow components with `<Suspense>` boundaries

**Type Errors:**
- Run `tsc --noEmit` to check types without emitting files
- Ensure all props have proper TypeScript interfaces
- Check generic type parameters in React hooks

**Test Failures:**
- Check `vitest.setup.ts` for environment mocks (matchMedia, IntersectionObserver)
- Ensure components are rendered with `@testing-library/react`
- Mock API calls with `vi.mock()` or `vi.fn()`
- Use `cleanup()` between tests (handled by setup)

---

## API Routes

The `/app/api/` directory contains serverless endpoint handlers. Since this is a **static export**, API routes cannot use server-side session/state — they're limited to:
- Static data processing
- Client-side form handlers (consider serverless alternatives like Netlify Functions, Vercel Functions)
- Contact form endpoints that delegate to external services

**Important:** API routes in a static export build require special handling. If adding new routes, ensure they work with your deployment platform's serverless functions.

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)

---

## Summary

| Principle | Why | How |
|-----------|-----|-----|
| **Composition** | Flexibility and reusability | Build from small components |
| **TypeScript** | Type safety and DX | Enable strict mode |
| **Tailwind** | Consistent styling | Use clsx for conditions |
| **Performance** | User experience | Lazy load, memoize, optimize |
| **Testing** | Reliability | Test critical paths |
| **Documentation** | Maintainability | Comment complex logic |

