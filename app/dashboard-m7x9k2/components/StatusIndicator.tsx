import { clsx } from 'clsx'

interface StatusIndicatorProps {
  status: 'up' | 'down' | 'degraded' | 'paused' | 'unknown'
  showLabel?: boolean
  pulse?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const statusConfig = {
  up: { color: 'bg-green-500', label: 'Operational' },
  down: { color: 'bg-red-500', label: 'Down' },
  degraded: { color: 'bg-amber-500', label: 'Degraded' },
  paused: { color: 'bg-gray-400', label: 'Paused' },
  unknown: { color: 'bg-gray-400', label: 'Unknown' },
}

const sizeConfig = {
  sm: 'h-2 w-2',
  md: 'h-3 w-3',
  lg: 'h-4 w-4',
}

export function StatusIndicator({
  status,
  showLabel = false,
  pulse = true,
  size = 'md',
}: StatusIndicatorProps) {
  const config = statusConfig[status]

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex">
        {pulse && status === 'up' && (
          <span
            className={clsx(
              'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
              config.color
            )}
          />
        )}
        <span
          className={clsx(
            'relative inline-flex rounded-full',
            config.color,
            sizeConfig[size]
          )}
        />
      </span>
      {showLabel && (
        <span className="text-sm text-text-secondary">{config.label}</span>
      )}
    </div>
  )
}
