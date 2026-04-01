'use client'

import { useState, useCallback, useRef } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
  Sphere
} from 'react-simple-maps'
import { geoOrthographic } from 'd3-geo'
import { Country, FlightRoute } from '@/lib/content/travel'

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

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
  brazil: 'BRA',
  iceland: 'ISL',
  'saudi-arabia': 'SAU',
  oman: 'OMN',
  'united-arab-emirates': 'ARE'
}

interface TravelMapProps {
  countries: Country[]
  flightRoutes?: FlightRoute[]
  selectedYear?: number
  showFlights?: boolean
}

interface TooltipData {
  content: string
  subtext?: string
}

function isVisible(coords: [number, number], rotation: [number, number, number]): boolean {
  const projection = geoOrthographic()
    .rotate(rotation)
    .translate([0, 0])
    .scale(1)
  return projection(coords) !== null
}

export function TravelMap({
  countries,
  flightRoutes = [],
  selectedYear,
  showFlights = false
}: TravelMapProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState<[number, number, number]>([0, -20, 0])
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef<{ x: number; y: number; rotation: [number, number, number] } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const displayedCountries = selectedYear
    ? countries.filter(c => c.firstVisited <= selectedYear)
    : countries

  const visitedIsoCodesSet = new Set(
    displayedCountries.map(c => COUNTRY_ISO_MAP[c.id]).filter(Boolean)
  )

  const isoToCountryMap = new Map<string, Country>()
  displayedCountries.forEach(c => {
    const iso = COUNTRY_ISO_MAP[c.id]
    if (iso) isoToCountryMap.set(iso, c)
  })

  const airportsMap = new Map<string, { code: string; coords: [number, number]; count: number }>()
  if (showFlights) {
    flightRoutes.forEach(route => {
      if (!airportsMap.has(route.from)) {
        airportsMap.set(route.from, { code: route.from, coords: route.fromCoords, count: route.count })
      } else {
        airportsMap.get(route.from)!.count += route.count
      }
      if (!airportsMap.has(route.to)) {
        airportsMap.set(route.to, { code: route.to, coords: route.toCoords, count: route.count })
      } else {
        airportsMap.get(route.to)!.count += route.count
      }
    })
  }
  const airports = Array.from(airportsMap.values())

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY })

    if (isDragging && dragStart.current) {
      const dx = e.clientX - dragStart.current.x
      const dy = e.clientY - dragStart.current.y
      const sensitivity = 0.3
      setRotation([
        dragStart.current.rotation[0] + dx * sensitivity,
        Math.max(-90, Math.min(90, dragStart.current.rotation[1] - dy * sensitivity)),
        0
      ])
    }
  }, [isDragging])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY, rotation: [...rotation] as [number, number, number] }
  }, [rotation])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    dragStart.current = null
  }, [])

  const showCountryTooltip = useCallback((isoCode: string) => {
    const country = isoToCountryMap.get(isoCode)
    if (country) {
      setTooltip({
        content: country.name,
        subtext: `First visited: ${country.firstVisited}`
      })
    }
  }, [])

  const showFlightTooltip = useCallback((from: string, to: string, count: number) => {
    setTooltip({
      content: `${from} → ${to}`,
      subtext: `${count} flight${count > 1 ? 's' : ''}`
    })
  }, [])

  const showAirportTooltip = useCallback((code: string) => {
    setTooltip({ content: code })
  }, [])

  const hideTooltip = useCallback(() => {
    setTooltip(null)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-surface-1 rounded-xl border border-border overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        hideTooltip()
        handleMouseUp()
      }}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {tooltip && (
        <div
          className="fixed z-[9999] bg-gray-900 border border-yellow-600 rounded px-2 py-1 pointer-events-none shadow-lg text-sm"
          style={{
            left: mousePos.x + 15,
            top: mousePos.y + 15
          }}
        >
          <p className="font-medium text-white">{tooltip.content}</p>
          {tooltip.subtext && (
            <p className="text-gray-400 text-xs">{tooltip.subtext}</p>
          )}
        </div>
      )}

      <ComposableMap
        projection="geoOrthographic"
        projectionConfig={{ scale: 250, rotate: rotation }}
        style={{ width: '100%', height: 'auto' }}
        width={500}
        height={500}
      >
        <Sphere
          id="globe-sphere"
          fill="#0a0f1a"
          stroke="#1a1a1a"
          strokeWidth={0.5}
        />
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map(geo => {
              const isoCode = geo.id as string
              const isVisited = visitedIsoCodesSet.has(isoCode)

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isVisited ? '#b8922f' : '#2a2a2a'}
                  stroke="#1a1a1a"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: {
                      fill: isVisited ? '#d4a847' : '#3a3a3a',
                      outline: 'none',
                      cursor: isVisited ? 'pointer' : 'default'
                    },
                    pressed: { outline: 'none' }
                  }}
                  onMouseEnter={() => {
                    if (isVisited) showCountryTooltip(isoCode)
                  }}
                  onMouseLeave={hideTooltip}
                />
              )
            })
          }
        </Geographies>

        {showFlights && flightRoutes.map((route, idx) => {
          const from: [number, number] = [route.fromCoords[1], route.fromCoords[0]]
          const to: [number, number] = [route.toCoords[1], route.toCoords[0]]
          const fromVisible = isVisible(from, rotation)
          const toVisible = isVisible(to, rotation)
          if (!fromVisible && !toVisible) return null

          return (
            <Line
              key={`flight-${route.from}-${route.to}-${idx}`}
              from={from}
              to={to}
              stroke="rgba(212, 168, 71, 0.6)"
              strokeWidth={Math.min(0.8 + route.count * 0.15, 3)}
              strokeLinecap="round"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => showFlightTooltip(route.from, route.to, route.count)}
              onMouseLeave={hideTooltip}
            />
          )
        })}

        {showFlights && airports.map(airport => {
          const coords: [number, number] = [airport.coords[1], airport.coords[0]]
          if (!isVisible(coords, rotation)) return null

          return (
            <Marker
              key={`airport-${airport.code}`}
              coordinates={coords}
              onMouseEnter={() => showAirportTooltip(airport.code)}
              onMouseLeave={hideTooltip}
            >
              <circle
                r={Math.min(2.5 + airport.count * 0.05, 5)}
                fill="#d4a847"
                stroke="#1a1a1a"
                strokeWidth={0.5}
                style={{ cursor: 'pointer' }}
              />
            </Marker>
          )
        })}
      </ComposableMap>
    </div>
  )
}
