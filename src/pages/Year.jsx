import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FileText, Layers } from 'lucide-react'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import NavCard from '@/components/resources/NavCard'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import { CardGridSkeleton } from '@/components/skeletons/ResourceSkeletons'
import { getBranchBySlug } from '@/lib/api/branches'
import { getYearBySlug } from '@/lib/api/years'
import { getSemestersByYearId } from '@/lib/api/semesters'

export default function Year() {
  const { branchId, yearId } = useParams()
  const [year, setYear] = useState(null)
  const [semesters, setSemesters] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    getBranchBySlug(branchId)
      .then(async (branch) => {
        const y = await getYearBySlug(branch.id, yearId)
        setYear(y)
        setSemesters(await getSemestersByYearId(y.id))
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [branchId, yearId])

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <CardGridSkeleton count={2} />
      </div>
    )
  }

  if (notFound || !year) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState title="Year not found" description="This year may have been removed or renamed." />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: year.branch.name, to: `/branches/${year.branch.slug}` },
          { label: year.name },
        ]}
      />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold">{year.name}</h1>
        {year.syllabus_url && (
          <Button as="a" href={year.syllabus_url} target="_blank" rel="noopener noreferrer" variant="secondary" size="sm">
            <FileText size={15} /> View Complete Syllabus PDF
          </Button>
        )}
      </div>

      <div className="mt-8">
        <h2 className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-muted)]">
          <Layers size={14} /> Semesters
        </h2>
        <div className="mt-3">
          {semesters.length === 0 ? (
            <EmptyState title="No semesters yet" description="An admin hasn't added semesters for this year." />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {semesters.map((s) => (
                <NavCard
                  key={s.id}
                  to={`/branches/${year.branch.slug}/years/${year.slug}/semesters/${s.slug}`}
                  icon={Layers}
                  title={s.name}
                  subtitle={`${s.subjectCount} ${s.subjectCount === 1 ? 'subject' : 'subjects'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
