'use client'

import { useState } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from 'react-simple-maps'
import { Country } from '@/lib/content/travel'

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

// ISO country code mapping for highlighting
const COUNTRY_ISO_MAP: Record<string, string> = {
  usa: 'USA',
  philippines: 'PHL',
  canada: 'CAN',
  grenada: 'GRD',
  sweden: 'SWE',
  estonia: 'EST',
  russia: 'RUS',
  finland: 'FIN',
  'dominican-republic': 'DOM',
  uk: 'GBR',
  france: 'FRA',
  monaco: 'MCO',
  italy: 'ITA',
  'vatican-city': 'VAT',
  greece: 'GRC',
  austria: 'AUT',
  switzerland: 'CHE',
  'czech-republic': 'CZE',
  germany: 'DEU',
  liechtenstein: 'LIE',
  netherlands: 'NLD',
  'costa-rica': 'CRI',
  jamaica: 'JAM',
  colombia: 'COL',
  panama: 'PAN',
  'hong-kong': 'HKG',
  cambodia: 'KHM',
  bolivia: 'BOL',
  chile: 'CHL',
  peru: 'PER',
  morocco: 'MAR',
  cuba: 'CUB',
  japan: 'JPN',
  china: 'CHN',
  vietnam: 'VNM',
  thailand: 'THA',
  malaysia: 'MYS',
  singapore: 'SGP',
  turkey: 'TUR',
  hungary: 'HUN',
  denmark: 'DNK',
  poland: 'POL',
  mexico: 'MEX',
  nepal: 'NPL',
  india: 'IND',
  'south-korea': 'KOR',
  spain: 'ESP',
  portugal: 'PRT',
  taiwan: 'TWN',
  qatar: 'QAT',
  argentina: 'ARG',
  brazil: 'BRA'
}

interface TravelMapProps {
  countries: Country[]
  selectedYear?: number
  onCountryClick?: (country: Country) => void
}

export function TravelMap({
  countries,
  selectedYear,
  onCountryClick
}: TravelMapProps) {
  const [tooltip, setTooltip] = useState<{
    name: string
    year: number
    x: number
    y: number
  } | null>(null)

  // Filter countries by selected year if provided
  const displayedCountries = selectedYear
    ? countries.filter(c => c.firstVisited <= selectedYear)
    : countries

  // Create set of visited country ISO codes for quick lookup
  const visitedIsoCodes = new Set(
    displayedCountries.map(c => COUNTRY_ISO_MAP[c.id]).filter(Boolean)
  )

  // Create map of country ID to country data for marker click handling
  const countryMap = new Map(countries.map(c => [c.id, c]))

  return (
    <div className="relative w-full bg-surface-1 rounded-xl border border-border overflow-hidden">
      {tooltip && (
        <div
          className="absolute z-50 bg-surface-2 border border-accent-gold-muted rounded-lg px-3 py-2 pointer-events-none shadow-lg"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -120%)'
          }}
        >
          <p className="font-semibold text-text-primary">{tooltip.name}</p>
          <p className="text-sm text-text-muted">First visited: {tooltip.year}</p>
        </div>
      )}

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 140,
          center: [0, 20]
        }}
        style={{
          width: '100%',
          height: 'auto'
        }}
      >
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map(geo => {
                const isoCode = geo.id
                const isVisited = visitedIsoCodes.has(isoCode)

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={isVisited ? '#d4a847' : '#2a2a2a'}
                    stroke="#1a1a1a"
                    strokeWidth={0.5}
                    style={{
                      default: {
                        outline: 'none'
                      },
                      hover: {
                        fill: isVisited ? '#e6c56a' : '#3a3a3a',
                        outline: 'none',
                        cursor: isVisited ? 'pointer' : 'default'
                      },
                      pressed: {
                        fill: isVisited ? '#b8922f' : '#2a2a2a',
                        outline: 'none'
                      }
                    }}
                  />
                )
              })
            }
          </Geographies>

          {/* Markers for visited countries */}
          {displayedCountries.map(country => (
            <Marker
              key={country.id}
              coordinates={[country.coordinates[1], country.coordinates[0]]}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                setTooltip({
                  name: country.name,
                  year: country.firstVisited,
                  x: rect.left + rect.width / 2,
                  y: rect.top
                })
              }}
              onMouseLeave={() => setTooltip(null)}
              onClick={() => onCountryClick?.(country)}
            >
              <circle
                r={3}
                fill="#d4a847"
                stroke="#1a1a1a"
                strokeWidth={1}
                className="hover:fill-accent-gold-bright transition-colors cursor-pointer"
              />
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  )
}
