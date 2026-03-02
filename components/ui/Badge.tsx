import { clsx } from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'accent' | 'outline'
  size?: 'sm' | 'md'
}

export function Badge({ children, variant = 'primary', size = 'md' }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-md font-medium ring-1 ring-inset',
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-2.5 py-1 text-xs',
        variant === 'primary' &&
          'bg-accent-gold-subtle text-accent-gold ring-accent-gold/20',
        variant === 'secondary' &&
          'bg-surface-2 text-text-secondary ring-border',
        variant === 'accent' &&
          'bg-accent-blue/10 text-accent-blue ring-accent-blue/20',
        variant === 'outline' &&
          'bg-transparent text-text-secondary ring-border hover:ring-accent-gold-muted'
      )}
    >
      {children}
    </span>
  )
}
