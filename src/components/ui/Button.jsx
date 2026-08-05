import { forwardRef } from 'react'
import clsx from 'clsx'

const variants = {
  primary:
    'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-strong)] shadow-sm',
  secondary:
    'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-line)] hover:bg-[var(--color-surface-muted)]',
  ghost:
    'bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]',
  danger:
    'bg-[var(--color-rose)] text-white hover:opacity-90',
}

const sizes = {
  sm: 'text-sm px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2 gap-2',
  lg: 'text-base px-5 py-2.5 gap-2',
}

const Button = forwardRef(function Button(
  { as: Component = 'button', variant = 'primary', size = 'md', className, children, ...props },
  ref
) {
  return (
    <Component
      ref={ref}
      className={clsx(
        'inline-flex items-center justify-center rounded-[var(--radius-control)] font-medium transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
})

export default Button
