'use client'

// BrutalistLanding — top-level client shell. Holds theme/section state,
// wires smooth-scroll + scroll-spy, and composes the page sections.
import { useEffect, useState } from 'react'
import { Nav, type ThemeMode, type SectionId } from './Nav'
import { Availability } from './Availability'
import { Hero } from './Hero'
import { Travel, type ContinentBar } from './Travel'
import { Contact } from './Contact'
import { Resume } from './Resume'
import { Footer } from './Footer'
import type { Country, FlightRoute } from '@/lib/content/travel'

export interface LandingTravelData {
  continents: ContinentBar[]
  totalCountries: number
  totalContinents: number
  countries: Country[]
  flightRoutes: FlightRoute[]
  totalFlights: number
}

const SECTION_IDS: SectionId[] = ['hero', 'resume', 'contact', 'travel']

function scrollToSection(id: SectionId) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

  return (
    <div className="brutalist-root" data-accent={accentAttr} data-contrast={contrastAttr}>
      <div className="page">
        <Nav section={section} mode={mode} onCycleMode={cycleMode} onNavigate={navigate} />
        <Availability available onGetInTouch={() => navigate('contact')} />
        <main>
          <Hero />
          <Resume />
          <Contact />
          <Travel
            continents={travel.continents}
            totalCountries={travel.totalCountries}
            totalContinents={travel.totalContinents}
            countries={travel.countries}
            flightRoutes={travel.flightRoutes}
            totalFlights={travel.totalFlights}
          />
        </main>
        <Footer onHome={() => navigate('hero')} />
      </div>
    </div>
  )
}
