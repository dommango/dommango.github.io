import { clsx } from 'clsx'

interface SectionProps {
  children: React.ReactNode
  className?: string
  id?: string
}

export function Section({ children, className, id }: SectionProps) {
  return (
    <section
      id={id}
      className={clsx('py-16 md:py-24', className)}
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
    <div className="mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        {children}
      </h2>
      {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
    </div>
  )
}
