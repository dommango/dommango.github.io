'use client'

// Contact — wide-tracked closing headline + EmailJS-wired message form + socials.
import { useRef, useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { initEmailJS, sendContactEmail } from '@/lib/services/emailjs'
import { BinaryRule } from './BinaryRule'

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''

type Status = 'idle' | 'sending' | 'success' | 'error'

export function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<Status>('idle')
  const [feedback, setFeedback] = useState('')
  const [captchaOk, setCaptchaOk] = useState(false)
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  const update =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((s) => ({ ...s, [key]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (RECAPTCHA_SITE_KEY && !captchaOk) {
      setStatus('error')
      setFeedback('Please complete the CAPTCHA.')
      return
    }

    setStatus('sending')
    initEmailJS()

    const result = await sendContactEmail({
      fromName: form.name,
      fromEmail: form.email,
      message: form.message,
    })

    if (result.success) {
      setStatus('success')
      setFeedback(result.message)
      setForm({ name: '', email: '', message: '' })
      setCaptchaOk(false)
      recaptchaRef.current?.reset()
      setTimeout(() => setStatus('idle'), 4000)
    } else {
      setStatus('error')
      setFeedback(result.message)
    }
  }

  return (
    <section id="contact" className="contact section">
      <BinaryRule seed={21} />

      <div className="contact-grid">
        <div className="contact-headline">
          <span className="ds-eyebrow">Section / 03 — Contact</span>
          <h2 className="contact-title">
            Let&apos;s
            <br />
            Talk
          </h2>
          <div className="contact-tracked">L E T &apos; S &nbsp; T A L K</div>
          <a className="contact-email" href="mailto:dom.mangonon@gmail.com">
            dom.mangonon@gmail.com →
          </a>
          <div className="contact-socials">
            <a href="https://linkedin.com/in/dommangonon" target="_blank" rel="noreferrer">
              LinkedIn ↗
            </a>
            <a href="https://x.com/collapsecontext" target="_blank" rel="noreferrer">
              X / @collapsecontext ↗
            </a>
            <a href="https://dommangonon.substack.com" target="_blank" rel="noreferrer">
              Substack ↗
            </a>
          </div>
        </div>

        <form className="contact-form" onSubmit={submit}>
          <div className="field">
            <label htmlFor="c-name">Name</label>
            <input id="c-name" required value={form.name} onChange={update('name')} autoComplete="name" />
          </div>
          <div className="field">
            <label htmlFor="c-email">Email</label>
            <input
              id="c-email"
              type="email"
              required
              value={form.email}
              onChange={update('email')}
              placeholder="you@company.com"
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label htmlFor="c-msg">Message</label>
            <textarea
              id="c-msg"
              required
              rows={5}
              value={form.message}
              onChange={update('message')}
              placeholder="Role, problem, or just a hello."
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
              {status === 'success' ? 'Sent ✓' : status === 'sending' ? 'Sending…' : 'Send message →'}
            </button>
            <span className="form-meta">Straight to my inbox</span>
          </div>
        </form>
      </div>
    </section>
  )
}
