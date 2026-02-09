import { getSkills } from '@/lib/content/skills'
import { SkillsGrid } from '@/components/skills/SkillsGrid'
import { Section, SectionHeader } from '@/components/ui/Section'

export default async function SkillsPage() {
  const skills = getSkills()

  return (
    <Section>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader>Skills & Expertise</SectionHeader>
        {skills.technical.length > 0 && (
          <SkillsGrid category="Technical Skills" skills={skills.technical} />
        )}
        {skills.soft.length > 0 && (
          <SkillsGrid category="Soft Skills" skills={skills.soft} />
        )}
        {skills.domain.length > 0 && (
          <SkillsGrid category="Domain Knowledge" skills={skills.domain} />
        )}
      </div>
    </Section>
  )
}
