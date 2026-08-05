import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Check, X, Eye } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Textarea from '@/components/ui/Textarea'
import EmptyState from '@/components/ui/EmptyState'
import { CardGridSkeleton } from '@/components/skeletons/ResourceSkeletons'
import { formatDate, formatFileSize } from '@/utils/format'
import { getAllResourcesAdmin, approveResource, rejectResource } from '@/lib/api/admin'
import { getResourceDownloadUrl } from '@/lib/api/storage'

export default function ApprovalsPanel({ onChanged }) {
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [rejectTarget, setRejectTarget] = useState(null)
  const [reason, setReason] = useState('')
  const [busyId, setBusyId] = useState(null)

  const load = () => {
    setLoading(true)
    getAllResourcesAdmin({ status: 'pending' })
      .then(setPending)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleApprove = async (id) => {
    setBusyId(id)
    try {
      await approveResource(id)
      toast.success('Resource approved')
      setPending((prev) => prev.filter((r) => r.id !== id))
      onChanged?.()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const handleReject = async () => {
    setBusyId(rejectTarget.id)
    try {
      await rejectResource(rejectTarget.id, reason)
      toast.success('Resource rejected')
      setPending((prev) => prev.filter((r) => r.id !== rejectTarget.id))
      setRejectTarget(null)
      setReason('')
      onChanged?.()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const handlePreview = async (resource) => {
    try {
      const url = await getResourceDownloadUrl(resource.file_path)
      window.open(url, '_blank', 'noopener')
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (loading) return <CardGridSkeleton count={3} />

  if (pending.length === 0) {
    return <EmptyState title="Nothing waiting for review" description="New student submissions will show up here." />
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {pending.map((r) => (
          <Card key={r.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate font-display text-[15px] font-semibold">{r.title}</h3>
                <Badge tone="neutral">{r.resource_type?.name}</Badge>
                <Badge tone="accent">{r.subject?.name}</Badge>
              </div>
              {r.description && (
                <p className="mt-1 line-clamp-1 text-sm text-[var(--color-text-muted)]">{r.description}</p>
              )}
              <p className="mt-1 font-mono-tabular text-xs text-[var(--color-text-muted)]">
                {r.uploader?.full_name || r.uploader?.email} · {formatDate(r.created_at)} ·{' '}
                {formatFileSize(r.file_size)}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="ghost" size="sm" onClick={() => handlePreview(r)}>
                <Eye size={15} /> Preview
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setRejectTarget(r)
                  setReason('')
                }}
                disabled={busyId === r.id}
              >
                <X size={15} /> Reject
              </Button>
              <Button size="sm" onClick={() => handleApprove(r.id)} disabled={busyId === r.id}>
                <Check size={15} /> Approve
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={Boolean(rejectTarget)} onClose={() => setRejectTarget(null)} title="Reject resource">
        <h2 className="font-display text-lg font-semibold pr-6">Reject "{rejectTarget?.title}"</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Optionally let the student know why, so they can resubmit.
        </p>
        <Textarea
          className="mt-4"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (optional)"
        />
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => setRejectTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleReject} disabled={busyId === rejectTarget?.id}>
            {busyId === rejectTarget?.id ? 'Please wait…' : 'Reject Resource'}
          </Button>
        </div>
      </Modal>
    </>
  )
}
