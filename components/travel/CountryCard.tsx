'use client'

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Country } from '@/lib/content/travel'

interface CountryCardProps {
  country: Country
  onClick?: () => void
}

export function CountryCard({ country, onClick }: CountryCardProps) {
  return (
    <div
      className="cursor-pointer transition-transform hover:scale-105"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      <Card>
        <div className="flex items-start gap-4">
          <div className="text-4xl" aria-hidden="true">
            {country.flag}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground mb-1">
              {country.name}
            </h3>
            <div className="flex flex-wrap gap-2 items-center text-sm text-text-muted">
              <span>First visited: {country.firstVisited}</span>
              <span className="text-border">•</span>
              <Badge variant="secondary" size="sm">
                {country.continent}
              </Badge>
            </div>
            <p className="text-xs text-text-muted mt-2">
              #{country.order} in chronological order
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

interface CountryGridProps {
  countries: Country[]
  onCountryClick?: (country: Country) => void
}

export function CountryGrid({ countries, onCountryClick }: CountryGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {countries.map(country => (
        <CountryCard
          key={country.id}
          country={country}
          onClick={() => onCountryClick?.(country)}
        />
      ))}
    </div>
  )
}
