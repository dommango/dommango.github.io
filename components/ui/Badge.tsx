import { clsx } from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
}

export function Badge({ children, variant = 'primary' }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset',
        variant === 'primary' && 'bg-blue-50 text-blue-700 ring-blue-700/10',
        variant === 'secondary' && 'bg-gray-50 text-gray-700 ring-gray-600/10'
      )}
    >
      {children}
    </span>
  )
}
