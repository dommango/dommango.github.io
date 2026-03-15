'use client'

import { clsx } from 'clsx'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import type { AnalyticsData } from '@/lib/types/dashboard'

interface AnalyticsPanelProps {
  data: AnalyticsData | null
  isLoading?: boolean
  className?: string
}

export function AnalyticsPanel({ data, isLoading, className }: AnalyticsPanelProps) {
  if (isLoading) {
    return (
      <Card hover={false} className={className}>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardBody>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card hover={false} className={className}>
        <CardHeader>
          <h2 className="text-lg font-semibold text-foreground">Visitor Analytics</h2>
        </CardHeader>
        <CardBody>
          <p className="text-text-secondary">No analytics data available yet.</p>
          <p className="text-sm text-text-secondary mt-2">
            Data will appear after GoatCounter is configured and visitors arrive.
          </p>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card hover={false} className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Visitor Analytics</h2>
          <span className="text-sm text-text-secondary">
            {data.period.start} - {data.period.end}
          </span>
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-6">
          {/* Top Pages */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Top Pages</h3>
            <div className="space-y-2">
              {data.topPages.slice(0, 5).map((page) => (
                <div key={page.path} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary truncate flex-1 mr-4">
                    {page.path}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {page.views.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic Sources */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Traffic Sources</h3>
            <div className="space-y-2">
              {data.trafficSources.slice(0, 5).map((source) => (
                <div key={source.source} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-text-secondary">
                        {source.source || 'Direct'}
                      </span>
                      <span className="text-sm text-foreground">
                        {source.percentage}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-gold rounded-full"
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
