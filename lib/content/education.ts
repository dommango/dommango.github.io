import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const CAREER_DIR = process.env.NODE_ENV === 'production'
  ? path.join(process.cwd(), 'content/career')
  : '/home/dom/career'

export interface Degree {
  school: string
  degree: string
  field: string
  graduation_year: number
  gpa?: string
  content: string
  slug: string
}

export interface Education {
  degrees: Degree[]
}

export function getEducation(): Education {
  const educationDir = path.join(CAREER_DIR, 'education')

  if (!fs.existsSync(educationDir)) {
    console.warn('Education directory not found at', educationDir)
    return { degrees: [] }
  }

  const files = fs.readdirSync(educationDir)
    .filter(f => f.endsWith('.md') && f !== '_index.md')

  const degrees = files.map(filename => {
    const fullPath = path.join(educationDir, filename)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    return {
      school: data.school || '',
      degree: data.degree || '',
      field: data.field || '',
      graduation_year: data.graduation_year || new Date().getFullYear(),
      gpa: data.gpa || '',
      content,
      slug: filename.replace('.md', ''),
    } as Degree
  })

  // Sort by graduation year descending (most recent first)
  return {
    degrees: degrees.sort((a, b) => b.graduation_year - a.graduation_year),
  }
}
