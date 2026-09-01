import { getTravelData, getFlightRoutes, getFlightStats } from '@/lib/content/travel'
import {
  BrutalistLanding,
  type LandingTravelData,
} from '@/components/landing/BrutalistLanding'

export default function Home() {
  const { countries, stats } = getTravelData()
  const flightRoutes = getFlightRoutes()
  const flightStats = getFlightStats()

  const travel: LandingTravelData = {
    totalCountries: stats.totalCountries,
    totalContinents: stats.continents,
    countries,
    flightRoutes,
    totalFlights: flightStats.totalFlights,
  }

  return <BrutalistLanding travel={travel} />
}
