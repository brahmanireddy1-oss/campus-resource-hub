import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import ResourceCard from '@/components/resources/ResourceCard'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import { CardGridSkeleton } from '@/components/skeletons/ResourceSkeletons'
import toast from 'react-hot-toast'
import { getBranchBySlug } from '@/lib/api/branches'
import { getYearBySlug } from '@/lib/api/years'
import { getSemesterBySlug } from '@/lib/api/semesters'
import { getSubjectBySlug } from '@/lib/api/subjects'
import { getSubjectResources } from '@/lib/api/resources'
import { getResourceDownloadUrl } from '@/lib/api/storage'

export default function Subject() {
  const { branchId, yearId, semesterId, subjectId } = useParams()
  const navigate = useNavigate()

  const [year, setYear] = useState(null)
  const [semester, setSemester] = useState(null)
  const [subject, setSubject] = useState(null)
  const [resources, setResources] = useState([])
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
        const subj = await getSubjectBySlug(s.id, subjectId)
        setSubject(subj)
        setResources(await getSubjectResources(subj.id))
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [branchId, yearId, semesterId, subjectId])

  const grouped = useMemo(() => {
    const map = new Map()
    for (const r of resources) {
      const key = r.resource_type?.name || 'Other'
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(r)
    }
    return Array.from(map.entries())
  }, [resources])

  const handleDownload = async (resource) => {
    try {
      const url = await getResourceDownloadUrl(resource.file_path)
      window.open(url, '_blank', 'noopener')
    } catch (err) {
      toast.error(err.message || 'Could not generate download link.')
    }
  }

  const handleSubmitHere = () => {
    navigate(
      `/submit?branchId=${year.branch_id}&yearId=${year.id}&semesterId=${semester.id}&subjectId=${subject.id}`
    )
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <CardGridSkeleton />
      </div>
    )
  }

  if (notFound || !subject) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState title="Subject not found" description="This subject may have been removed or renamed." />
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
          {
            label: semester.name,
            to: `/branches/${year.branch.slug}/years/${year.slug}/semesters/${semester.slug}`,
          },
          { label: subject.name },
        ]}
      />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">{subject.name}</h1>
          {subject.code && (
            <p className="mt-1 font-mono-tabular text-xs text-[var(--color-text-muted)]">{subject.code}</p>
          )}
        </div>
        <Button size="sm" onClick={handleSubmitHere}>
          <Plus size={15} /> Submit Resource
        </Button>
      </div>

      <div className="mt-8 flex flex-col gap-10">
        {grouped.length === 0 ? (
          <EmptyState
            title="No resources yet"
            description="Be the first to submit a resource for this subject."
            action={
              <Button size="sm" onClick={handleSubmitHere}>
                <Plus size={15} /> Submit Resource
              </Button>
            }
          />
        ) : (
          grouped.map(([typeName, items]) => (
            <div key={typeName}>
              <h2 className="font-display text-base font-semibold text-[var(--color-text)]">{typeName}</h2>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((r) => (
                  <ResourceCard
                    key={r.id}
                    resource={{
                      title: r.title,
                      description: r.description,
                      uploaderName: r.uploader?.full_name || r.uploader?.email,
                      createdAt: r.created_at,
                      fileName: r.file_name,
                      fileSize: r.file_size,
                    }}
                    onDownload={() => handleDownload(r)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
