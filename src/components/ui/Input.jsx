import { forwardRef } from 'react'
import clsx from 'clsx'

const Input = forwardRef(function Input({ label, id, error, className, ...props }, ref) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[var(--color-text)]">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={clsx(
          'rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] transition-colors',
          'focus:border-[var(--color-accent)]',
          error && 'border-[var(--color-rose)]',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-[var(--color-rose)]">{error}</span>}
    </div>
  )
})

export default Input
