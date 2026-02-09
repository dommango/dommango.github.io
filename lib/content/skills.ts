import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const CAREER_DIR = process.env.NODE_ENV === 'production'
  ? path.join(process.cwd(), 'content/career')
  : '/home/dom/career'

export interface SkillItem {
  name: string
  proficiency: string
  evidence?: string
}

export interface SkillCategory {
  category: string
  skills: SkillItem[]
}

export interface Skills {
  technical: SkillItem[]
  soft: SkillItem[]
  domain: SkillItem[]
  content: string
}

export function getSkills(): Skills {
  const skillsPath = path.join(CAREER_DIR, 'skills', '_index.md')

  if (!fs.existsSync(skillsPath)) {
    console.warn('Skills file not found at', skillsPath)
    return getDefaultSkills()
  }

  const fileContents = fs.readFileSync(skillsPath, 'utf8')
  const { content } = matter(fileContents)

  return {
    technical: parseSkillsSection(content, 'Technical Skills'),
    soft: parseSkillsSection(content, 'Soft Skills'),
    domain: parseSkillsSection(content, 'Domain Knowledge'),
    content,
  }
}

function parseSkillsSection(content: string, sectionName: string): SkillItem[] {
  const skills: SkillItem[] = []

  // Find the section
  const sectionRegex = new RegExp(`## ${sectionName}\\n\\n(.+?)(?=\\n## |$)`, 's')
  const match = content.match(sectionRegex)

  if (!match) return skills

  const sectionContent = match[1]

  // Parse table rows
  const tableRegex = /\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|/g
  let row
  let isHeader = true

  while ((row = tableRegex.exec(sectionContent)) !== null) {
    // Skip header row
    if (isHeader) {
      isHeader = false
      continue
    }

    const name = row[1].trim()
    const proficiency = row[2].trim()
    const evidence = row[3].trim()

    if (name && proficiency) {
      skills.push({
        name,
        proficiency,
        evidence,
      })
    }
  }

  return skills
}

function getDefaultSkills(): Skills {
  return {
    technical: [],
    soft: [],
    domain: [],
    content: '',
  }
}
