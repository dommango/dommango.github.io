import { clsx } from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
}

export function Button({
  children,
  variant = 'primary',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-md px-4 py-2 font-medium transition-colors',
        variant === 'primary' &&
          'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
        variant === 'secondary' &&
          'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
