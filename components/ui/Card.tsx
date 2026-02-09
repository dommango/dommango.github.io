import { clsx } from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md',
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
        'mb-4 border-b border-gray-100 pb-3',
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
        'text-gray-700',
        className
      )}
    >
      {children}
    </div>
  )
}
