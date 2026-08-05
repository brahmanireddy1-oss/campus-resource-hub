import clsx from 'clsx'
import { Clock, CircleCheck, CircleX } from 'lucide-react'

const tones = {
  pending: 'bg-[var(--color-amber-soft)] text-[var(--color-amber)]',
  approved: 'bg-[var(--color-emerald-soft)] text-[var(--color-emerald)]',
  rejected: 'bg-[var(--color-rose-soft)] text-[var(--color-rose)]',
  accent: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]',
  neutral: 'bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]',
}

const statusIcons = {
  pending: Clock,
  approved: CircleCheck,
  rejected: CircleX,
}

export default function Badge({ tone = 'neutral', children, withIcon = false, className }) {
  const Icon = withIcon ? statusIcons[tone] : null
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium capitalize',
        tones[tone] || tones.neutral,
        className
      )}
    >
      {Icon && <Icon size={12} strokeWidth={2.25} />}
      {children}
    </span>
  )
}
