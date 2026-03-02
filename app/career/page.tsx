import { getRoles } from '@/lib/content/roles'
import { Timeline } from '@/components/timeline/Timeline'
import { Section, SectionHeader } from '@/components/ui/Section'

export default async function CareerPage() {
  const roles = getRoles()

  return (
    <Section>
      <div className="container mx-auto px-6 lg:px-8">
        <SectionHeader subtitle={`${roles.length} roles spanning financial services, consulting, and transformation`}>
          Career Timeline
        </SectionHeader>
        <Timeline roles={roles} />
      </div>
    </Section>
  )
}
