// Projects — catalog-ID work cards (wodniack-style) for selected enterprise work.
import { BinaryRule } from './BinaryRule'

const PROJECTS = [
  {
    id: '#cnst-0001/04',
    year: '2021 →',
    name: 'Consent Order Remediation',
    company: 'Citi · Enterprise Transformation',
    impact: '$7.1B portfolio governed · 15,000+ projects',
    points: [
      'Translated abstract Article XII.1.e language into an auditable operating model',
      'Led sustainability testing — 4+ regulatory commitments closed on time',
      'Stood up a senior oversight function with no added headcount',
    ],
  },
  {
    id: '#data-0002/04',
    year: '2022 — 23',
    name: 'Strategic Investment Data Architecture',
    company: 'Citi · Data & Governance',
    impact: '$1.1B visibility · 150+ investments',
    points: [
      'Unified three systems (RET, iCAPS, PTS) into one source of truth',
      '50+ field mappings with documented lineage and QC',
      'Cut manual reconciliation ~60%; reporting from days to hours',
    ],
  },
  {
    id: '#mrar-0003/04',
    year: '2021 — 23',
    name: 'MRA Reporting Transformation',
    company: 'Citi · Operating Model',
    impact: '15,000+ projects · Board-grade reporting',
    points: [
      'Designed a source-to-board operating model, now BAU-owned',
      'Weekly Oversight Tracker + committee templates adopted firmwide',
      'Regulators approved the model without major revisions',
    ],
  },
  {
    id: '#conc-0004/04',
    year: '2019 — 20',
    name: 'UHNW Concierge Service Model',
    company: 'Morgan Stanley · WM Strategy',
    impact: '~$15B AUM · onboarding −40%',
    points: [
      'Field research with top-decile advisors drove the service design',
      'Piloted, measured, and validated for broader rollout',
      'Led custodian-bank and fintech partnership development',
    ],
  },
]

export function Projects() {
  return (
    <section id="projects" className="projects section">
      <BinaryRule seed={57} />
      <div className="projects-head">
        <span className="ds-eyebrow">Section / 05 — Projects</span>
        <h2 className="projects-title">Selected work.</h2>
        <p className="projects-blurb">
          Enterprise transformation inside regulated financial institutions. The numbers are real;
          the detail is necessarily abstracted.
        </p>
      </div>

      <div className="projects-grid">
        {PROJECTS.map((p) => (
          <article key={p.id} className="work-card">
            <div className="work-card-top">
              <span className="work-id">{p.id}</span>
              <span className="work-year">{p.year}</span>
            </div>
            <h3 className="work-name">{p.name}</h3>
            <p className="work-company">{p.company}</p>
            <p className="work-impact">{p.impact}</p>
            <ul className="work-points">
              {p.points.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}
