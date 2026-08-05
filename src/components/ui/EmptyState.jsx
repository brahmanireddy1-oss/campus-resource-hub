import { Inbox } from 'lucide-react'

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description,
  action,
}) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-[var(--color-line)] px-6 py-14 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]">
        <Icon size={20} strokeWidth={1.75} />
      </span>
      <h3 className="mt-4 font-display text-base font-semibold text-[var(--color-text)]">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-[var(--color-text-muted)]">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
