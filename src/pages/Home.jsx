import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { BookOpen, Building2 } from 'lucide-react'
import SearchBar from '@/components/resources/SearchBar'
import NavCard from '@/components/resources/NavCard'
import EmptyState from '@/components/ui/EmptyState'
import { CardGridSkeleton } from '@/components/skeletons/ResourceSkeletons'
import { getBranches } from '@/lib/api/branches'

export default function Home() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBranches()
      .then(setBranches)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(query.trim() ? `/browse?q=${encodeURIComponent(query.trim())}` : '/browse')
  }

  return (
    <div>
      <section className="border-b border-[var(--color-line)]">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] px-3 py-1 font-mono-tabular text-xs text-[var(--color-text-muted)]">
            <BookOpen size={12} /> Branch → Year → Semester → Subject → Resources
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Everything your batch needs, in one place
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[var(--color-text-muted)]">
            Notes, previous papers, assignments, lab programs, books, and PPTs — organized by
            branch, year, semester, and subject, and reviewed before they go live.
          </p>
          <form onSubmit={handleSearch} className="mx-auto mt-8 max-w-md">
            <SearchBar value={query} onChange={setQuery} placeholder="Search for a resource…" />
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="font-display text-xl font-semibold">Browse by Branch</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Pick a branch to see its years and semesters.
        </p>

        <div className="mt-6">
          {loading ? (
            <CardGridSkeleton count={3} />
          ) : branches.length === 0 ? (
            <EmptyState
              title="No branches added yet"
              description="Once an admin adds academic branches, they'll show up here."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {branches.map((branch) => (
                <NavCard
                  key={branch.id}
                  to={`/branches/${branch.slug}`}
                  icon={Building2}
                  title={branch.name}
                  subtitle={`${branch.yearCount} ${branch.yearCount === 1 ? 'year' : 'years'}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
