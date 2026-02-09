import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Degree } from '@/lib/content/education'

interface EducationSectionProps {
  degrees: Degree[]
}

export function EducationSection({ degrees }: EducationSectionProps) {
  return (
    <div className="space-y-6">
      {degrees.map(degree => (
        <Card key={degree.slug}>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {degree.degree}
                </h3>
                <div className="mt-1 text-sm text-gray-600">
                  {degree.school}
                  {degree.field && ` • ${degree.field}`}
                </div>
              </div>
              <div className="text-sm font-medium text-gray-500">
                {degree.graduation_year}
              </div>
            </div>
            {degree.gpa && (
              <div className="mt-3">
                <Badge variant="primary">GPA: {degree.gpa}</Badge>
              </div>
            )}
          </CardHeader>
          {degree.content && (
            <CardBody>
              <div className="prose prose-sm max-w-none text-gray-700">
                {degree.content.split('\n\n')[0]}
              </div>
            </CardBody>
          )}
        </Card>
      ))}
    </div>
  )
}
