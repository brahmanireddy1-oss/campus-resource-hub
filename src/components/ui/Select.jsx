import { forwardRef } from 'react'
import clsx from 'clsx'
import { ChevronDown } from 'lucide-react'

const Select = forwardRef(function Select(
  { label, id, error, className, children, ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[var(--color-text)]">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          ref={ref}
          className={clsx(
            'w-full appearance-none rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 pr-9 text-sm text-[var(--color-text)] transition-colors',
            'focus:border-[var(--color-accent)]',
            error && 'border-[var(--color-rose)]',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
        />
      </div>
      {error && <span className="text-xs text-[var(--color-rose)]">{error}</span>}
    </div>
  )
})

export default Select
