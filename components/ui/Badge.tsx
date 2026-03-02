import { clsx } from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'accent'
}

export function Badge({ children, variant = 'primary' }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
        variant === 'primary' &&
          'bg-accent-gold-subtle text-accent-gold ring-accent-gold/20',
        variant === 'secondary' &&
          'bg-surface-2 text-text-secondary ring-border',
        variant === 'accent' &&
          'bg-accent-blue/10 text-accent-blue ring-accent-blue/20'
      )}
    >
      {children}
    </span>
  )
}
