// Pure geometry and lookups behind the canvas globe. Nothing here touches the
// DOM or a canvas context, so the fiddly parts (coordinate order, shortest way
// round the globe, airport roll-ups) are unit-testable on their own.
import { geoDistance, geoInterpolate } from 'd3-geo'
import type { Country, FlightRoute } from '@/lib/content/travel'

/** [longitude, latitude] — d3-geo's order, not the content files'. */
export type LonLat = [number, number]
export type Rotation = [number, number, number]

/**
 * The globe was authored in a 500-unit SVG viewBox; stroke widths and marker
 * radii below are still in those units and get scaled by size / GLOBE_UNITS.
 */
export const GLOBE_UNITS = 500

// world-atlas@2 countries-110m.json uses zero-padded numeric ISO 3166-1 codes as geo.id
export const COUNTRY_ISO_MAP: Record<string, string> = {
  usa: "840",
  philippines: "608",
  canada: "124",
  grenada: "308",
  sweden: "752",
  estonia: "233",
  russia: "643",
  finland: "246",
  "dominican-republic": "214",
  uk: "826",
  france: "250",
  monaco: "492",
  italy: "380",
  "vatican-city": "336",
  greece: "300",
  austria: "040",
  switzerland: "756",
  "czech-republic": "203",
  germany: "276",
  liechtenstein: "438",
  netherlands: "528",
  "costa-rica": "188",
  jamaica: "388",
  colombia: "170",
  panama: "591",
  "hong-kong": "344",
  cambodia: "116",
  bolivia: "068",
  chile: "152",
  peru: "604",
  morocco: "504",
  cuba: "192",
  japan: "392",
  china: "156",
  vietnam: "704",
  thailand: "764",
  malaysia: "458",
  singapore: "702",
  turkey: "792",
  hungary: "348",
  denmark: "208",
  poland: "616",
  mexico: "484",
  nepal: "524",
  india: "356",
  "south-korea": "410",
  spain: "724",
  portugal: "620",
  taiwan: "158",
  qatar: "634",
  argentina: "032",
  brazil: "076",
  iceland: "352",
  "saudi-arabia": "682",
  oman: "512",
  "united-arab-emirates": "784",
};

/** The travel content files store coordinates as [lat, lon]; d3-geo wants [lon, lat]. */
export const toLonLat = ([lat, lon]: [number, number]): LonLat => [lon, lat]

export const clamp = (value: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, value))

/** Signed degrees from `from` to `to` taking the short way round (-180..180). */
export const shortestLonDelta = (from: number, to: number): number =>
  ((to - from + 540) % 360) - 180

/** Stroke width (in globe units) for a route flown `count` times. */
export const routeWidth = (count: number): number => Math.min(0.8 + count * 0.15, 3)

/** Marker radius (in globe units) for an airport with `count` flights. */
export const airportRadius = (count: number): number => Math.min(2.5 + count * 0.05, 5)

/**
 * A flight route prepared for drawing: the great circle already sampled into
 * points, in d3's coordinate order, with its stroke width bucketed so routes
 * batch into one stroke per width.
 *
 * Sampling here rather than letting geoPath resample a two-point LineString is
 * what makes the reel affordable: the points are in geographic space, so they
 * survive every rotation and each frame only has to project them.
 */
export interface RouteArc {
  route: FlightRoute
  from: LonLat
  to: LonLat
  mid: LonLat
  points: LonLat[]
  width: number
}

/** Route widths collapse onto this grid so one stroke can cover many routes. */
const WIDTH_BUCKET = 0.25
/** Degrees of great circle per sampled segment. */
const ARC_SEGMENT_DEG = 6
const MIN_ARC_SEGMENTS = 2
const MAX_ARC_SEGMENTS = 40

export function sampleArc(from: LonLat, to: LonLat): LonLat[] {
  const along = geoInterpolate(from, to)
  const lengthDeg = geoDistance(from, to) * (180 / Math.PI)
  const segments = clamp(
    Math.round(lengthDeg / ARC_SEGMENT_DEG),
    MIN_ARC_SEGMENTS,
    MAX_ARC_SEGMENTS
  )
  return Array.from({ length: segments + 1 }, (_, i) => along(i / segments) as LonLat)
}

export function buildRouteArcs(routes: FlightRoute[]): RouteArc[] {
  return routes.map((route) => {
    const from = toLonLat(route.fromCoords)
    const to = toLonLat(route.toCoords)
    const points = sampleArc(from, to)
    return {
      route,
      from,
      to,
      mid: points[Math.floor(points.length / 2)],
      points,
      width: Math.round(routeWidth(route.count) / WIDTH_BUCKET) * WIDTH_BUCKET,
    }
  })
}

export interface Airport {
  code: string
  coords: LonLat
  count: number
}

/** One entry per airport, summing the flights of every route that touches it. */
export function buildAirports(routes: FlightRoute[]): Airport[] {
  const byCode = new Map<string, Airport>()
  for (const route of routes) {
    const ends: ReadonlyArray<[string, [number, number]]> = [
      [route.from, route.fromCoords],
      [route.to, route.toCoords],
    ]
    for (const [code, coords] of ends) {
      const seen = byCode.get(code)
      byCode.set(
        code,
        seen
          ? { ...seen, count: seen.count + route.count }
          : { code, coords: toLonLat(coords), count: route.count }
      )
    }
  }
  return Array.from(byCode.values())
}

/** ISO codes of the countries the atlas should shade as visited. */
export const visitedIsoCodes = (countries: Country[]): Set<string> =>
  new Set(countries.map((c) => COUNTRY_ISO_MAP[c.id]).filter(Boolean))

/** ISO code → country, for the hover tooltip. */
export function isoCountryMap(countries: Country[]): Map<string, Country> {
  return new Map(
    countries
      .map((c) => [COUNTRY_ISO_MAP[c.id], c] as const)
      .filter((entry): entry is [string, Country] => Boolean(entry[0]))
  )
}

/** Where the globe should swing to show a year's first new country. */
export const focusLonLat = (country?: Country): LonLat | undefined =>
  country ? toLonLat(country.coordinates) : undefined
