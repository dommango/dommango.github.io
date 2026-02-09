import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { SkillItem } from '@/lib/content/skills'

interface SkillsGridProps {
  category: string
  skills: SkillItem[]
}

export function SkillsGrid({ category, skills }: SkillsGridProps) {
  return (
    <div className="mb-12">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">{category}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skills.map((skill, index) => (
          <Card key={index} className="p-4 md:p-6">
            <CardHeader className="mb-3 pb-2">
              <div className="flex items-start justify-between">
                <h4 className="font-semibold text-gray-900">{skill.name}</h4>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {skill.proficiency}
                </span>
              </div>
            </CardHeader>
            {skill.evidence && (
              <CardBody className="text-xs text-gray-600 italic">
                {skill.evidence}
              </CardBody>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
