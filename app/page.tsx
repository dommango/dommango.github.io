import { getTravelData, getFlightRoutes, getFlightStats } from '@/lib/content/travel'
import {
  BrutalistLanding,
  type LandingTravelData,
} from '@/components/landing/BrutalistLanding'
import type { ContinentBar } from '@/components/landing/Travel'

function buildContinentBars(byContinent: Record<string, number>): ContinentBar[] {
  const entries = Object.entries(byContinent).sort(([, a], [, b]) => b - a)
  const max = entries.length > 0 ? entries[0][1] : 1

  return entries.map(([name, count]) => ({
    name,
    count,
    pct: Math.round((count / max) * 100),
  }))
}

export default function Home() {
  const { countries, stats } = getTravelData()
  const flightRoutes = getFlightRoutes()
  const flightStats = getFlightStats()

  const travel: LandingTravelData = {
    continents: buildContinentBars(stats.countriesByContinent),
    totalCountries: stats.totalCountries,
    totalContinents: stats.continents,
    countries,
    flightRoutes,
    totalFlights: flightStats.totalFlights,
  }

  return <BrutalistLanding travel={travel} />
}
