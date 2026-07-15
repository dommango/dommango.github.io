'use client'

// Travel — brutalist continent bars + the real interactive globe map.
import { useState } from 'react'
import dynamic from 'next/dynamic'
import type { Country, FlightRoute } from '@/lib/content/travel'
import { BinaryRule } from './BinaryRule'

const TravelMap = dynamic(
  () => import('@/components/travel/TravelMap').then((mod) => mod.TravelMap),
  {
    ssr: false,
    loading: () => (
      <div className="travel-map-cap" style={{ padding: 'var(--s-7) 0', textAlign: 'center' }}>
        Loading globe…
      </div>
    ),
  }
)

export interface ContinentBar {
  name: string
  count: number
  pct: number
}

interface TravelProps {
  continents: ContinentBar[]
  totalCountries: number
  totalContinents: number
  countries: Country[]
  flightRoutes: FlightRoute[]
  totalFlights: number
}

const HIGHLIGHTS = [
  'Trekking Patagonia',
  'Southeast Asia',
  'Live music in Lisbon',
  'Snowboarding Hokkaido',
  'Iceland ring road',
]

export function Travel({
  continents,
  totalCountries,
  totalContinents,
  countries,
  flightRoutes,
  totalFlights,
}: TravelProps) {
  const [showFlights, setShowFlights] = useState(true)

  return (
    <section id="travel" className="travel section">
      <BinaryRule seed={33} />
      <div className="travel-head">
        <span className="ds-eyebrow">Travel</span>
        <h2 className="travel-title">
          {totalCountries}+ countries.
          <br />
          {totalContinents} continents.
        </h2>
        <p className="travel-blurb">
          Less box-checking, more discomfort on purpose. Travel built my tolerance for ambiguity
          and for solving problems other people&apos;s ways.
        </p>
      </div>

      <div className="travel-grid">
        <ul className="continent-list">
          {continents.map((c) => (
            <li key={c.name} className="continent-row">
              <span className="continent-name">{c.name}</span>
              <span className="continent-bar">
                <span className="continent-fill" style={{ width: `${c.pct}%` }} />
              </span>
              <span className="continent-count">{c.count}</span>
            </li>
          ))}
        </ul>

        <div className="travel-highlights">
          <span className="ds-eyebrow">Highlights</span>
          <ul className="highlight-list">
            {HIGHLIGHTS.map((h, i) => (
              <li key={h}>
                <span className="hl-num">#{String(i + 1).padStart(2, '0')}</span>
                {h}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="travel-map-wrap">
        <div className="travel-map-head">
          <span className="ds-eyebrow">The map · drag to rotate</span>
          <button
            type="button"
            className={`travel-map-toggle ${showFlights ? 'is-active' : ''}`}
            onClick={() => setShowFlights((s) => !s)}
          >
            Flight history
          </button>
        </div>
        <div className="travel-map-frame">
          <TravelMap countries={countries} flightRoutes={flightRoutes} showFlights={showFlights} />
        </div>
        <p className="travel-map-cap">
          {totalCountries} countries across {totalContinents} continents
          {showFlights ? ` · ${totalFlights} flights` : ''}
        </p>
      </div>
    </section>
  )
}
