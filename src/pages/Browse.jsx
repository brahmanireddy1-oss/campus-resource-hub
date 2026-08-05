import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import SearchBar from '@/components/resources/SearchBar'
import FilterBar from '@/components/resources/FilterBar'
import ResourceCard from '@/components/resources/ResourceCard'
import EmptyState from '@/components/ui/EmptyState'
import { CardGridSkeleton } from '@/components/skeletons/ResourceSkeletons'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { getBranches } from '@/lib/api/branches'
import { getYears } from '@/lib/api/years'
import { getSemestersByYearId } from '@/lib/api/semesters'
import { getSubjectsBySemesterId } from '@/lib/api/subjects'
import { getResourceTypes } from '@/lib/api/resourceTypes'
import { getApprovedResources } from '@/lib/api/resources'
import { getResourceDownloadUrl } from '@/lib/api/storage'

const emptyFilters = { branch: '', year: '', semester: '', subject: '', type: '' }

export default function Browse() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const debouncedQuery = useDebouncedValue(query, 350)

  const [filters, setFilters] = useState(emptyFilters)
  const [branches, setBranches] = useState([])
  const [years, setYears] = useState([])
  const [semesters, setSemesters] = useState([])
  const [subjects, setSubjects] = useState([])
  const [types, setTypes] = useState([])

  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getBranches(), getResourceTypes()])
      .then(([b, t]) => {
        setBranches(b)
        setTypes(t)
      })
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
    if (!filters.semester) {
      setSubjects([])
      return
    }
    getSubjectsBySemesterId(filters.semester).then(setSubjects).catch((err) => toast.error(err.message))
  }, [filters.semester])

  useEffect(() => {
    setLoading(true)
    getApprovedResources({
      search: debouncedQuery,
      branchId: filters.branch,
      yearId: filters.year,
      semesterId: filters.semester,
      subjectId: filters.subject,
      typeId: filters.type,
    })
      .then(setResources)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [debouncedQuery, filters])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'branch') {
        next.year = ''
        next.semester = ''
        next.subject = ''
      }
      if (key === 'year') {
        next.semester = ''
        next.subject = ''
      }
      if (key === 'semester') {
        next.subject = ''
      }
      return next
    })
  }

  const handleReset = () => {
    setFilters(emptyFilters)
    setQuery('')
  }

  const handleDownload = async (resource) => {
    try {
      const url = await getResourceDownloadUrl(resource.file_path)
      window.open(url, '_blank', 'noopener')
    } catch (err) {
      toast.error(err.message || 'Could not generate download link.')
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold">Browse Resources</h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Search and filter through every approved resource.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        <SearchBar value={query} onChange={setQuery} />
        <FilterBar
          filters={filters}
          options={{ branches, years, semesters, subjects, types }}
          onChange={handleFilterChange}
          onReset={handleReset}
        />
      </div>

      <div className="mt-8">
        {loading ? (
          <CardGridSkeleton />
        ) : resources.length === 0 ? (
          <EmptyState
            title="No resources found"
            description="Try a different search term or clear your filters."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((r) => (
              <ResourceCard
                key={r.id}
                resource={{
                  title: r.title,
                  description: r.description,
                  uploaderName: r.uploader?.full_name || r.uploader?.email,
                  createdAt: r.created_at,
                  resourceTypeName: r.resource_type?.name,
                  fileName: r.file_name,
                  fileSize: r.file_size,
                }}
                onDownload={() => handleDownload(r)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
