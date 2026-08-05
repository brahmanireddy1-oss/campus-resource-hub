import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Eye, Pencil, Trash2, Plus } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import EmptyState from '@/components/ui/EmptyState'
import { CardGridSkeleton } from '@/components/skeletons/ResourceSkeletons'
import ResourceForm from '@/components/resources/ResourceForm'
import { formatDate, formatFileSize } from '@/utils/format'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { getAllResourcesAdmin, updateResourceDetails, deleteResourceAdmin } from '@/lib/api/admin'
import { getResourceDownloadUrl } from '@/lib/api/storage'
import { getResourceTypes } from '@/lib/api/resourceTypes'

export default function ResourcesPanel({ onChanged }) {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const debouncedSearch = useDebouncedValue(search, 350)

  const [types, setTypes] = useState([])
  const [editTarget, setEditTarget] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', description: '', resource_type_id: '' })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showUpload, setShowUpload] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    getAllResourcesAdmin({ status: status || undefined, search: debouncedSearch || undefined })
      .then(setResources)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [status, debouncedSearch])
  useEffect(() => {
    getResourceTypes().then(setTypes).catch(() => {})
  }, [])

  const openEdit = (r) => {
    setEditTarget(r)
    setEditForm({
      title: r.title,
      description: r.description || '',
      resource_type_id: r.resource_type?.id || '',
    })
  }

  const handleSaveEdit = async () => {
    setSaving(true)
    try {
      await updateResourceDetails(editTarget.id, editForm)
      toast.success('Resource updated')
      setEditTarget(null)
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await deleteResourceAdmin(deleteTarget.id, deleteTarget.file_path)
      toast.success('Resource deleted')
      setDeleteTarget(null)
      setResources((prev) => prev.filter((r) => r.id !== deleteTarget.id))
      onChanged?.()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
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

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search resources…"
          className="max-w-xs"
        />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="max-w-[10rem]">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </Select>
        <Button size="sm" className="ml-auto" onClick={() => setShowUpload(true)}>
          <Plus size={15} /> Upload Resource
        </Button>
      </div>

      <div className="mt-5">
        {loading ? (
          <CardGridSkeleton count={4} />
        ) : resources.length === 0 ? (
          <EmptyState title="No resources match" description="Try a different search or status filter." />
        ) : (
          <div className="flex flex-col gap-3">
            {resources.map((r) => (
              <Card key={r.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-display text-[15px] font-semibold">{r.title}</h3>
                    <Badge tone={r.status} withIcon>
                      {r.status}
                    </Badge>
                    <Badge tone="neutral">{r.resource_type?.name}</Badge>
                  </div>
                  <p className="mt-1 font-mono-tabular text-xs text-[var(--color-text-muted)]">
                    {r.subject?.name} · {r.uploader?.full_name || r.uploader?.email} ·{' '}
                    {formatDate(r.created_at)} · {formatFileSize(r.file_size)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handlePreview(r)} aria-label="Preview">
                    <Eye size={15} />
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => openEdit(r)} aria-label="Edit">
                    <Pencil size={15} />
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => setDeleteTarget(r)} aria-label="Delete">
                    <Trash2 size={15} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit modal */}
      <Modal open={Boolean(editTarget)} onClose={() => setEditTarget(null)} title="Edit resource">
        <h2 className="font-display text-lg font-semibold pr-6">Edit resource</h2>
        <div className="mt-4 flex flex-col gap-4">
          <Input
            label="Title"
            value={editForm.title}
            onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
          />
          <Textarea
            label="Description"
            value={editForm.description}
            onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
          />
          <Select
            label="Resource Type"
            value={editForm.resource_type_id}
            onChange={(e) => setEditForm((f) => ({ ...f, resource_type_id: e.target.value }))}
          >
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => setEditTarget(null)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSaveEdit} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </Modal>

      {/* Upload modal */}
      <Modal open={showUpload} onClose={() => setShowUpload(false)} title="Upload resource" maxWidth="max-w-lg">
        <h2 className="font-display text-lg font-semibold pr-6">Upload Resource</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">Published immediately — no approval needed.</p>
        <div className="mt-4">
          <ResourceForm
            onSuccess={() => {
              setShowUpload(false)
              load()
              onChanged?.()
            }}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete this resource?"
        description={`"${deleteTarget?.title}" will be permanently removed, including its file.`}
        confirmLabel="Delete"
        loading={saving}
      />
    </div>
  )
}
