import travelData from '@/content/travel/countries.json'
import flightData from '@/content/travel/flights.json'

export interface Country {
  id: string
  name: string
  flag: string
  firstVisited: number
  order: number
  continent: string
  coordinates: [number, number]
}

export interface TravelStats {
  totalCountries: number
  continents: number
  continentNames: string[]
  yearRange: string
  firstYear: number
  lastYear: number
  countriesByContinent: Record<string, number>
}

export interface TravelData {
  countries: Country[]
  stats: TravelStats
}

/**
 * Get all travel data including countries and stats
 */
export function getTravelData(): TravelData {
  // Cast the imported JSON data to our TypeScript interface
  // The coordinates in the JSON are guaranteed to be [number, number] tuples
  return {
    countries: travelData.countries.map(c => ({
      ...c,
      coordinates: c.coordinates as [number, number]
    })),
    stats: travelData.stats
  } as TravelData
}

/**
 * Helper to cast country data with proper coordinate types
 */
function castCountry(c: typeof travelData.countries[0]): Country {
  return {
    ...c,
    coordinates: c.coordinates as [number, number]
  }
}

/**
 * Get countries filtered by year (up to and including the specified year)
 */
export function getCountriesByYear(year: number): Country[] {
  return travelData.countries
    .filter(c => c.firstVisited <= year)
    .map(castCountry)
}

/**
 * Get countries by continent
 */
export function getCountriesByContinent(continent: string): Country[] {
  return travelData.countries
    .filter(c => c.continent === continent)
    .map(castCountry)
}

/**
 * Get all unique continents visited
 */
export function getContinents(): string[] {
  return travelData.stats.continentNames
}

/**
 * Get countries sorted by visit order (chronological)
 */
export function getCountriesChronological(): Country[] {
  return [...travelData.countries]
    .sort((a, b) => a.order - b.order)
    .map(castCountry)
}

/**
 * Get countries sorted by continent, then alphabetically
 */
export function getCountriesByRegion(): Record<string, Country[]> {
  const byContinent: Record<string, Country[]> = {}

  travelData.countries.forEach(country => {
    const c = castCountry(country)
    if (!byContinent[c.continent]) {
      byContinent[c.continent] = []
    }
    byContinent[c.continent].push(c)
  })

  // Sort countries within each continent alphabetically
  Object.keys(byContinent).forEach(continent => {
    byContinent[continent].sort((a, b) => a.name.localeCompare(b.name))
  })

  return byContinent
}

/**
 * Get most recently visited countries (last N)
 */
export function getRecentCountries(count: number = 5): Country[] {
  return [...travelData.countries]
    .sort((a, b) => b.firstVisited - a.firstVisited)
    .slice(0, count)
    .map(castCountry)
}

export interface ContinentBar {
  name: string
  count: number
  pct: number
}

/** Countries first visited on or before `year` (all of them if `year` is omitted). */
export const countriesUpTo = (countries: Country[], year?: number): Country[] =>
  year ? countries.filter((c) => c.firstVisited <= year) : countries

/** Continent bars for the countries first visited on or before `year`. */
export function buildContinentBars(countries: Country[], year?: number): ContinentBar[] {
  const visible = countriesUpTo(countries, year)
  const counts = visible.reduce<Record<string, number>>(
    (acc, c) => ({ ...acc, [c.continent]: (acc[c.continent] ?? 0) + 1 }),
    {}
  )
  const entries = Object.entries(counts).sort(([, a], [, b]) => b - a)
  const max = entries.length > 0 ? entries[0][1] : 1
  return entries.map(([name, count]) => ({ name, count, pct: Math.round((count / max) * 100) }))
}

/** [earliest, latest] firstVisited year across `countries`. */
export const yearBounds = (countries: Country[]): [number, number] => {
  const years = countries.map((c) => c.firstVisited)
  return [Math.min(...years), Math.max(...years)]
}

export interface PlayState {
  year: number
  playing: boolean
}

/**
 * Decide the next {year, playing} when the scrubber's Play/Stop button is
 * clicked. Stop only ever stops. Restarting from `max` resets to `min`, not
 * `min - 1` — a range input clamps an out-of-bounds value to its own `min`,
 * which desyncs the rendered year label from the slider thumb.
 */
export function nextPlayState(state: PlayState, min: number, max: number): PlayState {
  if (state.playing) return { year: state.year, playing: false }
  return { year: state.year >= max ? min : state.year, playing: true }
}

// Flight data types and functions
export interface FlightRoute {
  from: string
  to: string
  fromCoords: [number, number]
  toCoords: [number, number]
  count: number
}

export interface FlightStats {
  totalFlights: number
  totalRoutes: number
}

/**
 * Get flight routes data
 */
export function getFlightRoutes(): FlightRoute[] {
  return flightData.routes.map(r => ({
    ...r,
    fromCoords: r.fromCoords as [number, number],
    toCoords: r.toCoords as [number, number]
  }))
}

/**
 * Get flight statistics
 */
export function getFlightStats(): FlightStats {
  return {
    totalFlights: flightData.totalFlights,
    totalRoutes: flightData.routes.length
  }
}
