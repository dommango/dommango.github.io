'use client'

import { clsx } from 'clsx'
import { ArrowUp, ArrowDown, Minus } from '@phosphor-icons/react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  change?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
    isPositive?: boolean
  }
  className?: string
}

export function MetricCard({
  title,
  value,
  subtitle,
  change,
  className,
}: MetricCardProps) {
  const getChangeColor = () => {
    if (!change) return ''
    if (change.direction === 'neutral') return 'text-text-secondary'
    if (change.isPositive === undefined) {
      return change.direction === 'up' ? 'text-green-500' : 'text-red-500'
    }
    return change.isPositive ? 'text-green-500' : 'text-red-500'
  }

  const ChangeIcon = change?.direction === 'up'
    ? ArrowUp
    : change?.direction === 'down'
      ? ArrowDown
      : Minus

  return (
    <div
      className={clsx(
        'rounded-xl border border-border bg-surface-1 p-5',
        className
      )}
    >
      <p className="text-sm text-text-secondary mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-semibold text-foreground">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {subtitle && (
          <span className="text-sm text-text-secondary">{subtitle}</span>
        )}
      </div>
      {change && (
        <div className={clsx('flex items-center gap-1 mt-2 text-sm', getChangeColor())}>
          <ChangeIcon size={14} weight="bold" />
          <span>{change.value > 0 ? '+' : ''}{change.value}%</span>
        </div>
      )}
    </div>
  )
}
