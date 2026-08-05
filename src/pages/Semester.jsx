import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BookMarked } from 'lucide-react'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import NavCard from '@/components/resources/NavCard'
import EmptyState from '@/components/ui/EmptyState'
import { CardGridSkeleton } from '@/components/skeletons/ResourceSkeletons'
import { getBranchBySlug } from '@/lib/api/branches'
import { getYearBySlug } from '@/lib/api/years'
import { getSemesterBySlug } from '@/lib/api/semesters'
import { getSubjectsBySemesterId } from '@/lib/api/subjects'

export default function Semester() {
  const { branchId, yearId, semesterId } = useParams()
  const [year, setYear] = useState(null)
  const [semester, setSemester] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    getBranchBySlug(branchId)
      .then(async (branch) => {
        const y = await getYearBySlug(branch.id, yearId)
        setYear(y)
        const s = await getSemesterBySlug(y.id, semesterId)
        setSemester(s)
        setSubjects(await getSubjectsBySemesterId(s.id))
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [branchId, yearId, semesterId])

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <CardGridSkeleton count={3} />
      </div>
    )
  }

  if (notFound || !year || !semester) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState title="Semester not found" description="This semester may have been removed or renamed." />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: year.branch.name, to: `/branches/${year.branch.slug}` },
          { label: year.name, to: `/branches/${year.branch.slug}/years/${year.slug}` },
          { label: semester.name },
        ]}
      />

      <h1 className="mt-4 font-display text-2xl font-semibold">{semester.name}</h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">Choose a subject to see its resources.</p>

      <div className="mt-8">
        {subjects.length === 0 ? (
          <EmptyState title="No subjects yet" description="An admin hasn't added subjects for this semester." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((s) => (
              <NavCard
                key={s.id}
                to={`/branches/${year.branch.slug}/years/${year.slug}/semesters/${semester.slug}/subjects/${s.slug}`}
                icon={BookMarked}
                title={s.name}
                subtitle={s.code}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
