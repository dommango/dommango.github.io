import { getBlogPost, getBlogPosts } from '@/lib/content/blog'
import { Section } from '@/components/ui/Section'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = getBlogPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getBlogPost(slug)

  if (!post) {
    return { title: 'Post Not Found' }
  }

  return {
    title: `${post.title} | Dom Mangonon`,
    description: post.description,
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getBlogPost(slug)

  if (!post) {
    notFound()
  }

  return (
    <Section>
      <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
        <Link
          href="/blog"
          className="inline-flex items-center text-text-secondary hover:text-accent-gold transition-colors mb-8"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Blog
        </Link>

        <article>
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-text-secondary">
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              <span className="text-border">|</span>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </header>

          <div className="prose prose-invert prose-gold max-w-none">
            <div
              className="text-text-secondary leading-relaxed space-y-6"
              dangerouslySetInnerHTML={{
                __html: post.content
                  .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold text-foreground mt-12 mb-4">$1</h2>')
                  .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-foreground mt-8 mb-3">$1</h3>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
                  .replace(/(<li.*<\/li>\n?)+/g, '<ul class="list-disc ml-4 space-y-2">$&</ul>')
                  .replace(/^(?!<[hul])(.*$)/gim, (match) => match.trim() ? `<p>${match}</p>` : '')
                  .replace(/---/g, '<hr class="border-border my-8" />')
              }}
            />
          </div>
        </article>

        <footer className="mt-16 pt-8 border-t border-border">
          <div className="flex justify-between items-center">
            <Link
              href="/blog"
              className="text-accent-gold hover:text-accent-gold-hover transition-colors"
            >
              ← More posts
            </Link>
            <Link
              href="/"
              className="text-text-secondary hover:text-foreground transition-colors"
            >
              Home
            </Link>
          </div>
        </footer>
      </div>
    </Section>
  )
}
