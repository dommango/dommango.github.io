import { clsx } from 'clsx'

interface ProgressBarProps {
  value: number
  max?: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function getVariant(value: number): 'success' | 'warning' | 'error' {
  if (value >= 90) return 'success'
  if (value >= 50) return 'warning'
  return 'error'
}

const variantColors = {
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
}

const sizeConfig = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
}

export function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  size = 'md',
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  const variant = getVariant(percentage)

  return (
    <div className={clsx('flex items-center gap-3', className)}>
      <div
        className={clsx(
          'flex-1 rounded-full bg-surface-2 overflow-hidden',
          sizeConfig[size]
        )}
      >
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-300',
            variantColors[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className={clsx('text-sm font-medium', {
          'text-green-500': variant === 'success',
          'text-amber-500': variant === 'warning',
          'text-red-500': variant === 'error',
        })}>
          {Math.round(percentage)}
        </span>
      )}
    </div>
  )
}
