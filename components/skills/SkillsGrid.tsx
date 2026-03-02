import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { SkillItem } from '@/lib/content/skills'

interface SkillsGridProps {
  category: string
  skills: SkillItem[]
}

export function SkillsGrid({ category, skills }: SkillsGridProps) {
  return (
    <div className="mb-16">
      <h3 className="text-2xl font-bold text-foreground mb-8">{category}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skills.map((skill, index) => (
          <Card key={index} className="p-5 md:p-6">
            <CardHeader className="mb-3 pb-3">
              <div className="flex items-start justify-between">
                <h4 className="font-semibold text-foreground">{skill.name}</h4>
                <span className="text-xs font-medium text-accent-gold bg-accent-gold-subtle px-2.5 py-1 rounded-md">
                  {skill.proficiency}
                </span>
              </div>
            </CardHeader>
            {skill.evidence && (
              <CardBody className="text-xs text-text-muted italic">
                {skill.evidence}
              </CardBody>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
