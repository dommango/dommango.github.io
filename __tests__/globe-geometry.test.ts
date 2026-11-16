import { describe, it, expect } from 'vitest'
import { geoDistance } from 'd3-geo'
import {
  COUNTRY_ISO_MAP,
  airportRadius,
  buildAirports,
  buildRouteArcs,
  focusLonLat,
  isoCountryMap,
  routeWidth,
  sampleArc,
  shortestLonDelta,
  toLonLat,
  visitedIsoCodes,
  type LonLat,
} from '../components/travel/globe-geometry'
import type { Country, FlightRoute } from '../lib/content/travel'

const route = (overrides: Partial<FlightRoute> = {}): FlightRoute => ({
  from: 'JFK',
  to: 'LHR',
  fromCoords: [40.64, -73.78],
  toCoords: [51.47, -0.45],
  count: 1,
  ...overrides,
})

const country = (overrides: Partial<Country> = {}): Country => ({
  id: 'usa',
  name: 'USA',
  flag: '🇺🇸',
  firstVisited: 1986,
  order: 1,
  continent: 'Americas',
  coordinates: [39, -98],
  ...overrides,
})

describe('toLonLat', () => {
  it('swaps the content files [lat, lon] into d3-geo order', () => {
    expect(toLonLat([51.47, -0.45])).toEqual([-0.45, 51.47])
  })
})

describe('shortestLonDelta', () => {
  it('goes the short way across the antimeridian', () => {
    expect(shortestLonDelta(170, -170)).toBe(20)
    expect(shortestLonDelta(-170, 170)).toBe(-20)
  })

  it('is zero for the same longitude', () => {
    expect(shortestLonDelta(45, 45)).toBe(0)
  })

  it('stays inside a half turn for any pair', () => {
    for (let from = -180; from <= 180; from += 15) {
      for (let to = -180; to <= 180; to += 15) {
        const delta = shortestLonDelta(from, to)
        expect(Math.abs(delta)).toBeLessThanOrEqual(180)
      }
    }
  })
})

describe('routeWidth', () => {
  it('grows with the flight count', () => {
    expect(routeWidth(1)).toBeCloseTo(0.95)
    expect(routeWidth(4)).toBeCloseTo(1.4)
  })

  it('caps so a heavily flown route cannot swamp the globe', () => {
    expect(routeWidth(100)).toBe(3)
  })
})

describe('airportRadius', () => {
  it('grows with the flight count and caps', () => {
    expect(airportRadius(0)).toBeCloseTo(2.5)
    expect(airportRadius(1000)).toBe(5)
  })
})

describe('sampleArc', () => {
  const from: LonLat = [-73.78, 40.64]
  const to: LonLat = [-0.45, 51.47]

  it('starts and ends on the endpoints', () => {
    const points = sampleArc(from, to)
    expect(points[0][0]).toBeCloseTo(from[0], 6)
    expect(points[points.length - 1][1]).toBeCloseTo(to[1], 6)
  })

  it('samples more points for a longer arc', () => {
    const short = sampleArc([0, 0], [1, 0])
    const long = sampleArc([-170, 0], [170, 10])
    expect(long.length).toBeGreaterThan(short.length)
  })

  it('never drops below two segments, even for a zero-length hop', () => {
    expect(sampleArc([10, 10], [10, 10]).length).toBe(3)
  })

  it('caps the segment count for an antipodal arc', () => {
    expect(sampleArc([0, 0], [180, 0]).length).toBeLessThanOrEqual(41)
  })

  it('follows the great circle, not a straight line in lon/lat', () => {
    const points = sampleArc([-73.78, 40.64], [-0.45, 51.47])
    const mid = points[Math.floor(points.length / 2)]
    // A great circle between these two bows north of both endpoints.
    expect(mid[1]).toBeGreaterThan(51.47)
  })
})

describe('buildRouteArcs', () => {
  it('buckets widths so routes batch into one stroke per width', () => {
    const arcs = buildRouteArcs([route({ count: 1 }), route({ count: 2 })])
    for (const arc of arcs) {
      expect((arc.width / 0.25) % 1).toBeCloseTo(0, 10)
    }
  })

  it('keeps each arcs midpoint on the sampled great circle', () => {
    const [arc] = buildRouteArcs([route()])
    expect(geoDistance(arc.mid, arc.from)).toBeLessThan(geoDistance(arc.from, arc.to))
  })

  it('converts both endpoints into d3 order', () => {
    const [arc] = buildRouteArcs([route()])
    expect(arc.from).toEqual([-73.78, 40.64])
    expect(arc.to).toEqual([-0.45, 51.47])
  })

  it('returns one arc per route', () => {
    expect(buildRouteArcs([route(), route({ to: 'CDG' })])).toHaveLength(2)
  })
})

describe('buildAirports', () => {
  it('sums the flights of every route touching an airport', () => {
    const airports = buildAirports([
      route({ from: 'JFK', to: 'LHR', count: 3 }),
      route({ from: 'JFK', to: 'CDG', count: 2 }),
    ])
    const jfk = airports.find((a) => a.code === 'JFK')
    expect(jfk?.count).toBe(5)
  })

  it('returns one entry per airport', () => {
    const airports = buildAirports([
      route({ from: 'JFK', to: 'LHR' }),
      route({ from: 'LHR', to: 'JFK' }),
    ])
    expect(airports.map((a) => a.code).sort()).toEqual(['JFK', 'LHR'])
  })

  it('does not mutate the entry it has already stored', () => {
    const airports = buildAirports([
      route({ from: 'JFK', to: 'LHR', count: 3 }),
      route({ from: 'JFK', to: 'CDG', count: 2 }),
    ])
    expect(airports.filter((a) => a.code === 'JFK')).toHaveLength(1)
  })

  it('stores coordinates in d3 order', () => {
    const [first] = buildAirports([route({ from: 'JFK' })])
    expect(first.coords).toEqual([-73.78, 40.64])
  })
})

describe('visitedIsoCodes', () => {
  it('maps country ids onto atlas ISO codes', () => {
    expect(visitedIsoCodes([country({ id: 'usa' }), country({ id: 'japan' })])).toEqual(
      new Set(['840', '392'])
    )
  })

  it('drops ids the atlas map does not know, rather than shading nothing', () => {
    expect(visitedIsoCodes([country({ id: 'atlantis' })]).size).toBe(0)
  })
})

describe('isoCountryMap', () => {
  it('keys countries by their atlas ISO code', () => {
    const map = isoCountryMap([country({ id: 'japan', name: 'Japan' })])
    expect(map.get('392')?.name).toBe('Japan')
  })

  it('omits countries with no ISO code', () => {
    expect(isoCountryMap([country({ id: 'atlantis' })]).size).toBe(0)
  })
})

describe('COUNTRY_ISO_MAP', () => {
  it('keeps the zero padding the atlas uses as its feature ids', () => {
    expect(COUNTRY_ISO_MAP.austria).toBe('040')
    expect(COUNTRY_ISO_MAP.bolivia).toBe('068')
  })

  it('has no duplicate ISO codes, which would shade the wrong country', () => {
    const codes = Object.values(COUNTRY_ISO_MAP)
    expect(new Set(codes).size).toBe(codes.length)
  })
})

describe('focusLonLat', () => {
  it('converts the focus country into d3 order', () => {
    expect(focusLonLat(country({ coordinates: [35.7, 139.7] }))).toEqual([139.7, 35.7])
  })

  it('is undefined for a year that added no country, so the globe holds still', () => {
    expect(focusLonLat(undefined)).toBeUndefined()
  })
})
