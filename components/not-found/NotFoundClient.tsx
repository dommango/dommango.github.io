'use client'

// Custom 404 body. Old multi-page URLs redirect to their section on the
// single page; anything else gets a plain 404. `app/not-found.tsx` (a
// server component, for metadata) renders this. Exported as out/404.html
// by `output: 'export'`, which GitHub Pages serves for every unknown path.
import { useEffect, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { BinaryRule } from '@/components/landing/BinaryRule'
import { hasPosts } from '@/lib/content/writing'

// Writing only renders on the page (and only gets an #writing anchor) once
// there's a post to show — same predicate BrutalistLanding/Nav use. Route
// old blog URLs to the front page instead of a dead anchor until then.
const WRITING_TARGET = hasPosts() ? '/#writing' : '/'
const WRITING_LABEL = hasPosts() ? 'Writing' : 'the front page'

export const REDIRECTS: Array<{ test: RegExp; to: string; label: string }> = [
  { test: /^\/(career|skills|education|resume)\/?$/i, to: '/#resume', label: 'Career' },
  { test: /^\/travel\/?$/i, to: '/#travel', label: 'Travel' },
  { test: /^\/contact\/?$/i, to: '/#contact', label: 'Contact' },
  { test: /^\/(blog|writing|posts)(\/.*)?$/i, to: WRITING_TARGET, label: WRITING_LABEL },
  { test: /^\/projects?(\/.*)?$/i, to: '/#projects', label: 'Projects' },
]

export const SECTIONS: ReadonlyArray<readonly [string, string]> = [
  ['Projects', '/#projects'],
  ...(hasPosts() ? ([['Writing', '/#writing']] as const) : []),
  ['Career', '/#resume'],
  ['Travel', '/#travel'],
  ['Contact', '/#contact'],
]

const MAX_SHOWN_PATH = 64

// Not a real store: nothing here can change the pathname without unmounting
// this component (a same-page hash link doesn't unmount, but it can't match
// a REDIRECTS entry either), so subscribe() is a no-op. useSyncExternalStore
// (rather than useState+useEffect) because it reads the client value during
// the post-hydration render instead of setting state in an effect, which
// react-hooks/set-state-in-effect rejects — and it's the documented pattern
// for reading a browser-only value without a hydration mismatch.
function subscribe() {
  return () => {}
}
function getPath() {
  return window.location.pathname
}
function getServerPath() {
  return ''
}

function displayPath(path: string) {
  let decoded = path
  try {
    decoded = decodeURIComponent(path)
  } catch {
    // Malformed percent-encoding — show it raw rather than throwing.
  }
  return decoded.length > MAX_SHOWN_PATH ? `${decoded.slice(0, MAX_SHOWN_PATH)}…` : decoded
}

export function NotFoundClient() {
  const path = useSyncExternalStore(subscribe, getPath, getServerPath)
  const [seconds, setSeconds] = useState(3)
  const [cancelled, setCancelled] = useState(false)
  const match = REDIRECTS.find((r) => r.test.test(path))
  const redirecting = Boolean(match) && !cancelled

  useEffect(() => {
    if (!redirecting) return
    if (seconds <= 0) { window.location.replace(match!.to); return }
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [redirecting, match, seconds])

  return (
    <div className="brutalist-root" data-accent="gold" data-contrast="default">
      <div className="page">
        <nav className="site-nav" aria-label="Main">
          <Link href="/" className="brand" aria-label="Home"><span className="brand-mark">DM</span><span className="brand-word">Dom Mangonon</span></Link>
        </nav>
        <main className="section">
          <BinaryRule seed={404} accent />
          {/* A click on any link below means the visitor chose where to go;
              stop the pending auto-redirect so it can't override that choice. */}
          <div className="nf" onClickCapture={() => setCancelled(true)}>
            <div>
              <span className="ds-eyebrow">404</span>
              <h1 className="nf-title">{match ? <>That page<br />moved.</> : <>Nothing<br />here.</>}</h1>
              <p className="nf-lead">
                {path && <>You asked for <code>{displayPath(path)}</code>. </>}
                {match
                  ? <>It now lives on the front page, under <strong>{match.label}</strong>.</>
                  : <>There’s nothing at that address — no guessing where you meant.</>}
              </p>
              {redirecting && (
                <p className="nf-count">
                  <span role="status">Redirecting to {match!.label}.</span>{' '}
                  <span aria-hidden="true">Taking you there in {Math.max(seconds, 1)}…</span>
                </p>
              )}
              <div className="nf-actions">
                <Link className="btn-primary" href={match ? match.to : '/'}>{match ? 'Go there now →' : 'Start at the top →'}</Link>
                {redirecting && (
                  <button type="button" className="nf-stay" onClick={() => setCancelled(true)}>
                    Stay on this page
                  </button>
                )}
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
