import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Degree } from '@/lib/content/education'

interface EducationSectionProps {
  degrees: Degree[]
}

export function EducationSection({ degrees }: EducationSectionProps) {
  return (
    <div className="space-y-8">
      {degrees.map(degree => (
        <Card key={degree.slug}>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-foreground">
                  {degree.degree}
                </h3>
                <div className="mt-2 text-sm text-text-secondary">
                  {degree.school}
                  {degree.field && ` \u2022 ${degree.field}`}
                </div>
              </div>
              <div className="text-sm font-medium text-text-muted">
                {degree.graduation_year}
              </div>
            </div>
            {degree.gpa && (
              <div className="mt-4">
                <Badge variant="primary">GPA: {degree.gpa}</Badge>
              </div>
            )}
          </CardHeader>
          {degree.content && (
            <CardBody>
              <div className="prose prose-sm prose-invert max-w-none text-text-secondary">
                {degree.content.split('\n\n')[0]}
              </div>
            </CardBody>
          )}
        </Card>
      ))}
    </div>
  )
}
