// Writing — recent Substack posts. Renders only when there are posts;
// the Nav link is gated on the same predicate in BrutalistLanding.
import { POSTS, SUBSTACK_URL } from '@/lib/content/writing'
import { BinaryRule } from './BinaryRule'

const formatDate = (iso: string): string => {
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export function Writing() {
  return (
    <section id="writing" className="writing section">
      <BinaryRule seed={71} />
      <div className="projects-head">
        <span className="ds-eyebrow">Writing</span>
        <h2 className="projects-title">Context//Collapse.</h2>
        <p className="projects-blurb">
          Notes on building with AI — what worked, what broke, and the occasional bit of slop.
          Published on Substack.
        </p>
      </div>

      <div className="projects-grid">
        {POSTS.map((post) => (
          <a
            key={post.url}
            className="work-card is-linked"
            href={post.url}
            target="_blank"
            rel="noreferrer"
          >
            <div className="work-card-top">
              <span className="work-id">Substack</span>
              <span className="work-year">{formatDate(post.date)}</span>
            </div>
            <h3 className="work-name">{post.title}</h3>
            {post.subtitle && <p className="work-impact">{post.subtitle}</p>}
            <span className="work-link">Read ↗</span>
          </a>
        ))}
      </div>

      <a className="writing-all" href={SUBSTACK_URL} target="_blank" rel="noreferrer">
        All posts on Substack ↗
      </a>
    </section>
  )
}
