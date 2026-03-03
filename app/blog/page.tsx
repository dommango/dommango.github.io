import { getBlogPosts } from '@/lib/content/blog'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'

export const metadata = {
  title: 'Blog | Dom Mangonon',
  description: 'Thoughts on AI, technology, and enterprise transformation',
}

export default function BlogPage() {
  const posts = getBlogPosts()

  return (
    <Section>
      <div className="container mx-auto px-6 lg:px-8">
        <SectionHeader subtitle="Thoughts on AI, technology, and enterprise transformation">
          Blog
        </SectionHeader>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary text-lg">
              Posts coming soon. In the meantime, explore how this website was built with Claude Code.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <Card hover className="h-full">
                  <CardHeader>
                    <h2 className="text-xl font-semibold text-foreground group-hover:text-accent-gold transition-colors">
                      {post.title}
                    </h2>
                  </CardHeader>
                  <CardBody>
                    <p className="text-text-secondary line-clamp-3">
                      {post.description}
                    </p>
                  </CardBody>
                  <CardFooter>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <span className="text-text-muted text-sm">
                      {new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-16 p-8 rounded-xl bg-surface-2 border border-border">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            About This Blog
          </h2>
          <p className="text-text-secondary mb-4">
            This space is for exploring the intersection of AI and enterprise transformation—observations,
            experiments, and lessons learned from both professional work and personal projects.
          </p>
          <p className="text-text-secondary">
            <span className="text-accent-gold font-medium">Meta note:</span> This entire website was built
            via &quot;vibecoding&quot; with Claude Code—an experiment in AI-assisted development that itself
            became a showcase of the technology.
          </p>
        </div>
      </div>
    </Section>
  )
}
