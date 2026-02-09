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
    <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            {name}
          </h1>
          <p className="text-xl md:text-2xl text-blue-700 font-semibold mb-4">
            {headline}
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-gray-600">
            {location && (
              <span className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                </svg>
                {location}
              </span>
            )}
            {travel && (
              <span className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
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
