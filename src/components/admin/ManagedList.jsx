import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import EmptyState from '@/components/ui/EmptyState'
import clsx from 'clsx'

/**
 * items: [{ id, name, subtitle? }]
 * onSave(values, editingItem|null) — values = { name, code? }
 * extraFields: optional array of { key, label } text fields beyond `name` (e.g. subject code)
 * renderExtra(item): optional extra action rendered per row (e.g. syllabus upload button)
 */
export default function ManagedList({
  title,
  items,
  selectedId,
  onSelect,
  onSave,
  onDelete,
  disabled = false,
  disabledMessage = 'Select the parent above first.',
  extraFields = [],
  renderExtra,
}) {
  const [modalItem, setModalItem] = useState(undefined) // undefined = closed, null = adding, object = editing
  const [form, setForm] = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)

  const openAdd = () => {
    setForm({ name: '', ...Object.fromEntries(extraFields.map((f) => [f.key, ''])) })
    setModalItem(null)
  }

  const openEdit = (item) => {
    setForm({ name: item.name, ...Object.fromEntries(extraFields.map((f) => [f.key, item[f.key] || ''])) })
    setModalItem(item)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(form, modalItem)
      setModalItem(undefined)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await onDelete(deleteTarget)
      setDeleteTarget(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)]">
      <div className="flex items-center justify-between border-b border-[var(--color-line)] px-4 py-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Button variant="ghost" size="sm" onClick={openAdd} disabled={disabled} aria-label={`Add ${title}`}>
          <Plus size={15} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {disabled ? (
          <p className="px-2 py-6 text-center text-xs text-[var(--color-text-muted)]">{disabledMessage}</p>
        ) : items.length === 0 ? (
          <div className="py-4">
            <EmptyState title="Nothing here yet" />
          </div>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {items.map((item) => (
              <li
                key={item.id}
                className={clsx(
                  'group flex items-center justify-between gap-2 rounded-[var(--radius-control)] px-2.5 py-2 text-sm',
                  selectedId === item.id
                    ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                    : 'hover:bg-[var(--color-surface-muted)]'
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelect?.(item)}
                  className="min-w-0 flex-1 truncate text-left"
                >
                  {item.name}
                  {item.subtitle && (
                    <span className="ml-1.5 text-xs text-[var(--color-text-muted)]">{item.subtitle}</span>
                  )}
                </button>
                <span className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100">
                  {renderExtra?.(item)}
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    aria-label="Edit"
                    className="rounded p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    aria-label="Delete"
                    className="rounded p-1 text-[var(--color-text-muted)] hover:text-[var(--color-rose)]"
                  >
                    <Trash2 size={13} />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal open={modalItem !== undefined} onClose={() => setModalItem(undefined)} title={title}>
        <h2 className="font-display text-lg font-semibold pr-6">
          {modalItem ? `Edit ${title}` : `Add ${title}`}
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          <Input
            label="Name"
            value={form.name || ''}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            autoFocus
          />
          {extraFields.map((f) => (
            <Input
              key={f.key}
              label={f.label}
              value={form[f.key] || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
            />
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => setModalItem(undefined)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving || !form.name}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This also removes everything nested underneath it. This can't be undone."
        confirmLabel="Delete"
        loading={saving}
      />
    </div>
  )
}
