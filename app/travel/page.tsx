import { Section } from '@/components/ui/Section'
import { TravelStats } from '@/components/travel/TravelStats'
import { TravelMap } from '@/components/travel/TravelMap'
import { CountryGrid } from '@/components/travel/CountryCard'
import { getTravelData, getRecentCountries, getCountriesByRegion } from '@/lib/content/travel'

export const metadata = {
  title: 'Travel',
  description: '52+ countries across 5 continents - explore my travel journey from 1986 to 2024'
}

export default function TravelPage() {
  const { countries, stats } = getTravelData()
  const recentCountries = getRecentCountries(1)
  const countriesByRegion = getCountriesByRegion()

  const recentCountry = recentCountries[0]
    ? {
        name: recentCountries[0].name,
        flag: recentCountries[0].flag,
        year: recentCountries[0].firstVisited
      }
    : undefined

  return (
    <>
      {/* Hero Section */}
      <Section className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          Travel Adventures
        </h1>
        <p className="text-xl text-text-secondary max-w-3xl mx-auto">
          Exploring the world one country at a time.{' '}
          <span className="text-accent-gold font-semibold">
            {stats.totalCountries}+ countries
          </span>{' '}
          across{' '}
          <span className="text-accent-gold font-semibold">
            {stats.continents} continents
          </span>
        </p>
      </Section>

      {/* Stats Cards */}
      <Section>
        <TravelStats stats={stats} recentCountry={recentCountry} />
      </Section>

      {/* Interactive Map */}
      <Section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Interactive Map
          </h2>
          <p className="text-text-secondary">
            Click on markers to explore visited countries. Countries highlighted in gold.
          </p>
        </div>
        <TravelMap countries={countries} />
      </Section>

      {/* Countries by Continent */}
      <Section>
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Countries by Continent
        </h2>
        <div className="space-y-10">
          {Object.entries(countriesByRegion)
            .sort(([continentA], [continentB]) => continentA.localeCompare(continentB))
            .map(([continent, continentCountries]) => (
              <div key={continent}>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-xl font-semibold text-accent-gold">
                    {continent}
                  </h3>
                  <span className="text-sm text-text-muted">
                    {continentCountries.length} {continentCountries.length === 1 ? 'country' : 'countries'}
                  </span>
                </div>
                <CountryGrid countries={continentCountries} />
              </div>
            ))}
        </div>
      </Section>
    </>
  )
}
