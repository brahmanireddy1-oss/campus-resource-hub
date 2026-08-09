import { RotateCcw } from 'lucide-react'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'

/**
 * filters: { branch, year, semester }
 * options: { branches: [{id,name}], years, semesters }
 * onChange(key, value) — year/semester option lists should already be
 * narrowed by the parent based on the currently selected branch/year.
 */
export default function FilterBar({ filters, options, onChange, onReset }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
        className="col-span-2 sm:col-span-1"
      >
        <option value="">All semesters</option>
        {options.semesters.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </Select>

      <Button variant="ghost" size="md" onClick={onReset} aria-label="Reset filters">
        <RotateCcw size={15} /> Reset
      </Button>
    </div>
  )
}
