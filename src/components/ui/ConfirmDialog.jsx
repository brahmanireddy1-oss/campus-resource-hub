import Modal from './Modal'
import Button from './Button'

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  tone = 'danger', // 'danger' | 'primary'
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <h2 className="font-display text-lg font-semibold pr-6">{title}</h2>
      {description && (
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">{description}</p>
      )}
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant={tone} size="sm" onClick={onConfirm} disabled={loading}>
          {loading ? 'Please wait…' : confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
