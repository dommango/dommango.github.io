import { Section, SectionHeader } from '@/components/ui/Section'

interface ProfileSummaryProps {
  summary: string
}

export function ProfileSummary({ summary }: ProfileSummaryProps) {
  return (
    <Section variant="elevated">
      <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
        <SectionHeader>Professional Summary</SectionHeader>
        <div className="prose prose-lg prose-invert max-w-none">
          <p className="text-text-secondary text-lg md:text-xl leading-relaxed">
            {summary}
          </p>
        </div>
      </div>
    </Section>
  )
}
