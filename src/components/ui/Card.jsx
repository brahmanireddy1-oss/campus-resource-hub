import clsx from 'clsx'

export default function Card({ as: Component = 'div', hover = false, className, children, ...props }) {
  return (
    <Component
      className={clsx(
        'rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)]',
        hover && 'transition-all duration-150 hover:border-[var(--color-accent)]/40 hover:shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}
