import { getProfile } from '@/lib/content/profile'
import { ProfileHero } from '@/components/profile/ProfileHero'
import { ProfileSummary } from '@/components/profile/ProfileSummary'
import { CareerThemes } from '@/components/profile/CareerThemes'

export default async function Home() {
  const profile = getProfile()

  return (
    <>
      <ProfileHero
        name={profile.name}
        headline={profile.headline}
        location={profile.location}
        travel={profile.travel}
      />
      <ProfileSummary summary={profile.summary} />
      <CareerThemes themes={profile.careerThemes} />
    </>
  )
}
