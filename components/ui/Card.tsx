import { clsx } from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className, hover = true }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-xl border border-border bg-surface-1 p-6',
        hover && 'hover:border-accent-gold-muted/30 hover:shadow-lg hover:shadow-accent-gold-subtle',
        className
      )}
    >
      {children}
    </div>
  )
}

interface CardSectionProps {
  children: React.ReactNode
  className?: string
}

export function CardHeader({ children, className }: CardSectionProps) {
  return (
    <div
      className={clsx(
        'mb-4 border-b border-border-subtle pb-3',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardBody({ children, className }: CardSectionProps) {
  return (
    <div
      className={clsx(
        'text-text-secondary',
        className
      )}
    >
      {children}
    </div>
  )
}
