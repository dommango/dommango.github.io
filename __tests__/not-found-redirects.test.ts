import { describe, it, expect } from 'vitest'
import { REDIRECTS, SECTIONS } from '../components/not-found/NotFoundClient'
import { hasPosts } from '../lib/content/writing'

// BrutalistLanding only ever renders these ids, and 'writing' only once
// hasPosts() is true (see SECTION_IDS in components/landing/BrutalistLanding.tsx).
// A 404 redirect or section link pointing anywhere else is a dead anchor.
const RENDERED_SECTION_IDS = ['hero', 'projects', 'resume', 'travel', 'contact', ...(hasPosts() ? ['writing'] : [])]

function targetId(to: string): string | null {
  if (to === '/') return null
  const match = to.match(/^\/#([a-z]+)$/)
  return match ? match[1] : null
}

describe('not-found redirect table', () => {
  it('every redirect target is "/" or an id that actually renders on the page', () => {
    for (const { to, label } of REDIRECTS) {
      if (to === '/') continue
      const id = targetId(to)
      expect(id, `redirect "${label}" -> ${to}`).not.toBeNull()
      expect(RENDERED_SECTION_IDS, `redirect "${label}" -> ${to}`).toContain(id)
    }
  })

  it('every section link points at an id that actually renders on the page', () => {
    for (const [label, href] of SECTIONS) {
      const id = targetId(href)
      expect(id, `section "${label}" -> ${href}`).not.toBeNull()
      expect(RENDERED_SECTION_IDS, `section "${label}" -> ${href}`).toContain(id)
    }
  })

  it('does not offer a Writing link when there are no posts to show', () => {
    if (!hasPosts()) {
      expect(SECTIONS.some(([label]) => label === 'Writing')).toBe(false)
      expect(REDIRECTS.find((r) => r.test.test('/blog'))?.to).toBe('/')
    }
  })
})
