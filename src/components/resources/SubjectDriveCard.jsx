import { NavLink } from 'react-router-dom'
import { FolderOpen, ArrowUpRight } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

/** subject: result row from searchSubjects() — includes nested semester/year/branch. */
export default function SubjectDriveCard({ subject }) {
  const { semester } = subject
  const year = semester?.year
  const branch = year?.branch
  const subjectPath =
    branch && year && semester
      ? `/branches/${branch.slug}/years/${year.slug}/semesters/${semester.slug}/subjects/${subject.slug}`
      : null

  return (
    <Card hover className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]">
          <FolderOpen size={17} strokeWidth={1.75} />
        </span>
        {!subject.google_drive_url && <Badge tone="neutral">Not linked yet</Badge>}
      </div>

      <div>
        <h3 className="font-display text-[15px] font-semibold leading-snug text-[var(--color-text)]">
          {subject.name}
        </h3>
        {(branch || year || semester) && (
          <p className="mt-1 font-mono-tabular text-xs text-[var(--color-text-muted)]">
            {[branch?.name, year?.name, semester?.name].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>

      <div className="mt-1 flex gap-2">
        {subjectPath && (
          <Button as={NavLink} to={subjectPath} variant="secondary" size="sm" className="flex-1 justify-center">
            View Subject
          </Button>
        )}
        {subject.google_drive_url && (
          <Button
            as="a"
            href={subject.google_drive_url}
            target="_blank"
            rel="noopener noreferrer"
            size="sm"
            className="flex-1 justify-center"
          >
            <ArrowUpRight size={14} /> Open Drive
          </Button>
        )}
      </div>
    </Card>
  )
}
