import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import NavCard from '@/components/resources/NavCard'
import EmptyState from '@/components/ui/EmptyState'
import { CardGridSkeleton } from '@/components/skeletons/ResourceSkeletons'
import { getBranchBySlug } from '@/lib/api/branches'
import { getYears } from '@/lib/api/years'

export default function Branch() {
  const { branchId } = useParams()
  const [branch, setBranch] = useState(null)
  const [years, setYears] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    getBranchBySlug(branchId)
      .then(async (b) => {
        setBranch(b)
        setYears(await getYears({ branchId: b.id }))
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [branchId])

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <CardGridSkeleton count={2} />
      </div>
    )
  }

  if (notFound || !branch) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState title="Branch not found" description="This branch may have been removed or renamed." />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: branch.name }]} />

      <h1 className="mt-4 font-display text-2xl font-semibold">{branch.name}</h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">Choose a year to continue.</p>

      <div className="mt-8">
        {years.length === 0 ? (
          <EmptyState title="No years yet" description="An admin hasn't added years for this branch." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {years.map((y) => (
              <NavCard
                key={y.id}
                to={`/branches/${branch.slug}/years/${y.slug}`}
                icon={GraduationCap}
                title={y.name}
                subtitle={`${y.semesterCount} ${y.semesterCount === 1 ? 'semester' : 'semesters'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
