function shimmer(className) {
  return <div className={`animate-pulse rounded bg-[var(--color-surface-muted)] ${className}`} />
}

export function ResourceCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
      <div className="flex items-start justify-between">
        {shimmer('h-9 w-9')}
        {shimmer('h-5 w-16 rounded-full')}
      </div>
      {shimmer('h-4 w-3/4')}
      {shimmer('h-3 w-full')}
      {shimmer('h-3 w-2/3')}
      {shimmer('h-8 w-full mt-1')}
    </div>
  )
}

export function CardGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ResourceCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
      {shimmer('h-10 w-10')}
      <div className="flex-1">
        {shimmer('h-6 w-14')}
        <div className="mt-2">{shimmer('h-3 w-20')}</div>
      </div>
    </div>
  )
}
