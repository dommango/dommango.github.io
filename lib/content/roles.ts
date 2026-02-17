import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const CAREER_DIR = process.env.NODE_ENV === 'production'
  ? path.join(process.cwd(), 'content/career')
  : '/home/dom/career'

export interface Role {
  title: string
  company: string
  start_date: string
  end_date: string
  location: string
  tags?: string[]
  skills?: string[]
  content: string
  slug: string
  logo?: string
}

export function getRoles(): Role[] {
  const rolesDir = path.join(CAREER_DIR, 'roles')

  if (!fs.existsSync(rolesDir)) {
    console.warn('Roles directory not found at', rolesDir)
    return []
  }

  const files = fs.readdirSync(rolesDir)
    .filter(f => f.endsWith('.md') && f !== '_index.md')

  const roles = files.map(filename => {
    const fullPath = path.join(rolesDir, filename)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    return {
      title: data.title || '',
      company: data.company || '',
      start_date: data.start_date || '',
      end_date: data.end_date || '',
      location: data.location || '',
      tags: data.tags || [],
      skills: data.skills || [],
      content,
      slug: filename.replace('.md', ''),
      logo: data.logo || undefined,
    } as Role
  })

  // Sort by start_date descending (most recent first)
  return roles.sort((a, b) => {
    const aDate = a.end_date === 'present' ? new Date() : new Date(a.end_date)
    const bDate = b.end_date === 'present' ? new Date() : new Date(b.end_date)
    return bDate.getTime() - aDate.getTime()
  })
}
