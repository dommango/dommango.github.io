import { clsx } from 'clsx'

interface SkeletonProps {
  className?: string
  count?: number
}

/**
 * Generic skeleton loader for content placeholders
 */
export function Skeleton({ className, count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse rounded',
            className
          )}
        />
      ))}
    </>
  )
}

/**
 * Skeleton for card layouts
 */
export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <Skeleton className="h-4 w-3/4 mb-4" />
      <Skeleton className="h-3 w-full mb-3" count={2} />
      <Skeleton className="h-3 w-2/3" />
    </div>
  )
}

/**
 * Skeleton for profile/avatar display
 */
export function AvatarSkeleton() {
  return <Skeleton className="h-16 w-16 rounded-full" />
}

/**
 * Skeleton for list items
 */
export function ListItemSkeleton() {
  return (
    <div className="py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-4">
        <AvatarSkeleton />
        <div className="flex-1">
          <Skeleton className="h-4 w-2/3 mb-2" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton for skill/tag grids
 */
export function SkillGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-20">
          <Skeleton className="h-full" />
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton for career section
 */
export function CareerSectionSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton for timeline
 */
export function TimelineSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-8">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-4 w-4 rounded-full flex-shrink-0 mt-1" />
          <div className="flex-1">
            <Skeleton className="h-4 w-2/3 mb-2" />
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
