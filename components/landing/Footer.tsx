// Footer — closing strip with brand, socials, legal.

interface FooterProps {
  onHome: () => void
}

export function Footer({ onHome }: FooterProps) {
  return (
    <footer className="site-footer">
      <div className="footer-row">
        <button type="button" className="brand" onClick={onHome} aria-label="Back to top">
          <span className="brand-mark">DM</span>
          <span className="brand-word">Dom Mangonon</span>
        </button>
        <div className="footer-socials">
          <a href="https://linkedin.com/in/dommangonon" target="_blank" rel="noreferrer">
            LinkedIn ↗
          </a>
          <a href="https://x.com/collapsecontext" target="_blank" rel="noreferrer">
            X ↗
          </a>
          <a href="https://dommangonon.substack.com" target="_blank" rel="noreferrer">
            Substack ↗
          </a>
          <a href="https://github.com/dommango" target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
        </div>
        <div className="footer-legal">
          <span>© 2026 · Dom Mangonon</span>
          <span>·</span>
          <span>Built with Claude Code</span>
        </div>
      </div>
    </footer>
  )
}
