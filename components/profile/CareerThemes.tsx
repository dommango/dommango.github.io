import { Section, SectionHeader } from '@/components/ui/Section'
import { Card, CardBody } from '@/components/ui/Card'
import { CareerTheme } from '@/lib/content/profile'

interface CareerThemesProps {
  themes: CareerTheme[]
}

export function CareerThemes({ themes }: CareerThemesProps) {
  if (themes.length === 0) {
    return null
  }

  return (
    <Section className="bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader>Career Themes</SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme, index) => (
            <Card key={index} className="h-full">
              <CardBody>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {theme.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {theme.description}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  )
}
