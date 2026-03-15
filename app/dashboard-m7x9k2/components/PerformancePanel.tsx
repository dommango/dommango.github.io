'use client'

import { clsx } from 'clsx'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { PerformanceData } from '@/lib/types/dashboard'

interface PerformancePanelProps {
  data: PerformanceData | null
  isLoading?: boolean
  className?: string
}

function formatMs(ms: number): string {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(1)}s`
  }
  return `${Math.round(ms)}ms`
}

function getCwvStatus(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, [number, number]> = {
    lcp: [2500, 4000],
    fid: [100, 300],
    cls: [0.1, 0.25],
    fcp: [1800, 3000],
    ttfb: [800, 1800],
  }

  const [good, poor] = thresholds[metric] || [0, 0]
  if (value <= good) return 'good'
  if (value <= poor) return 'needs-improvement'
  return 'poor'
}

const cwvStatusColors = {
  'good': 'text-green-500',
  'needs-improvement': 'text-amber-500',
  'poor': 'text-red-500',
}

export function PerformancePanel({ data, isLoading, className }: PerformancePanelProps) {
  if (isLoading) {
    return (
      <Card hover={false} className={className}>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardBody>
      </Card>
    )
  }

  if (!data || data.pages.length === 0) {
    return (
      <Card hover={false} className={className}>
        <CardHeader>
          <h2 className="text-lg font-semibold text-foreground">Performance Metrics</h2>
        </CardHeader>
        <CardBody>
          <p className="text-text-secondary">No performance data available yet.</p>
          <p className="text-sm text-text-secondary mt-2">
            Data will appear after the first scheduled run.
          </p>
        </CardBody>
      </Card>
    )
  }

  const primaryPage = data.pages[0]

  return (
    <Card hover={false} className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Performance Metrics</h2>
          <span className="text-sm text-text-secondary">{primaryPage.path}</span>
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-6">
          {/* Lighthouse Scores */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Lighthouse Scores</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(primaryPage.scores).map(([key, value]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-text-secondary capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className={clsx('text-sm font-medium', {
                      'text-green-500': value >= 90,
                      'text-amber-500': value >= 50 && value < 90,
                      'text-red-500': value < 50,
                    })}>
                      {value}
                    </span>
                  </div>
                  <ProgressBar value={value} size="sm" />
                </div>
              ))}
            </div>
          </div>

          {/* Core Web Vitals */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Core Web Vitals</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: 'lcp', label: 'LCP', value: primaryPage.coreWebVitals.lcp, format: formatMs },
                { key: 'fid', label: 'FID', value: primaryPage.coreWebVitals.fid, format: formatMs },
                { key: 'cls', label: 'CLS', value: primaryPage.coreWebVitals.cls, format: (v: number) => v.toFixed(3) },
                { key: 'fcp', label: 'FCP', value: primaryPage.coreWebVitals.fcp, format: formatMs },
                { key: 'ttfb', label: 'TTFB', value: primaryPage.coreWebVitals.ttfb, format: formatMs },
              ].map(({ key, label, value, format }) => {
                const status = getCwvStatus(key, value)
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-2"
                  >
                    <span className="text-sm text-text-secondary">{label}</span>
                    <span className={clsx('text-sm font-medium', cwvStatusColors[status])}>
                      {format(value)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Other Pages Summary */}
          {data.pages.length > 1 && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Other Pages</h3>
              <div className="space-y-2">
                {data.pages.slice(1).map((page) => (
                  <div key={page.path} className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">{page.path}</span>
                    <span className={clsx('text-sm font-medium', {
                      'text-green-500': page.scores.performance >= 90,
                      'text-amber-500': page.scores.performance >= 50,
                      'text-red-500': page.scores.performance < 50,
                    })}>
                      {page.scores.performance}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  )
}
