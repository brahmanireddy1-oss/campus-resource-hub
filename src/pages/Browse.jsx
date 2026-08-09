import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import SearchBar from '@/components/resources/SearchBar'
import FilterBar from '@/components/resources/FilterBar'
import SubjectDriveCard from '@/components/resources/SubjectDriveCard'
import EmptyState from '@/components/ui/EmptyState'
import { CardGridSkeleton } from '@/components/skeletons/ResourceSkeletons'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { getBranches } from '@/lib/api/branches'
import { getYears } from '@/lib/api/years'
import { getSemestersByYearId } from '@/lib/api/semesters'
import { searchSubjects } from '@/lib/api/subjects'

const emptyFilters = { branch: '', year: '', semester: '' }

export default function Browse() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const debouncedQuery = useDebouncedValue(query, 350)

  const [filters, setFilters] = useState(emptyFilters)
  const [branches, setBranches] = useState([])
  const [years, setYears] = useState([])
  const [semesters, setSemesters] = useState([])

  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBranches()
      .then(setBranches)
      .catch((err) => toast.error(err.message))
  }, [])

  useEffect(() => {
    if (!filters.branch) {
      setYears([])
      return
    }
    getYears({ branchId: filters.branch }).then(setYears).catch((err) => toast.error(err.message))
  }, [filters.branch])

  useEffect(() => {
    if (!filters.year) {
      setSemesters([])
      return
    }
    getSemestersByYearId(filters.year).then(setSemesters).catch((err) => toast.error(err.message))
  }, [filters.year])

  useEffect(() => {
    setLoading(true)
    searchSubjects({
      search: debouncedQuery,
      branchId: filters.branch,
      yearId: filters.year,
      semesterId: filters.semester,
    })
      .then(setSubjects)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [debouncedQuery, filters])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'branch') next.year = next.semester = ''
      if (key === 'year') next.semester = ''
      return next
    })
  }

  const handleReset = () => {
    setFilters(emptyFilters)
    setQuery('')
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold">Browse Resources</h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Find a subject, then open its Google Drive folder.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        <SearchBar value={query} onChange={setQuery} placeholder="Search for a subject…" />
        <FilterBar
          filters={filters}
          options={{ branches, years, semesters }}
          onChange={handleFilterChange}
          onReset={handleReset}
        />
      </div>

      <div className="mt-8">
        {loading ? (
          <CardGridSkeleton />
        ) : subjects.length === 0 ? (
          <EmptyState
            title="No subjects found"
            description="Try a different search term or clear your filters."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((s) => (
              <SubjectDriveCard key={s.id} subject={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
