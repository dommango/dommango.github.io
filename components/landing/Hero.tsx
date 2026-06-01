// Hero — display headline, headshot, about copy, career arc.
import Image from 'next/image'
import { BinaryRule } from './BinaryRule'

const CAREER_ARC = [
  { label: 'Rutgers · BS Finance', meta: 'FINANCE · 2004–08' },
  { label: 'Bear Stearns', meta: 'SALES INTERN · 2006' },
  { label: 'Viacom', meta: 'CORP FINANCE · 2007' },
  { label: 'BNP Paribas', meta: 'OPERATIONS · 2008–13' },
  { label: 'CMU Tepper · MBA', meta: '3.68 · 2013–15' },
  { label: 'PwC / Strategy&', meta: 'STRATEGY · 2014–17' },
  { label: 'Treliant', meta: 'ADVISORY · 2018–19' },
  { label: 'Morgan Stanley', meta: 'WM STRATEGY · 2019–20' },
  { label: 'Citi', meta: 'SVP TRANSFORM · 2021→' },
]

export function Hero() {
  return (
    <section id="hero" className="hero section">
      <BinaryRule seed={3} />
      <div className="hero-head">
        <div className="hero-head-text">
          <span className="ds-eyebrow">Section / 01 — Intro</span>
          <h1 className="hero-title">
            <span className="hero-title-alt">Harnessing AI</span>
            <br />
            in financial
            <br />
            services.
          </h1>
          <p className="hero-kicker">
            17 Years in Strategy &amp; Operations,{' '}
            <span className="hero-kicker-alt">Now Building at the Frontier</span>
          </p>
        </div>
        <div className="hero-portrait">
          <Image
            src="/images/cartoon-headshot.jpg"
            alt="Dom Mangonon"
            width={320}
            height={320}
            priority
          />
          <span className="hero-portrait-cap">Dom · NJ → NYC · 2026</span>
        </div>
      </div>
      <BinaryRule seed={9} accent />

      <div className="hero-meta">
        <div className="hero-meta-col">
          <span className="ds-eyebrow">About</span>
          <p className="hero-about">
            Senior financial-services executive with 17 years across enterprise transformation,
            strategy consulting, and trading operations. Currently SVP at Citi, leading
            enterprise transformation and risk/control framework work.
          </p>
          <p className="hero-about hero-about-secondary">
            Started in operations at BNP Paribas through the 2008 crisis, MBA at CMU Tepper,
            consulting at PwC/Strategy&amp;, wealth-management strategy at Morgan Stanley, and now
            Citi. Long-time builder — VBA macros, Hot Keys workshops, automation at every stop. In
            2025 I went all in on AI: 9 measured Claude projects, 33.9 hours saved, and this site
            built end to end with Claude Code.
          </p>
        </div>
        <div className="hero-meta-col hero-meta-right">
          <span className="ds-eyebrow">Career arc</span>
          <ul className="awards-list">
            {CAREER_ARC.map((row) => (
              <li key={row.label}>
                <span>{row.label}</span>
                <span className="awards-count">{row.meta}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
