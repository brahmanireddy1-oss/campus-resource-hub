import { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { LogIn, UserPlus, TriangleAlert } from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '@/context/AuthContext'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function Login() {
  const { user, loading, isConfigured, signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [mode, setMode] = useState('sign-in') // 'sign-in' | 'sign-up'
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Already logged in — bounce straight to where they were headed.
  if (!loading && user) {
    const redirectTo = location.state?.from?.pathname || '/'
    return <Navigate to={redirectTo} replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (mode === 'sign-in') {
        await signIn({ email, password })
        toast.success('Welcome back!')
        navigate(location.state?.from?.pathname || '/', { replace: true })
      } else {
        const { session } = await signUp({ email, password, fullName })
        if (session) {
          toast.success('Account created!')
          navigate('/', { replace: true })
        } else {
          toast.success('Check your email to confirm your account.')
          setMode('sign-in')
        }
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      {!isConfigured && (
        <div className="mb-6 flex items-start gap-2.5 rounded-[var(--radius-control)] border border-[var(--color-amber)]/30 bg-[var(--color-amber-soft)] px-4 py-3 text-sm text-[var(--color-amber)]">
          <TriangleAlert size={16} className="mt-0.5 shrink-0" />
          <span>
            Supabase isn't configured yet — add <code className="font-mono-tabular">VITE_SUPABASE_URL</code> and{' '}
            <code className="font-mono-tabular">VITE_SUPABASE_ANON_KEY</code> to your <code>.env</code> file.
          </span>
        </div>
      )}

      <div className="mb-6 flex rounded-[var(--radius-control)] border border-[var(--color-line)] p-1">
        <button
          type="button"
          onClick={() => setMode('sign-in')}
          className={clsx(
            'flex-1 rounded-[calc(var(--radius-control)-2px)] py-2 text-sm font-medium transition-colors',
            mode === 'sign-in'
              ? 'bg-[var(--color-accent)] text-white'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          )}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode('sign-up')}
          className={clsx(
            'flex-1 rounded-[calc(var(--radius-control)-2px)] py-2 text-sm font-medium transition-colors',
            mode === 'sign-up'
              ? 'bg-[var(--color-accent)] text-white'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          )}
        >
          Create account
        </button>
      </div>

      <h1 className="font-display text-2xl font-semibold">
        {mode === 'sign-in' ? 'Welcome back' : 'Create your account'}
      </h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        {mode === 'sign-in'
          ? 'Sign in to submit resources and track your uploads.'
          : 'New accounts start as students. Admin access is granted separately.'}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        {mode === 'sign-up' && (
          <Input
            id="fullName"
            label="Full name"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        )}
        <Input
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          id="password"
          label="Password"
          type="password"
          autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />

        <Button type="submit" disabled={submitting || !isConfigured} className="mt-2">
          {mode === 'sign-in' ? <LogIn size={16} /> : <UserPlus size={16} />}
          {submitting
            ? 'Please wait…'
            : mode === 'sign-in'
            ? 'Sign in'
            : 'Create account'}
        </Button>
      </form>
    </div>
  )
}
