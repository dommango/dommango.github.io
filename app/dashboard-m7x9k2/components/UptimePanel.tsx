'use client'

import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { StatusIndicator } from './StatusIndicator'
import type { UptimeData } from '@/lib/types/dashboard'
import { formatDistanceToNow } from 'date-fns'

interface UptimePanelProps {
  data: UptimeData | null
  isLoading?: boolean
  className?: string
}

export function UptimePanel({ data, isLoading, className }: UptimePanelProps) {
  if (isLoading) {
    return (
      <Card hover={false} className={className}>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardBody>
      </Card>
    )
  }

  if (!data || data.monitors.length === 0) {
    return (
      <Card hover={false} className={className}>
        <CardHeader>
          <h2 className="text-lg font-semibold text-foreground">Uptime Status</h2>
        </CardHeader>
        <CardBody>
          <p className="text-text-secondary">No uptime data available yet.</p>
          <p className="text-sm text-text-secondary mt-2">
            Configure UptimeRobot to start monitoring.
          </p>
        </CardBody>
      </Card>
    )
  }

  const primaryMonitor = data.monitors[0]
  const hasRecentIncidents = data.incidents.length > 0

  return (
    <Card hover={false} className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Uptime Status</h2>
          <StatusIndicator status={primaryMonitor.status} />
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-6">
          {/* Main Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-surface-2">
              <p className="text-sm text-text-secondary mb-1">Uptime (30d)</p>
              <p className="text-2xl font-semibold text-foreground">
                {primaryMonitor.uptimePercentage.toFixed(2)}%
              </p>
            </div>
            <div className="p-4 rounded-lg bg-surface-2">
              <p className="text-sm text-text-secondary mb-1">Avg Response</p>
              <p className="text-2xl font-semibold text-foreground">
                {primaryMonitor.avgResponseTime}ms
              </p>
            </div>
          </div>

          {/* Last Check */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Last checked</span>
            <span className="text-foreground">
              {formatDistanceToNow(new Date(primaryMonitor.lastCheckTime), { addSuffix: true })}
            </span>
          </div>

          {/* Recent Incidents */}
          {hasRecentIncidents && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Recent Incidents</h3>
              <div className="space-y-2">
                {data.incidents.slice(0, 3).map((incident, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-red-500/10"
                  >
                    <div>
                      <p className="text-sm text-foreground capitalize">{incident.type}</p>
                      <p className="text-xs text-text-secondary">
                        {new Date(incident.startTime).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-sm text-red-500">
                      {incident.duration}m
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!hasRecentIncidents && (
            <div className="p-3 rounded-lg bg-green-500/10 text-center">
              <p className="text-sm text-green-600">No incidents in the last 30 days</p>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  )
}
