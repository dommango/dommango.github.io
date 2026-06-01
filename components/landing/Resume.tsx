'use client'

// Resume — career timeline + Request-CV pattern wired to the real EmailJS flow.
import { useRef, useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { initEmailJS, sendResumeEmail } from '@/lib/services/emailjs'
import { BinaryRule } from './BinaryRule'

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''

type Status = 'idle' | 'sending' | 'success' | 'error'

const TIMELINE = [
  { y: '2025 →', t: 'AI Turn', d: '9 measured Claude projects · 33.9h saved · this site, built with Claude Code' },
  { y: '2021 →', t: 'Citi · SVP Transformation', d: 'Consent Order remediation · ~$1.1B data architecture · 15,000+ PM standards' },
  { y: '2019 — 2020', t: 'Morgan Stanley · WM Strategy', d: '~$15B AUM opportunity · concierge model cut onboarding 40%+' },
  { y: '2018 — 2019', t: 'Treliant', d: 'Built WM advisory practice from scratch · published in ThinkAdvisor' },
  { y: '2014 — 2017', t: 'PwC / Strategy&', d: '$4B target sizing · 32,000 client migration · $14M run-rate savings' },
  { y: '2013 — 2015', t: 'CMU Tepper · MBA', d: '3.68 GPA · Consortium Fellow · 1st SCIO · 2nd McKinsey case comp' },
  { y: '2008 — 2013', t: 'BNP Paribas · Operations', d: 'Trading desks, client services, global reporting through the 2008 crisis' },
  { y: '2007', t: 'Viacom · Corporate Finance', d: 'Control intern — FP&A support, process analysis, executive reporting' },
  { y: '2006', t: 'Bear Stearns', d: 'Sales intern — first FS exposure' },
  { y: '2004 — 2008', t: 'Rutgers · BS Finance', d: "3.2 GPA · Dean's List · graduated into the 2008 crisis, straight to BNP" },
]

export function Resume() {
  const [requesting, setRequesting] = useState(false)
  const [form, setForm] = useState({ name: '', email: '' })
  const [status, setStatus] = useState<Status>('idle')
  const [feedback, setFeedback] = useState('')
  const [captchaOk, setCaptchaOk] = useState(false)
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (RECAPTCHA_SITE_KEY && !captchaOk) {
      setStatus('error')
      setFeedback('Please complete the CAPTCHA.')
      return
    }

    setStatus('sending')
    initEmailJS()

    const result = await sendResumeEmail({ toName: form.name, toEmail: form.email })

    if (result.success) {
      setStatus('success')
      setFeedback('')
      setCaptchaOk(false)
      recaptchaRef.current?.reset()
      setTimeout(() => {
        setStatus('idle')
        setRequesting(false)
        setForm({ name: '', email: '' })
      }, 3500)
    } else {
      setStatus('error')
      setFeedback(result.message)
    }
  }

  return (
    <section id="resume" className="resume section">
      <BinaryRule seed={45} />
      <div className="resume-head">
        <span className="ds-eyebrow">Section / 02 — Resume</span>
        <h2 className="resume-title">
          17 years.
          <br />
          9 institutions.
          <br />
          One through-line.
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
          <span className="ds-eyebrow">Request CV</span>
          <p className="resume-blurb">
            Resume isn&apos;t public — drop your name and email and I&apos;ll send the full PDF: work
            history, references, and the detail behind the numbers above.
          </p>

          {status === 'success' ? (
            <p className="resume-sent">
              Thanks. PDF on its way to <strong>{form.email || 'your inbox'}</strong>.
            </p>
          ) : requesting ? (
            <form className="resume-form" onSubmit={submit}>
              <div className="field">
                <label htmlFor="r-name">Name</label>
                <input
                  id="r-name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  autoComplete="name"
                />
              </div>
              <div className="field">
                <label htmlFor="r-email">Email</label>
                <input
                  id="r-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </div>

              {RECAPTCHA_SITE_KEY && (
                <div className="form-captcha">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={RECAPTCHA_SITE_KEY}
                    onChange={(token) => setCaptchaOk(!!token)}
                    theme="dark"
                  />
                </div>
              )}

              {status === 'error' && <p className="form-error">{feedback}</p>}

              <div className="form-foot">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={status === 'sending' || (!!RECAPTCHA_SITE_KEY && !captchaOk)}
                >
                  {status === 'sending' ? 'Sending…' : 'Send ↓'}
                </button>
                <button type="button" className="btn-text" onClick={() => setRequesting(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              className="btn-primary resume-download"
              onClick={() => setRequesting(true)}
            >
              Request CV ↓
            </button>
          )}

          <ul className="resume-meta">
            <li>
              <span>Format</span>
              <span>PDF</span>
            </li>
            <li>
              <span>Languages</span>
              <span>EN</span>
            </li>
            <li>
              <span>Updated</span>
              <span>Q2 2026</span>
            </li>
          </ul>
        </aside>
      </div>
    </section>
  )
}
