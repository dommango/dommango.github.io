import Image from 'next/image'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Role } from '@/lib/content/roles'
import { format } from 'date-fns'

interface TimelineProps {
  roles: Role[]
}

function CompanyLogo({ logo, company }: { logo?: string; company: string }) {
  if (logo) {
    return (
      <Image
        src={logo}
        alt={`${company} logo`}
        width={32}
        height={32}
        className="object-contain rounded-sm shrink-0"
      />
    )
  }

  const initials = company
    .split(/[\s,&.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0].toUpperCase())
    .join('')

  return (
    <div
      className="w-8 h-8 rounded-sm bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0"
      aria-hidden="true"
    >
      <span className="text-xs font-semibold text-gray-500 leading-none">
        {initials}
      </span>
    </div>
  )
}

export function Timeline({ roles }: TimelineProps) {
  return (
    <div className="space-y-6">
      {roles.map(role => (
        <Card key={role.slug} className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-300 rounded-l-lg" />
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {role.title}
                </h3>
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                  <CompanyLogo logo={role.logo} company={role.company} />
                  <span>
                    {role.company}
                    {role.location && ` • ${role.location}`}
                  </span>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-500 whitespace-nowrap">
                {format(new Date(role.start_date), 'MMM yyyy')} -{' '}
                {role.end_date === 'present'
                  ? 'Present'
                  : format(new Date(role.end_date), 'MMM yyyy')}
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="prose prose-sm max-w-none text-gray-700 mb-4">
              {role.content.split('\n\n')[0]}
            </div>
            {role.skills && role.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {role.skills.slice(0, 5).map(skill => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
                {role.skills.length > 5 && (
                  <Badge variant="secondary">
                    +{role.skills.length - 5} more
                  </Badge>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      ))}
    </div>
  )
}
