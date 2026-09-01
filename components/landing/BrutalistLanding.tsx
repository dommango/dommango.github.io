'use client'

// BrutalistLanding — top-level client shell. Holds theme/section state,
// wires smooth-scroll + scroll-spy, and composes the page sections.
import { useEffect, useState } from 'react'
import { Nav, type ThemeMode, type SectionId } from './Nav'
import { Availability } from './Availability'
import { Hero } from './Hero'
import { Projects } from './Projects'
import { Writing } from './Writing'
import { Travel } from './Travel'
import { Contact } from './Contact'
import { Resume } from './Resume'
import { Footer } from './Footer'
import { hasPosts } from '@/lib/content/writing'
import type { Country, FlightRoute } from '@/lib/content/travel'

export interface LandingTravelData {
  totalCountries: number
  totalContinents: number
  countries: Country[]
  flightRoutes: FlightRoute[]
  totalFlights: number
}

// Must match DOM order: the scroll-spy below takes the LAST section whose
// offsetTop has passed, so a mismatch misreports the active link silently.
// 'writing' is absent from the DOM when there are no posts; the spy's
// null-check handles that, and Nav gates its link on the same predicate.
const SECTION_IDS: SectionId[] = ['hero', 'projects', 'writing', 'resume', 'travel', 'contact']

function scrollToSection(id: SectionId) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
}

export function BrutalistLanding({ travel }: { travel: LandingTravelData }) {
  const [mode, setMode] = useState<ThemeMode>('gold')
  const [section, setSection] = useState<SectionId>('hero')

  const cycleMode = () =>
    setMode((m) => (m === 'gold' ? 'oxblood' : m === 'oxblood' ? 'contrast' : 'gold'))

  const accentAttr = mode === 'oxblood' ? 'oxblood' : 'gold'
  const contrastAttr = mode === 'contrast' ? 'high' : 'default'

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY + 140
      let current: SectionId = 'hero'
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= y) current = id
      }
      setSection(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navigate = (id: SectionId) => {
    setSection(id)
    scrollToSection(id)
  }

  const showWriting = hasPosts()

  return (
    <div className="brutalist-root" data-accent={accentAttr} data-contrast={contrastAttr}>
      <div className="page">
        <a className="skip-link" href="#projects">Skip to projects</a>
        <Nav
          section={section}
          mode={mode}
          onCycleMode={cycleMode}
          onNavigate={navigate}
          showWriting={showWriting}
        />
        <Availability available onGetInTouch={() => navigate('contact')} />
        <main>
          <Hero />
          <Projects />
          {showWriting && <Writing />}
          <Resume />
          <Travel
            totalCountries={travel.totalCountries}
            totalContinents={travel.totalContinents}
            countries={travel.countries}
            flightRoutes={travel.flightRoutes}
            totalFlights={travel.totalFlights}
          />
          <Contact />
        </main>
        <Footer onHome={() => navigate('hero')} />
      </div>
    </div>
  )
}
