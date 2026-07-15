// Resume — the career, compressed to context. The Request-CV form that used
// to live here is gone: it gated a PDF that was publicly downloadable anyway.
import { BinaryRule } from './BinaryRule'

const TIMELINE = [
  {
    y: '2025 →',
    t: 'Building with AI',
    d: 'Shipping software nights and weekends with Claude Code — see above',
  },
  {
    y: '2021 →',
    t: 'Citi · SVP, Transformation',
    d: 'Enterprise transformation and risk/control frameworks; growing AI adoption',
  },
  {
    y: '2019 — 2020',
    t: 'Morgan Stanley · Wealth Management Strategy',
    d: 'Service model design for ultra-high-net-worth advisors',
  },
  {
    y: '2014 — 2019',
    t: 'PwC / Strategy& · Treliant',
    d: 'Strategy consulting and advisory across financial services',
  },
  {
    y: '2008 — 2013',
    t: 'BNP Paribas · Operations',
    d: 'Trading desks and global reporting, starting in the middle of the 2008 crisis',
  },
]

export function Resume() {
  return (
    <section id="resume" className="resume section">
      <BinaryRule seed={45} />
      <div className="resume-head">
        <span className="ds-eyebrow">Career</span>
        <h2 className="resume-title">
          The day
          <br />
          job.
        </h2>
      </div>

      <div className="resume-body">
        <ol className="timeline">
          {TIMELINE.map((r) => (
            <li key={r.t} className="timeline-row">
              <span className="timeline-year">{r.y}</span>
              <span className="timeline-title">{r.t}</span>
              <span className="timeline-desc">{r.d}</span>
            </li>
          ))}
        </ol>

        <aside className="resume-aside">
          <span className="ds-eyebrow">Elsewhere</span>
          <p className="resume-blurb">
            Seventeen years of it, in more detail than anyone needs, lives on LinkedIn. If you want
            the long version or a CV, just ask.
          </p>
          <a
            className="writing-all"
            href="https://linkedin.com/in/dommangonon"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn ↗
          </a>
        </aside>
      </div>
    </section>
  )
}
