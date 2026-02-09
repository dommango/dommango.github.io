import { getRoles } from '@/lib/content/roles'
import { Timeline } from '@/components/timeline/Timeline'
import { Section, SectionHeader } from '@/components/ui/Section'

export default async function CareerPage() {
  const roles = getRoles()

  return (
    <Section>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader>
          Career Timeline
          <p className="text-lg text-gray-600 mt-2">
            {roles.length} roles spanning financial services, consulting, and transformation
          </p>
        </SectionHeader>
        <Timeline roles={roles} />
      </div>
    </Section>
  )
}
