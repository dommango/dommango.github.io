import travelData from '@/content/travel/countries.json'

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
