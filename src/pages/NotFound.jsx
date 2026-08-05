import { NavLink } from 'react-router-dom'
import { Compass } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center sm:px-6">
      <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]">
        <Compass size={22} strokeWidth={1.75} />
      </span>
      <p className="mt-6 font-mono-tabular text-xs text-[var(--color-text-muted)]">ERROR 404</p>
      <h1 className="mt-2 font-display text-2xl font-semibold">This page isn't catalogued</h1>
      <p className="mt-2 text-[var(--color-text-muted)]">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Button as={NavLink} to="/" className="mt-6">
        Back to Home
      </Button>
    </div>
  )
}
