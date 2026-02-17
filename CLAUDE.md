# Personal Website - Development Guidelines

A Next.js portfolio site built with TypeScript, React 19, and Tailwind CSS. These guidelines ensure consistency, performance, and maintainability.

---

## Project Overview

**Stack:** Next.js 16 • React 19 • TypeScript • Tailwind CSS 4 • gray-matter

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
├── career/
├── education/
├── skills/
└── page.tsx         # Home page

content/             # Markdown content
├── career/          # Career entries (parsed with gray-matter)

lib/                 # Utilities
├── content/         # Content loading functions

public/              # Static assets
scripts/             # Build scripts (sync-career-content.js)
```

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

Always verify the build before deployment:

```bash
npm run build
npm run lint
```

Check for:
- ✅ TypeScript errors
- ✅ ESLint warnings
- ✅ Build size warnings
- ✅ Accessibility issues

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

## Debugging & Troubleshooting

### Common Issues

**Hydration Mismatch:**
- Ensure server-rendered content matches client-rendered content
- Avoid reading browser APIs in server components
- Use `'use client'` directive when needed

**Performance Issues:**
- Run `npm run build` and check bundle size
- Use React DevTools Profiler
- Check Lighthouse scores
- Identify slow components with `<Suspense>` boundaries

**Type Errors:**
- Run `tsc --noEmit` to check types
- Ensure all props have proper interfaces
- Check generic type parameters

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Web Vitals](https://web.dev/vitals/)

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

