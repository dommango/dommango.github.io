'use client'

// Travel — brutalist continent bars, the real interactive globe, and the reel:
// a tall container whose stage pins while the page scrolls past it, so scroll
// position is the year. Without motion (or without JS) the reel is inert markup
// and the section is the static one it always was, scrubbed by hand.
import { useEffect, useState, type CSSProperties } from 'react'
import dynamic from 'next/dynamic'
import {
  buildContinentBars,
  countriesUpTo,
  nextPlayState,
  yearBounds,
  type Country,
  type FlightRoute,
} from '@/lib/content/travel'
import { focusLonLat } from '@/components/travel/globe-geometry'
import { BinaryRule } from './BinaryRule'
import { CountUp } from './CountUp'
import { useInView } from './useInView'
import { useReelProgress } from './useReelProgress'

function GlobePlaceholder() {
  return (
    <div className="travel-map-cap" style={{ padding: 'var(--s-7) 0', textAlign: 'center' }}>
      Loading globe…
    </div>
  )
}

const TravelMap = dynamic(
  () => import('@/components/travel/TravelMap').then((mod) => mod.TravelMap),
  { ssr: false, loading: GlobePlaceholder }
)

// Mount the globe chunk while the frame is still this far below the fold, so
// it and its geography have loaded by the time the draw-in starts.
const GLOBE_PRELOAD_MARGIN = '0px 0px 600px 0px'

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
  const [manualYear, setManualYear] = useState(max)
  const [playing, setPlaying] = useState(false)
  const { ref: reelRef, step } = useReelProgress<HTMLDivElement>(max - min + 1)
  const { ref: listRef, inView: listInView } = useInView<HTMLUListElement>()
  const { ref: mapRef, inView: mapInView } = useInView<HTMLDivElement>()
  const { ref: mapNearRef, inView: mapNear } = useInView<HTMLDivElement>(GLOBE_PRELOAD_MARGIN)

  // step is null whenever the reel is not driving, which is also when the CSS
  // leaves the stage unpinned — the two fences have to agree.
  const reelDriven = step !== null
  const year = reelDriven ? min + step : manualYear

  const bars = buildContinentBars(countries, year)
  const visible = countriesUpTo(countries, year)
  const continentsVisible = new Set(visible.map((c) => c.continent)).size
  const newThisYear = countries.filter((c) => c.firstVisited === year)
  // The globe swings to the first country of the year the reel is holding on.
  const focus = reelDriven ? focusLonLat(newThisYear[0]) : undefined

  useEffect(() => {
    if (!playing || reelDriven) return
    const id = setTimeout(() => {
      if (manualYear >= max) {
        setPlaying(false)
        return
      }
      setManualYear((y) => y + 1)
    }, PLAY_INTERVAL_MS)
    return () => clearTimeout(id)
  }, [playing, reelDriven, manualYear, max])

  return (
    <section id="travel" className="travel section">
      <BinaryRule seed={33} />
      <div className="travel-head">
        <span className="ds-eyebrow">Travel</span>
        <h2 className="travel-title">
          {/* While the reel drives the year, the heading states the whole trip;
              the year's running count belongs to the stage below. */}
          {reelDriven ? totalCountries : visible.length}
          {reelDriven || year === max ? '+' : ''} countries.
          <br />
          {reelDriven ? totalContinents : continentsVisible} continents.
        </h2>
        <p className="travel-blurb">
          Less box-checking, more discomfort on purpose. Travel built my tolerance for ambiguity
          and for solving problems other people&apos;s ways.
        </p>
      </div>

      <div className="travel-reel" ref={reelRef}>
        <div className="travel-reel-stage">
          <div className="travel-grid">
            <ul ref={listRef} className={`continent-list${listInView ? ' is-in' : ''}`}>
              {bars.map((c, i) => (
                <li key={c.name} className="continent-row">
                  <span className="continent-name">{c.name}</span>
                  <span className="continent-bar">
                    <span
                      className="continent-fill"
                      style={{ '--p': c.pct / 100, '--i': i } as CSSProperties}
                    />
                  </span>
                  <span className="continent-count">
                    <CountUp value={c.count} active={listInView} />
                  </span>
                </li>
              ))}
            </ul>

            <div className="scrub">
              <span className="ds-eyebrow">
                {reelDriven ? 'Scroll is the year' : 'Scrub the years'}
              </span>
              {/* Silenced while the reel or Play is running — either one would
                  otherwise announce 41 years in a few seconds. */}
              <div className="scrub-year" aria-live={playing || reelDriven ? 'off' : 'polite'}>
                {year}
              </div>
              {/* Hidden by CSS while the stage is pinned: scroll is the control
                  then. Reduced motion and no-JS keep these as the only one. */}
              <div className="scrub-manual">
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={1}
                  value={year}
                  onChange={(e) => {
                    setPlaying(false)
                    setManualYear(Number(e.target.value))
                  }}
                  aria-label="Show countries first visited up to this year"
                />
                <button
                  type="button"
                  className="travel-map-toggle"
                  aria-pressed={playing}
                  onClick={() => {
                    const next = nextPlayState({ year: manualYear, playing }, min, max)
                    setManualYear(next.year)
                    setPlaying(next.playing)
                  }}
                >
                  <span aria-hidden="true">{playing ? '■' : '▶'}</span> {playing ? 'Stop' : 'Play'}
                </button>
              </div>
              <span className="scrub-stat">
                <b>{visible.length}</b> countries · <b>{continentsVisible}</b> continents · by{' '}
                {year}
              </span>
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

          <div className="travel-map-wrap" ref={mapNearRef}>
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
            <div className="travel-map-frame" ref={mapRef}>
              {/* Still mounted a screen early, so the globe and its geography
                  have loaded before the reel pins and starts scrubbing. */}
              {mapNear ? (
                <TravelMap
                  countries={countries}
                  flightRoutes={flightRoutes}
                  showFlights={showFlights}
                  selectedYear={year}
                  drawIn={mapInView}
                  focus={focus}
                />
              ) : (
                <GlobePlaceholder />
              )}
            </div>
            <p className="travel-map-cap">
              {/* All-time total, independent of the year above — the stage
                  tracks `year`, this caption describes the whole dataset. */}
              All-time: {totalCountries} countries across {totalContinents} continents
              {showFlights ? ` · ${totalFlights} flights` : ''}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
