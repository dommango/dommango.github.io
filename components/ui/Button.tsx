import { clsx } from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-md font-medium',
        'focus:outline-none focus:ring-2 focus:ring-accent-gold/50 focus:ring-offset-2 focus:ring-offset-background',
        'active:scale-[0.98]',
        // Size variants
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-5 py-2.5',
        size === 'lg' && 'px-7 py-3 text-lg',
        // Style variants
        variant === 'primary' &&
          'bg-accent-gold text-background hover:bg-accent-gold-hover shadow-md hover:shadow-lg',
        variant === 'secondary' &&
          'bg-surface-2 text-foreground hover:bg-surface-3 border border-border',
        variant === 'outline' &&
          'border-2 border-accent-gold text-accent-gold hover:bg-accent-gold-subtle',
        variant === 'ghost' &&
          'text-text-secondary hover:text-foreground hover:bg-surface-2',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
