import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FolderOpen, FolderX } from 'lucide-react'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import { CardGridSkeleton } from '@/components/skeletons/ResourceSkeletons'
import { getBranchBySlug } from '@/lib/api/branches'
import { getYearBySlug } from '@/lib/api/years'
import { getSemesterBySlug } from '@/lib/api/semesters'
import { getSubjectBySlug } from '@/lib/api/subjects'

export default function Subject() {
  const { branchId, yearId, semesterId, subjectId } = useParams()

  const [year, setYear] = useState(null)
  const [semester, setSemester] = useState(null)
  const [subject, setSubject] = useState(null)
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
        setSubject(await getSubjectBySlug(s.id, subjectId))
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [branchId, yearId, semesterId, subjectId])

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <CardGridSkeleton count={1} />
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
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
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

      <div className="mt-4">
        <h1 className="font-display text-2xl font-semibold">{subject.name}</h1>
        {subject.code && (
          <p className="mt-1 font-mono-tabular text-xs text-[var(--color-text-muted)]">{subject.code}</p>
        )}
      </div>

      <div className="mt-10">
        {subject.google_drive_url ? (
          <div className="flex flex-col items-center gap-4 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] px-6 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
              <FolderOpen size={22} strokeWidth={1.75} />
            </span>
            <div>
              <h2 className="font-display text-base font-semibold">All resources for {subject.name}</h2>
              <p className="mt-1 max-w-sm text-sm text-[var(--color-text-muted)]">
                Notes, previous papers, assignments, lab programs, books, and PPTs live in this
                subject's shared Google Drive folder.
              </p>
            </div>
            <Button
              as="a"
              href={subject.google_drive_url}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
            >
              <FolderOpen size={16} /> Open Google Drive Folder
            </Button>
          </div>
        ) : (
          <EmptyState
            icon={FolderX}
            title="No Google Drive folder linked yet"
            description="An admin hasn't added a Drive folder link for this subject yet. Check back soon."
          />
        )}
      </div>
    </div>
  )
}
