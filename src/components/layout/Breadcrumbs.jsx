import { NavLink } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

/**
 * items: [{ label: 'Year 1', to: '/years/1st-year' }, ...]
 * The last item renders as plain (current) text, not a link.
 */
export default function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-mono-tabular text-xs">
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={item.to || item.label} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={12} className="text-[var(--color-text-muted)]" />}
            <span className="rounded border border-[var(--color-line)] px-1 py-0.5 text-[var(--color-text-muted)]">
              {String(i + 1).padStart(2, '0')}
            </span>
            {isLast || !item.to ? (
              <span className="font-medium text-[var(--color-text)]">{item.label}</span>
            ) : (
              <NavLink to={item.to} className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">
                {item.label}
              </NavLink>
            )}
          </span>
        )
      })}
    </nav>
  )
}
