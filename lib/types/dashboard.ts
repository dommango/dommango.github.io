export interface AnalyticsData {
  lastUpdated: string
  period: {
    start: string
    end: string
  }
  summary: {
    pageViews: number
    uniqueVisitors: number
    bounceRate: number
  }
  topPages: Array<{
    path: string
    views: number
    visitors: number
  }>
  trafficSources: Array<{
    source: string
    visitors: number
    percentage: number
  }>
  dailyStats: Array<{
    date: string
    pageViews: number
    visitors: number
  }>
}

export interface PerformanceData {
  lastUpdated: string
  pages: Array<{
    url: string
    path: string
    scores: {
      performance: number
      accessibility: number
      bestPractices: number
      seo: number
    }
    coreWebVitals: {
      lcp: number
      fid: number
      cls: number
      fcp: number
      ttfb: number
    }
  }>
  history: Array<{
    date: string
    avgPerformanceScore: number
  }>
}

export interface UptimeData {
  lastUpdated: string
  monitors: Array<{
    name: string
    url: string
    status: 'up' | 'down' | 'paused'
    uptimePercentage: number
    avgResponseTime: number
    lastCheckTime: string
  }>
  incidents: Array<{
    startTime: string
    endTime?: string
    duration: number
    type: 'down' | 'degraded'
  }>
}

export interface DashboardData {
  analytics: AnalyticsData | null
  performance: PerformanceData | null
  uptime: UptimeData | null
}
