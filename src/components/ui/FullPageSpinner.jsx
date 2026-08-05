import { Loader2 } from 'lucide-react'

export default function FullPageSpinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="animate-spin text-[var(--color-text-muted)]" size={22} strokeWidth={2} />
    </div>
  )
}
