import { NavLink } from 'react-router-dom'
import { ArrowUpRight, GraduationCap } from 'lucide-react'
import Card from '@/components/ui/Card'

/** year: { id, name, slug, semesterCount } */
export default function YearCard({ year }) {
  return (
    <Card
      as={NavLink}
      to={`/years/${year.slug || year.id}`}
      hover
      className="group flex flex-col gap-4 p-5"
    >
      <div className="flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
          <GraduationCap size={19} strokeWidth={1.75} />
        </span>
        <ArrowUpRight
          size={16}
          className="text-[var(--color-text-muted)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--color-accent)]"
        />
      </div>
      <div>
        <h3 className="font-display text-base font-semibold text-[var(--color-text)]">
          {year.name}
        </h3>
        {typeof year.semesterCount === 'number' && (
          <p className="mt-1 font-mono-tabular text-xs text-[var(--color-text-muted)]">
            {year.semesterCount} {year.semesterCount === 1 ? 'semester' : 'semesters'}
          </p>
        )}
      </div>
    </Card>
  )
}
