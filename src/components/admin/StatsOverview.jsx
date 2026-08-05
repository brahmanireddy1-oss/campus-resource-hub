import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Files, Clock, CircleCheck, CircleX, Users } from 'lucide-react'
import StatCard from '@/components/admin/StatCard'
import { StatCardSkeleton } from '@/components/skeletons/ResourceSkeletons'
import { getAdminStats } from '@/lib/api/admin'

export default function StatsOverview({ refreshKey }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getAdminStats()
      .then(setStats)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [refreshKey])

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      <StatCard icon={Files} label="Total Resources" value={stats.total} />
      <StatCard icon={Clock} label="Pending" value={stats.pending} tone="amber" />
      <StatCard icon={CircleCheck} label="Approved" value={stats.approved} tone="emerald" />
      <StatCard icon={CircleX} label="Rejected" value={stats.rejected} tone="rose" />
      <StatCard icon={Users} label="Contributors" value={stats.contributors} tone="accent" />
    </div>
  )
}
