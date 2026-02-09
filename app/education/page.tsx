import { getEducation } from '@/lib/content/education'
import { EducationSection } from '@/components/education/EducationSection'
import { Section, SectionHeader } from '@/components/ui/Section'

export default async function EducationPage() {
  const { degrees } = getEducation()

  return (
    <Section>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <SectionHeader>Education</SectionHeader>
        <EducationSection degrees={degrees} />
      </div>
    </Section>
  )
}
