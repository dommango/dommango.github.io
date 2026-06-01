// Nav — sticky top nav. Brand wordmark + section links + a single theme
// toggle that cycles Gold (default) → Oxblood → High Contrast.

export type ThemeMode = 'gold' | 'oxblood' | 'contrast'
export type SectionId = 'hero' | 'resume' | 'contact' | 'travel'

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
}

export function Nav({ section, mode, onCycleMode, onNavigate }: NavProps) {
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
    <nav className="site-nav">
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
      <div className="nav-links">
        {link('hero', 'Intro')}
        {link('resume', 'Resume')}
        {link('contact', 'Contact')}
        {link('travel', 'Travel')}
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
