import { RotateCcw } from 'lucide-react'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'

/**
 * filters: { branch, year, semester, subject, type }
 * options: { branches: [{id,name}], years, semesters, subjects, types }
 * onChange(key, value) — year/semester/subject option lists should already
 * be narrowed by the parent based on the currently selected branch/year/semester.
 */
export default function FilterBar({ filters, options, onChange, onReset }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <Select
        aria-label="Filter by branch"
        value={filters.branch}
        onChange={(e) => onChange('branch', e.target.value)}
      >
        <option value="">All branches</option>
        {options.branches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Filter by year"
        value={filters.year}
        onChange={(e) => onChange('year', e.target.value)}
        disabled={!options.years.length}
      >
        <option value="">All years</option>
        {options.years.map((y) => (
          <option key={y.id} value={y.id}>
            {y.name}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Filter by semester"
        value={filters.semester}
        onChange={(e) => onChange('semester', e.target.value)}
        disabled={!options.semesters.length}
      >
        <option value="">All semesters</option>
        {options.semesters.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Filter by subject"
        value={filters.subject}
        onChange={(e) => onChange('subject', e.target.value)}
        disabled={!options.subjects.length}
      >
        <option value="">All subjects</option>
        {options.subjects.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </Select>

      <div className="flex gap-2">
        <Select
          aria-label="Filter by resource type"
          value={filters.type}
          onChange={(e) => onChange('type', e.target.value)}
          className="flex-1"
        >
          <option value="">All types</option>
          {options.types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Select>
        <Button variant="ghost" size="md" onClick={onReset} aria-label="Reset filters">
          <RotateCcw size={15} />
        </Button>
      </div>
    </div>
  )
}
