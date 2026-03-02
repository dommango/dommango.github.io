import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const BLOG_DIR = path.join(process.cwd(), 'content/blog/posts')

export interface BlogPost {
  title: string
  date: string
  description: string
  tags: string[]
  content: string
  slug: string
  published: boolean
}

export function getBlogPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) {
    console.warn('Blog directory not found at', BLOG_DIR)
    return []
  }

  const files = fs.readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.md'))

  const posts = files.map(filename => {
    const fullPath = path.join(BLOG_DIR, filename)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    return {
      title: data.title || '',
      date: data.date || '',
      description: data.description || '',
      tags: data.tags || [],
      content,
      slug: filename.replace('.md', ''),
      published: data.published !== false,
    } as BlogPost
  })

  // Sort by date descending (most recent first) and filter unpublished
  return posts
    .filter(post => post.published)
    .sort((a, b) => {
      const aDate = new Date(a.date)
      const bDate = new Date(b.date)
      return bDate.getTime() - aDate.getTime()
    })
}

export function getBlogPost(slug: string): BlogPost | null {
  const fullPath = path.join(BLOG_DIR, `${slug}.md`)

  if (!fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  return {
    title: data.title || '',
    date: data.date || '',
    description: data.description || '',
    tags: data.tags || [],
    content,
    slug,
    published: data.published !== false,
  }
}
