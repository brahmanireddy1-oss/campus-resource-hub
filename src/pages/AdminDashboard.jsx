import AcademicStructurePanel from '@/components/admin/AcademicStructurePanel'

export default function AdminDashboard() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Manage branches, years, semesters, subjects, and each subject's Google Drive folder.
      </p>

      <div className="mt-8">
        <AcademicStructurePanel />
      </div>
    </div>
  )
}
