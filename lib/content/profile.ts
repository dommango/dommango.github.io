import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const CAREER_DIR = process.env.NODE_ENV === 'production'
  ? path.join(process.cwd(), 'content/career')
  : '/home/dom/career'

export interface CareerTheme {
  title: string
  description: string
}

export interface Profile {
  name: string
  headline: string
  location: string
  email: string
  linkedin: string
  github: string
  website: string
  travel: string
  interests: string[]
  summary: string
  careerThemes: CareerTheme[]
  content: string
}

export function getProfile(): Profile {
  const profilePath = path.join(CAREER_DIR, 'profile.md')

  if (!fs.existsSync(profilePath)) {
    console.warn('Profile file not found at', profilePath)
    return getDefaultProfile()
  }

  const fileContents = fs.readFileSync(profilePath, 'utf8')
  const { data, content } = matter(fileContents)

  // Parse career themes from content
  const careerThemes = parseCareerThemes(content)

  return {
    name: data.name || '',
    headline: data.headline || '',
    location: data.location || '',
    email: data.email || '',
    linkedin: data.linkedin || '',
    github: data.github || '',
    website: data.website || '',
    travel: data.travel || '',
    interests: data.interests || [],
    summary: extractSummary(content),
    careerThemes,
    content,
  }
}

function extractSummary(content: string): string {
  // Extract the Professional Summary section
  const match = content.match(/## Professional Summary\n\n(.+?)(?=\n##|$)/s)
  return match ? match[1].trim() : ''
}

function parseCareerThemes(content: string): CareerTheme[] {
  const themes: CareerTheme[] = []
  const themeMatches = content.matchAll(/### (\d+\..+?)\n(.+?)(?=\n###|\n## |$)/gs)

  for (const match of themeMatches) {
    const title = match[1].replace(/^\d+\.\s*/, '').trim()
    const description = match[2].trim()
    themes.push({ title, description })
  }

  return themes
}

function getDefaultProfile(): Profile {
  return {
    name: 'Professional',
    headline: 'Portfolio',
    location: '',
    email: '',
    linkedin: '',
    github: '',
    website: '',
    travel: '',
    interests: [],
    summary: 'Career information loading...',
    careerThemes: [],
    content: '',
  }
}
