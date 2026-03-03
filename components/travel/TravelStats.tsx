import { Card } from '@/components/ui/Card'
import { TravelStats as TravelStatsType } from '@/lib/content/travel'

interface TravelStatsProps {
  stats: TravelStatsType
  recentCountry?: {
    name: string
    flag: string
    year: number
  }
}

export function TravelStats({ stats, recentCountry }: TravelStatsProps) {
  const statCards = [
    {
      label: 'Countries Visited',
      value: stats.totalCountries,
      description: 'Across 5 continents'
    },
    {
      label: 'Continents',
      value: stats.continents,
      description: stats.continentNames.join(', ')
    },
    {
      label: 'Years Traveling',
      value: stats.lastYear - stats.firstYear + 1,
      description: `Since ${stats.firstYear}`
    },
    ...(recentCountry
      ? [
          {
            label: 'Most Recent',
            value: `${recentCountry.flag} ${recentCountry.name}`,
            description: recentCountry.year.toString()
          }
        ]
      : [])
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} hover={false} className="text-center">
          <div className="space-y-2">
            <p className="text-sm font-medium text-text-muted uppercase tracking-wide">
              {stat.label}
            </p>
            <p className="text-3xl font-bold text-accent-gold">
              {stat.value}
            </p>
            <p className="text-sm text-text-secondary">
              {stat.description}
            </p>
          </div>
        </Card>
      ))}
    </div>
  )
}
