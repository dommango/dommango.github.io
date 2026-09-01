'use client'

// Nav — sticky top nav. Brand wordmark + section links + a single theme
// toggle that cycles Gold (default) → Oxblood → High Contrast.
import { useEffect, useRef } from 'react'

export type ThemeMode = 'gold' | 'oxblood' | 'contrast'
export type SectionId = 'hero' | 'projects' | 'writing' | 'resume' | 'travel' | 'contact'

const MODE_LABEL: Record<ThemeMode, string> = {
  gold: 'Gold',
  oxblood: 'Oxblood',
  contrast: 'High Contrast',
}

interface NavProps {
  section: SectionId
  mode: ThemeMode
  onCycleMode: () => void
  onNavigate: (id: SectionId) => void
  /** Writing renders only when there are posts; its link must be gated the same way. */
  showWriting: boolean
}

export function Nav({ section, mode, onCycleMode, onNavigate, showWriting }: NavProps) {
  const navRef = useRef<HTMLElement>(null)
  const linksRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const links = linksRef.current
    const nav = navRef.current
    if (!links || !nav) return
    const onScroll = () => {
      const atEnd = links.scrollLeft + links.clientWidth >= links.scrollWidth - 2
      links.classList.toggle('is-scrolled-end', atEnd)
      nav.classList.toggle('is-scrolled-end', atEnd)
    }
    links.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    document.fonts?.ready.then(onScroll)
    onScroll()
    return () => {
      links.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const link = (id: SectionId, label: string) => (
    <a
      href={`#${id}`}
      className={`nav-link ${section === id ? 'is-active' : ''}`}
      onClick={(e) => {
        e.preventDefault()
        onNavigate(id)
      }}
    >
      {label}
    </a>
  )

  return (
    <nav className="site-nav" aria-label="Main" ref={navRef}>
      <a
        href="#hero"
        className="brand"
        onClick={(e) => {
          e.preventDefault()
          onNavigate('hero')
        }}
        aria-label="Home"
      >
        <span className="brand-mark">DM</span>
        <span className="brand-word">Dom Mangonon</span>
      </a>
      <div className="nav-links" ref={linksRef}>
        {link('hero', 'Intro')}
        {link('projects', 'Projects')}
        {showWriting && link('writing', 'Writing')}
        {link('resume', 'Career')}
        {link('travel', 'Travel')}
        {link('contact', 'Contact')}
      </div>
      <div className="nav-right">
        <button
          type="button"
          className="contrast-toggle"
          onClick={onCycleMode}
          title="Cycle theme: Gold → Oxblood → High Contrast"
        >
          <span className="contrast-swatch accent-swatch" />
          {MODE_LABEL[mode]}
        </button>
      </div>
    </nav>
  )
}
