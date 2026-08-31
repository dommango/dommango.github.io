'use client'

// Custom 404. Old multi-page URLs redirect to their section on the single page;
// anything else gets a plain 404. Exported as out/404.html by `output: 'export'`,
// which GitHub Pages serves for every unknown path.
import { useEffect, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { BinaryRule } from '@/components/landing/BinaryRule'

const REDIRECTS: Array<{ test: RegExp; to: string; label: string }> = [
  { test: /^\/(career|skills|education|resume)\/?$/i, to: '/#resume', label: 'Career' },
  { test: /^\/travel\/?$/i, to: '/#travel', label: 'Travel' },
  { test: /^\/contact\/?$/i, to: '/#contact', label: 'Contact' },
  { test: /^\/(blog|writing|posts)(\/.*)?$/i, to: '/#writing', label: 'Writing' },
  { test: /^\/projects?(\/.*)?$/i, to: '/#projects', label: 'Projects' },
]

const SECTIONS = [
  ['Projects', '/#projects'], ['Writing', '/#writing'], ['Career', '/#resume'], ['Travel', '/#travel'], ['Contact', '/#contact'],
] as const

// Reads the real pathname only on the client. The server (and the static
// out/404.html shell) always sees '', so the first paint is the generic
// "Nothing here" copy and the client swap-in to redirect copy happens
// without a hydration mismatch.
function subscribe() {
  return () => {}
}
function getPath() {
  return window.location.pathname
}
function getServerPath() {
  return ''
}

export default function NotFound() {
  const path = useSyncExternalStore(subscribe, getPath, getServerPath)
  const [seconds, setSeconds] = useState(3)
  const match = REDIRECTS.find((r) => r.test.test(path))

  useEffect(() => {
    if (!match) return
    if (seconds <= 0) { window.location.replace(match.to); return }
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [match, seconds])

  return (
    <div className="brutalist-root" data-accent="gold" data-contrast="default">
      <div className="page">
        <nav className="site-nav" aria-label="Main">
          <Link href="/" className="brand" aria-label="Home"><span className="brand-mark">DM</span><span className="brand-word">Dom Mangonon</span></Link>
        </nav>
        <main className="section">
          <BinaryRule seed={404} accent />
          <div className="nf">
            <div>
              <span className="ds-eyebrow">404</span>
              <h1 className="nf-title">{match ? <>That page<br />moved.</> : <>Nothing<br />here.</>}</h1>
              <p className="nf-lead">
                {path && <>You asked for <code>{path}</code>. </>}
                {match
                  ? <>It now lives on the front page, under <strong>{match.label}</strong>.</>
                  : <>There’s nothing at that address — no guessing where you meant.</>}
              </p>
              {match && <p className="nf-count" role="status">Taking you there in {seconds}…</p>}
              <div className="nf-actions">
                <Link className="btn-primary" href={match ? match.to : '/'}>{match ? 'Go there now →' : 'Start at the top →'}</Link>
              </div>
            </div>
            <ul className="nf-map" aria-label="Sections">
              {SECTIONS.map(([label, href]) => (
                <li key={href}><a className="writing-all" href={href}>{label} →</a></li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </div>
  )
}
