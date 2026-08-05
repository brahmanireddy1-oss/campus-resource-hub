import { useState } from 'react'
import clsx from 'clsx'
import StatsOverview from '@/components/admin/StatsOverview'
import ApprovalsPanel from '@/components/admin/ApprovalsPanel'
import ResourcesPanel from '@/components/admin/ResourcesPanel'
import AcademicStructurePanel from '@/components/admin/AcademicStructurePanel'

const tabs = [
  { key: 'approvals', label: 'Approvals' },
  { key: 'resources', label: 'Resources' },
  { key: 'structure', label: 'Academic Structure' },
]

export default function AdminDashboard() {
  const [tab, setTab] = useState('approvals')
  const [statsKey, setStatsKey] = useState(0)
  const bumpStats = () => setStatsKey((k) => k + 1)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Review submissions and manage the academic structure.
      </p>

      <div className="mt-6">
        <StatsOverview refreshKey={statsKey} />
      </div>

      <div className="mt-8 flex gap-1 border-b border-[var(--color-line)]">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={clsx(
              'border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
              tab === t.key
                ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'approvals' && <ApprovalsPanel onChanged={bumpStats} />}
        {tab === 'resources' && <ResourcesPanel onChanged={bumpStats} />}
        {tab === 'structure' && <AcademicStructurePanel />}
      </div>
    </div>
  )
}
