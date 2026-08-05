import { Download, User, Calendar } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { formatDate, formatFileSize, getFileIcon } from '@/utils/format'

/**
 * resource: {
 *   title, description, uploaderName, createdAt,
 *   resourceTypeName, fileName, fileSize, status,
 *   onDownload
 * }
 * showStatus: show the pending/approved/rejected badge (used on dashboards,
 * not on public Browse/Subject pages where everything shown is approved).
 */
export default function ResourceCard({ resource, showStatus = false, onDownload }) {
  const {
    title,
    description,
    uploaderName,
    createdAt,
    resourceTypeName,
    fileName,
    fileSize,
    status,
  } = resource

  const FileIcon = getFileIcon(fileName)

  return (
    <Card hover className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]">
          <FileIcon size={17} strokeWidth={1.75} />
        </span>
        <div className="flex flex-wrap justify-end gap-1.5">
          {resourceTypeName && <Badge tone="neutral">{resourceTypeName}</Badge>}
          {showStatus && status && (
            <Badge tone={status} withIcon>
              {status}
            </Badge>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-display text-[15px] font-semibold leading-snug text-[var(--color-text)]">
          {title}
        </h3>
        {description && (
          <p className="mt-1 line-clamp-2 text-sm text-[var(--color-text-muted)]">{description}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono-tabular text-xs text-[var(--color-text-muted)]">
        {uploaderName && (
          <span className="flex items-center gap-1">
            <User size={12} /> {uploaderName}
          </span>
        )}
        {createdAt && (
          <span className="flex items-center gap-1">
            <Calendar size={12} /> {formatDate(createdAt)}
          </span>
        )}
        {fileSize != null && <span>{formatFileSize(fileSize)}</span>}
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={onDownload}
        className="mt-1 w-full justify-center"
      >
        <Download size={15} /> Download
      </Button>
    </Card>
  )
}
