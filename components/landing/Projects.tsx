// Projects — the main section. Catalog-ID cards for shipped software.
import type { CSSProperties } from 'react'
import { PROJECTS, type Project } from '@/lib/content/projects'
import { BinaryRule } from './BinaryRule'
import { RevealGroup } from './RevealGroup'

const LINK_LABEL: Record<NonNullable<Project['hrefKind']>, string> = {
  live: 'Open live ↗',
  repo: 'View source ↗',
}

function CardBody({ project }: { project: Project }) {
  return (
    <>
      <div className="work-card-top">
        <span className="work-id">{project.id}</span>
        <span className="work-year">{project.year}</span>
      </div>
      <h3 className="work-name">{project.name}</h3>
      <p className="work-company">{project.stack}</p>
      <p className="work-impact">{project.impact}</p>
      <ul className="work-points">
        {project.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      {project.hrefKind && <span className="work-link">{LINK_LABEL[project.hrefKind]}</span>}
    </>
  )
}

export function Projects() {
  return (
    <section id="projects" className="projects section" tabIndex={-1}>
      <BinaryRule seed={57} />
      <div className="projects-head">
        <span className="ds-eyebrow">Projects</span>
        <h2 className="projects-title">Things I built.</h2>
        <p className="projects-blurb">
          Mostly nights and weekends, mostly with coding agents. A couple are running in the wild;
          a couple are pipelines that only ever needed to run once.
        </p>
      </div>

      <RevealGroup className="projects-grid">
        {PROJECTS.map((project, i) =>
          project.href ? (
            <a
              key={project.id}
              className="work-card is-linked"
              style={{ '--i': i } as CSSProperties}
              href={project.href}
              target="_blank"
              rel="noreferrer"
            >
              <CardBody project={project} />
            </a>
          ) : (
            <article
              key={project.id}
              className="work-card"
              style={{ '--i': i } as CSSProperties}
            >
              <CardBody project={project} />
            </article>
          )
        )}
      </RevealGroup>
    </section>
  )
}
