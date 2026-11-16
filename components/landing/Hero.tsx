// Hero — headline, headshot, and a short bio. Everything else moved out:
// the projects below make the case that a themes grid used to assert.
import { BinaryRule } from './BinaryRule'
import { DecodeText } from './DecodeText'

export function Hero() {
  return (
    <section id="hero" className="hero section">
      <BinaryRule seed={3} />
      <div className="hero-head">
        <div className="hero-head-text">
          <span className="ds-eyebrow">Intro</span>
          <h1 className="hero-title">
            <span className="hero-title-alt">
              <DecodeText text="Unapologetically" startMs={150} durationMs={1000} />
            </span>
            <br />
            <DecodeText text="AI-pilled." startMs={650} durationMs={700} />
          </h1>
          <p className="hero-kicker">
            Growing enterprise AI adoption at Citi by day,{' '}
            <span className="hero-kicker-alt">doing my best to keep up at the frontier by night</span>
          </p>
        </div>
        {/* is-develop only adds two overlays over the image's own box, so the
            portrait still paints on frame 1 as the LCP element. */}
        <div className="hero-portrait is-develop">
          {/* images.unoptimized is on for the static export, so Next can't
              generate responsive sizes itself — these are pre-generated. The
              smaller files only reach DPR-1 screens (320w on desktop, 480w on
              a ~390px phone) and DPR-1.5 desktops (480w); phones at DPR 2-3
              still need and get the full 640w file. AVIF was not worth adding:
              it only saved 25% at a quality that visibly softened the photo. */}
          {/* eslint-disable-next-line @next/next/no-img-element -- see above */}
          <img
            src="/images/portrait-skyline.webp"
            srcSet="/images/portrait-skyline-320.webp 320w, /images/portrait-skyline-480.webp 480w, /images/portrait-skyline.webp 640w"
            sizes="(max-width: 900px) 100vw, 320px"
            alt="Dom Mangonon"
            width={640}
            height={960}
            fetchPriority="high"
            loading="eager"
          />
          <span className="hero-portrait-cap">Dom · NJ → NYC · 2026</span>
        </div>
      </div>
      <BinaryRule seed={9} accent />

      <div className="hero-meta">
        <div className="hero-meta-col">
          <span className="ds-eyebrow">About</span>
          <p className="hero-about">
            Seventeen years in financial services: operations at BNP Paribas through 2008, an MBA
            at CMU Tepper, consulting at PwC, and now SVP at Citi.
          </p>
          <p className="hero-about hero-about-secondary">
            In 2025 I went all in on AI and started shipping actual software: a restaurant cost
            tracker, a tournament bracket engine, an SEC filings pipeline. All built using
            coding agents, including this site. The projects below are real, deployed, and mostly
            still running.
          </p>
        </div>
      </div>
    </section>
  )
}
