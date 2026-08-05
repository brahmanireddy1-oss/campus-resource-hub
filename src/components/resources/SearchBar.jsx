import { Search, X } from 'lucide-react'

export default function SearchBar({ value, onChange, placeholder = 'Search resources…', className }) {
  return (
    <div className={`relative ${className || ''}`}>
      <Search
        size={16}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[var(--color-surface)] py-2.5 pl-10 pr-9 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] transition-colors focus:border-[var(--color-accent)]"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          <X size={15} />
        </button>
      )}
    </div>
  )
}
