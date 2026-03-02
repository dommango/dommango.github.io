import Image from 'next/image'

interface ProfileHeroProps {
  name: string
  headline: string
  location: string
  travel?: string
}

export function ProfileHero({
  name,
  headline,
  location,
  travel,
}: ProfileHeroProps) {
  return (
    <section className="relative bg-gradient-to-br from-background via-surface-1 to-surface-2 py-24 md:py-32 lg:py-40 overflow-hidden">
      {/* Subtle decorative gold glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,168,71,0.08),transparent_50%)]" />

      <div className="container relative mx-auto px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Profile Image */}
          <div className="mb-8 flex justify-center">
            <Image
              src="/images/cartoon-headshot.jpg"
              alt={name}
              width={200}
              height={200}
              priority
              className="rounded-full border-4 border-accent-gold-muted shadow-lg"
            />
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight">
            {name}
          </h1>
          <p className="text-2xl md:text-3xl text-accent-gold font-semibold mb-8">
            {headline}
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-text-secondary">
            {location && (
              <span className="flex items-center gap-2">
                <svg className="h-5 w-5 text-accent-gold-muted" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                {location}
              </span>
            )}
            {travel && (
              <span className="flex items-center gap-2">
                <svg className="h-5 w-5 text-accent-gold-muted" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
                {travel}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
