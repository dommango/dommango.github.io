'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ReCAPTCHA from 'react-google-recaptcha'
import dynamic from 'next/dynamic'
import { LinkedinLogo, XLogo, GithubLogo, ChartBar, FileText } from '@phosphor-icons/react'
import { getTravelData, getFlightRoutes, getFlightStats } from '@/lib/content/travel'

const TravelMap = dynamic(
  () => import('@/components/travel/TravelMap').then(mod => mod.TravelMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full bg-surface-1 rounded-xl border border-border overflow-hidden">
        <div className="aspect-square flex items-center justify-center">
          <p className="text-text-muted text-sm">Loading map...</p>
        </div>
      </div>
    )
  }
)
import { initEmailJS, sendResumeEmail } from '@/lib/services/emailjs'

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''

export default function Home() {
  const { countries, stats } = getTravelData()
  const flightRoutes = getFlightRoutes()
  const flightStats = getFlightStats()
  const [showResumeForm, setShowResumeForm] = useState(false)
  const [showFlights, setShowFlights] = useState(true)
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [formMessage, setFormMessage] = useState('')
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaVerified(!!token)
  }

  const handleResumeRequest = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!captchaVerified) {
      setFormStatus('error')
      setFormMessage('Please complete the CAPTCHA')
      return
    }

    setFormStatus('sending')

    initEmailJS()

    const result = await sendResumeEmail({
      toName: formData.name,
      toEmail: formData.email
    })

    if (result.success) {
      setFormStatus('success')
      setFormMessage("Thanks! I'll send my resume to your inbox shortly.")
      setFormData({ name: '', email: '' })
      setCaptchaVerified(false)
      recaptchaRef.current?.reset()
    } else {
      setFormStatus('error')
      setFormMessage(result.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative w-full max-w-2xl bg-surface-1/80 backdrop-blur-sm rounded-2xl border border-border p-8 md:p-12 shadow-2xl">
        {/* Profile Section */}
        <div className="flex flex-col items-center text-center mb-6">
          <Image
            src="/images/portrait_skyline.png"
            alt="Dom Mangonon"
            width={120}
            height={120}
            className="rounded-full mb-6 border-2 border-accent-gold-muted shadow-lg"
            priority
          />

          <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
            Dom Mangonon
          </h1>
          <p className="text-text-muted text-sm">
            New York metropolitan area
          </p>
        </div>

        {/* Welcome Message */}
        <p className="text-center text-text-secondary text-sm mb-8 max-w-md mx-auto">
          Hi there! Thanks for visiting my landing page. I hope to use it to share more about myself,
          projects I&apos;ve been working on, and anything else on my mind. It&apos;s going to evolve over time,
          so keep coming back!
        </p>

        {/* Social Links */}
        <div className="flex justify-center gap-4 mb-6">
          <a
            href="https://linkedin.com/in/dommangonon"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-accent-gold transition-colors"
            aria-label="LinkedIn"
          >
            <LinkedinLogo size={24} weight="fill" />
          </a>
          <a
            href="https://x.com/collapsecontext"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-accent-gold transition-colors"
            aria-label="Twitter"
          >
            <XLogo size={24} weight="fill" />
          </a>
          <a
            href="https://dommangonon.substack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-accent-gold transition-colors"
            aria-label="Substack"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24l9.54-5.318L20.539 24V10.812H1.46zm0-8.242h21.08v2.836H1.46V2.57z"/>
            </svg>
          </a>
        </div>

        {/* Resume Request */}
        <div className="flex justify-center mb-8">
          {!showResumeForm ? (
            <button
              onClick={() => setShowResumeForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent-gold text-surface-0 font-medium rounded-lg hover:bg-accent-gold-bright transition-colors shadow-lg shadow-accent-gold/20"
            >
              <FileText size={20} weight="fill" />
              Request Resume
            </button>
          ) : formStatus === 'success' ? (
            <div className="text-center">
              <p className="text-accent-gold mb-2">{formMessage}</p>
              <button
                onClick={() => {
                  setShowResumeForm(false)
                  setFormStatus('idle')
                }}
                className="text-text-muted text-sm hover:text-text-primary transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleResumeRequest} className="w-full max-w-sm space-y-4">
              <div>
                <input
                  type="text"
                  id="resume-name"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  autoComplete="name"
                  className="w-full px-4 py-2 bg-surface-0 border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-gold"
                />
              </div>
              <div>
                <input
                  type="email"
                  id="resume-email"
                  name="email"
                  placeholder="Your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-2 bg-surface-0 border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-gold"
                />
              </div>
              {RECAPTCHA_SITE_KEY && (
                <div className="flex justify-center">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={RECAPTCHA_SITE_KEY}
                    onChange={handleCaptchaChange}
                    theme="dark"
                  />
                </div>
              )}
              {formStatus === 'error' && (
                <p className="text-red-400 text-sm">{formMessage}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={formStatus === 'sending' || (!!RECAPTCHA_SITE_KEY && !captchaVerified)}
                  className="flex-1 px-4 py-2 bg-accent-gold text-surface-0 font-medium rounded-lg hover:bg-accent-gold-bright transition-colors disabled:opacity-50"
                >
                  {formStatus === 'sending' ? 'Sending...' : 'Send'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResumeForm(false)
                    setFormStatus('idle')
                  }}
                  className="px-4 py-2 border border-border text-text-muted rounded-lg hover:border-text-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-border my-8" />

        {/* Travel Map */}
        <div className="mb-4">
          <div className="flex flex-col items-center gap-3 mb-4">
            <h2 className="text-lg font-semibold text-text-primary">
              My Travel Map
            </h2>
            <button
              onClick={() => setShowFlights(!showFlights)}
              className={`text-xs px-2 py-1 rounded border transition-colors ${
                showFlights
                  ? 'border-accent-gold text-accent-gold'
                  : 'border-border text-text-muted hover:border-text-muted'
              }`}
            >
              Flight History
            </button>
          </div>
          <TravelMap
            countries={countries}
            flightRoutes={flightRoutes}
            showFlights={showFlights}
          />
          <p className="text-center text-text-muted text-sm mt-3">
            {stats.totalCountries} countries across {stats.continents} continents
            {showFlights && ` • ${flightStats.totalFlights} flights`}
          </p>
        </div>
      </div>
    </div>
  )
}
