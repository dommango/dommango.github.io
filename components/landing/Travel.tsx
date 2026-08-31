'use client'

// Travel — brutalist continent bars + the real interactive globe map.
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  buildContinentBars,
  countriesUpTo,
  yearBounds,
  type Country,
  type FlightRoute,
} from '@/lib/content/travel'
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

interface TravelProps {
  totalCountries: number
  totalContinents: number
  countries: Country[]
  flightRoutes: FlightRoute[]
  totalFlights: number
}

const PLAY_INTERVAL_MS = 260

export function Travel({
  totalCountries,
  totalContinents,
  countries,
  flightRoutes,
  totalFlights,
}: TravelProps) {
  const [showFlights, setShowFlights] = useState(true)
  const [min, max] = yearBounds(countries)
  const [year, setYear] = useState(max)
  const [playing, setPlaying] = useState(false)

  const bars = buildContinentBars(countries, year)
  const visible = countriesUpTo(countries, year)
  const continentsVisible = new Set(visible.map((c) => c.continent)).size
  const newThisYear = countries.filter((c) => c.firstVisited === year)

  useEffect(() => {
    if (!playing) return
    const id = setTimeout(() => {
      if (year >= max) {
        setPlaying(false)
        return
      }
      setYear((y) => y + 1)
    }, PLAY_INTERVAL_MS)
    return () => clearTimeout(id)
  }, [playing, year, max])

  return (
    <section id="travel" className="travel section">
      <BinaryRule seed={33} />
      <div className="travel-head">
        <span className="ds-eyebrow">Travel</span>
        <h2 className="travel-title">
          {visible.length}
          {year === max ? '+' : ''} countries.
          <br />
          {continentsVisible} continents.
        </h2>
        <p className="travel-blurb">
          Less box-checking, more discomfort on purpose. Travel built my tolerance for ambiguity
          and for solving problems other people&apos;s ways.
        </p>
      </div>

      <div className="travel-grid">
        <ul className="continent-list">
          {bars.map((c) => (
            <li key={c.name} className="continent-row">
              <span className="continent-name">{c.name}</span>
              <span className="continent-bar">
                <span className="continent-fill" style={{ width: `${c.pct}%` }} />
              </span>
              <span className="continent-count">{c.count}</span>
            </li>
          ))}
        </ul>

        <div className="scrub">
          <span className="ds-eyebrow">Scrub the years</span>
          <div className="scrub-year" aria-live="polite">
            {year}
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={1}
            value={year}
            onChange={(e) => {
              setPlaying(false)
              setYear(Number(e.target.value))
            }}
            aria-label="Show countries first visited up to this year"
          />
          <div className="scrub-row">
            <button
              type="button"
              className="travel-map-toggle"
              onClick={() => {
                if (year >= max) setYear(min - 1)
                setPlaying((p) => !p)
              }}
            >
              {playing ? '■ Stop' : '▶ Play'}
            </button>
            <span className="scrub-stat">
              <b>{visible.length}</b> countries · <b>{continentsVisible}</b> continents · by {year}
            </span>
          </div>
          <div className="scrub-new">
            {newThisYear.length > 0 ? (
              newThisYear.map((c) => (
                <span key={c.id} className="scrub-chip">
                  {c.name}
                </span>
              ))
            ) : (
              <span className="scrub-chip is-muted">none that year</span>
            )}
          </div>
        </div>
      </div>

      <div className="travel-map-wrap">
        <div className="travel-map-head">
          <span className="ds-eyebrow">The map · drag or use arrow keys</span>
          <button
            type="button"
            className={`travel-map-toggle ${showFlights ? 'is-active' : ''}`}
            onClick={() => setShowFlights((s) => !s)}
          >
            Flight history
          </button>
        </div>
        <div className="travel-map-frame">
          <TravelMap
            countries={countries}
            flightRoutes={flightRoutes}
            showFlights={showFlights}
            selectedYear={year}
          />
        </div>
        <p className="travel-map-cap">
          {totalCountries} countries across {totalContinents} continents
          {showFlights ? ` · ${totalFlights} flights` : ''}
        </p>
      </div>
    </section>
  )
}
