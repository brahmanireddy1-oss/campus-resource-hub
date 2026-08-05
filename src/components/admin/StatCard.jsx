import Card from '@/components/ui/Card'

const tones = {
  neutral: 'text-[var(--color-text)]',
  amber: 'text-[var(--color-amber)]',
  emerald: 'text-[var(--color-emerald)]',
  rose: 'text-[var(--color-rose)]',
  accent: 'text-[var(--color-accent)]',
}

/** icon: lucide component. tone controls the value color. */
export default function StatCard({ icon: Icon, label, value, tone = 'neutral' }) {
  return (
    <Card className="flex items-center gap-4 p-5">
      {Icon && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]">
          <Icon size={18} strokeWidth={1.75} />
        </span>
      )}
      <div>
        <p className={`font-mono-tabular text-2xl font-semibold ${tones[tone]}`}>{value}</p>
        <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
      </div>
    </Card>
  )
}
