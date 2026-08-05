import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Plus, TriangleAlert } from 'lucide-react'
import ResourceCard from '@/components/resources/ResourceCard'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Card from '@/components/ui/Card'
import { CardGridSkeleton } from '@/components/skeletons/ResourceSkeletons'
import { useAuth } from '@/context/AuthContext'
import { getMySubmissions } from '@/lib/api/resources'
import { getResourceDownloadUrl } from '@/lib/api/storage'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getMySubmissions(user.id)
      .then(setSubmissions)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [user])

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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">My Submissions</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Track the status of everything you've submitted.
          </p>
        </div>
        <Button as={NavLink} to="/submit" size="sm">
          <Plus size={15} /> Submit Resource
        </Button>
      </div>

      <div className="mt-8">
        {loading ? (
          <CardGridSkeleton />
        ) : submissions.length === 0 ? (
          <EmptyState
            title="No submissions yet"
            description="Resources you submit will show up here with their review status."
            action={
              <Button as={NavLink} to="/submit" size="sm">
                <Plus size={15} /> Submit your first resource
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {submissions.map((r) => (
              <div key={r.id} className="flex flex-col gap-2">
                <ResourceCard
                  resource={{
                    title: r.title,
                    description: r.description,
                    createdAt: r.created_at,
                    resourceTypeName: r.resource_type?.name,
                    fileName: r.file_name,
                    fileSize: r.file_size,
                    status: r.status,
                  }}
                  showStatus
                  onDownload={() => handleDownload(r)}
                />
                {r.status === 'rejected' && r.rejection_reason && (
                  <Card className="flex items-start gap-2 border-[var(--color-rose)]/30 bg-[var(--color-rose-soft)] p-3 text-xs text-[var(--color-rose)]">
                    <TriangleAlert size={14} className="mt-0.5 shrink-0" />
                    <span>{r.rejection_reason}</span>
                  </Card>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
