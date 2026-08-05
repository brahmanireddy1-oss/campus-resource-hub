import { useSearchParams, useNavigate } from 'react-router-dom'
import ResourceForm from '@/components/resources/ResourceForm'

export default function SubmitResource() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const initial = {
    branchId: searchParams.get('branchId') || '',
    yearId: searchParams.get('yearId') || '',
    semesterId: searchParams.get('semesterId') || '',
    subjectId: searchParams.get('subjectId') || '',
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-2xl font-semibold">Submit a Resource</h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Your submission will be reviewed before it's published. You can track its status from
        your dashboard.
      </p>

      <div className="mt-8">
        <ResourceForm initial={initial} onSuccess={() => navigate('/dashboard')} />
      </div>
    </div>
  )
}
