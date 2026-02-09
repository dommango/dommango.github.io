import { Section, SectionHeader } from '@/components/ui/Section'

interface ProfileSummaryProps {
  summary: string
}

export function ProfileSummary({ summary }: ProfileSummaryProps) {
  return (
    <Section className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <SectionHeader>Professional Summary</SectionHeader>
        <div className="prose prose-sm md:prose lg:prose-lg max-w-none text-gray-700">
          <p>{summary}</p>
        </div>
      </div>
    </Section>
  )
}
