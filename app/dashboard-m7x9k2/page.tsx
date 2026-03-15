'use client'

import { useState, useEffect } from 'react'
import { MetricCard, AnalyticsPanel, PerformancePanel, UptimePanel } from './components'
import type { AnalyticsData, PerformanceData, UptimeData } from '@/lib/types/dashboard'
import { formatDistanceToNow } from 'date-fns'

async function fetchData<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(path)
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [performance, setPerformance] = useState<PerformanceData | null>(null)
  const [uptime, setUptime] = useState<UptimeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [analyticsData, performanceData, uptimeData] = await Promise.all([
        fetchData<AnalyticsData>('/data/analytics.json'),
        fetchData<PerformanceData>('/data/performance.json'),
        fetchData<UptimeData>('/data/uptime.json'),
      ])

      setAnalytics(analyticsData)
      setPerformance(performanceData)
      setUptime(uptimeData)
      setIsLoading(false)
    }

    loadData()
  }, [])

  const lastUpdated = analytics?.lastUpdated || performance?.lastUpdated || uptime?.lastUpdated

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Site Dashboard</h1>
        {lastUpdated && (
          <p className="text-sm text-text-secondary mt-1">
            Last updated {formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })}
          </p>
        )}
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Page Views"
          value={analytics?.summary.pageViews ?? '—'}
          change={analytics ? {
            value: 0,
            direction: 'neutral',
          } : undefined}
        />
        <MetricCard
          title="Unique Visitors"
          value={analytics?.summary.uniqueVisitors ?? '—'}
        />
        <MetricCard
          title="Uptime"
          value={uptime?.monitors[0]?.uptimePercentage
            ? `${uptime.monitors[0].uptimePercentage.toFixed(1)}%`
            : '—'
          }
        />
        <MetricCard
          title="Performance"
          value={performance?.pages[0]?.scores.performance ?? '—'}
          subtitle="Lighthouse"
        />
      </div>

      {/* Detailed Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <AnalyticsPanel
          data={analytics}
          isLoading={isLoading}
          className="lg:col-span-2"
        />
        <UptimePanel
          data={uptime}
          isLoading={isLoading}
        />
        <PerformancePanel
          data={performance}
          isLoading={isLoading}
          className="lg:col-span-2"
        />
      </div>

      {/* Setup Instructions (shown when no data) */}
      {!isLoading && !analytics && !performance && !uptime && (
        <div className="mt-8 p-6 rounded-xl border border-border bg-surface-1">
          <h2 className="text-lg font-semibold text-foreground mb-4">Setup Required</h2>
          <ol className="space-y-3 text-text-secondary">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-gold text-background flex items-center justify-center text-sm font-medium">1</span>
              <span>Sign up at <a href="https://goatcounter.com" className="text-accent-gold hover:underline" target="_blank" rel="noopener">goatcounter.com</a> and add tracking script</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-gold text-background flex items-center justify-center text-sm font-medium">2</span>
              <span>Create an <a href="https://uptimerobot.com" className="text-accent-gold hover:underline" target="_blank" rel="noopener">UptimeRobot</a> monitor for your site</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-gold text-background flex items-center justify-center text-sm font-medium">3</span>
              <span>Add API keys to GitHub Secrets and run the data fetch workflow</span>
            </li>
          </ol>
        </div>
      )}
    </div>
  )
}
