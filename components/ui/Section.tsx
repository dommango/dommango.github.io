import { clsx } from 'clsx'

interface SectionProps {
  children: React.ReactNode
  className?: string
  id?: string
  variant?: 'default' | 'elevated' | 'highlight'
}

export function Section({ children, className, id, variant = 'default' }: SectionProps) {
  return (
    <section
      id={id}
      className={clsx(
        'py-20 md:py-28 lg:py-32',
        variant === 'default' && 'bg-background',
        variant === 'elevated' && 'bg-surface-1',
        variant === 'highlight' && 'bg-surface-2',
        className
      )}
    >
      {children}
    </section>
  )
}

interface SectionHeaderProps {
  children: React.ReactNode
  subtitle?: string
}

export function SectionHeader({ children, subtitle }: SectionHeaderProps) {
  return (
    <div className="mb-16">
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
        {children}
      </h2>
      {subtitle && (
        <p className="text-lg md:text-xl text-text-secondary max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  )
}
