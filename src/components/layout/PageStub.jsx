export default function PageStub({ index, title, description, milestone }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-8">
        <div className="flex items-center gap-3 font-mono-tabular text-xs text-[var(--color-text-muted)]">
          <span className="rounded border border-[var(--color-line)] px-1.5 py-0.5">{index}</span>
          <span>PAGE INDEX</span>
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-[var(--color-text-muted)]">{description}</p>
        <div className="mt-6 rounded-[var(--radius-control)] bg-[var(--color-accent-soft)] px-4 py-3 text-sm text-[var(--color-accent)]">
          Coming in milestone: <span className="font-medium">{milestone}</span>
        </div>
      </div>
    </div>
  )
}
