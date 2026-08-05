import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, LibraryBig, ChevronDown, LayoutDashboard, ShieldCheck, LogOut } from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import ThemeToggle from '@/components/ui/ThemeToggle'
import Button from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'

const links = [
  { to: '/', label: 'Home' },
  { to: '/browse', label: 'Browse Resources' },
  { to: '/submit', label: 'Submit Resource' },
  { to: '/about', label: 'About' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, profile, isAdmin, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[var(--color-paper)]/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <NavLink to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-accent)] text-white">
            <LibraryBig size={17} strokeWidth={2} />
          </span>
              <div className="flex flex-col leading-tight">
      <span className="font-display text-[15px] font-semibold tracking-tight">
        Campus Resources
      </span>
      <span className="text-[11px] text-[var(--color-text-muted)] font-medium">
        MECS
      </span>
    </div>
        </NavLink>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                clsx(
                  'rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-[var(--color-accent)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {user ? (
            <UserMenu profile={profile} isAdmin={isAdmin} signOut={signOut} />
          ) : (
            <Button as={NavLink} to="/login" variant="primary" size="sm">
              Log in
            </Button>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] text-[var(--color-text)] md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[var(--color-line)] px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    'rounded-[var(--radius-control)] px-3 py-2.5 text-sm font-medium',
                    isActive
                      ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                      : 'text-[var(--color-text-muted)]'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            {user && (
              <NavLink
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="rounded-[var(--radius-control)] px-3 py-2.5 text-sm font-medium text-[var(--color-text-muted)]"
              >
                My Dashboard
              </NavLink>
            )}
            {isAdmin && (
              <NavLink
                to="/admin"
                onClick={() => setOpen(false)}
                className="rounded-[var(--radius-control)] px-3 py-2.5 text-sm font-medium text-[var(--color-text-muted)]"
              >
                Admin Dashboard
              </NavLink>
            )}
          </nav>
          <div className="mt-3 flex items-center justify-between border-t border-[var(--color-line)] pt-3">
            <ThemeToggle />
            {user ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  signOut()
                  setOpen(false)
                }}
              >
                <LogOut size={15} /> Sign out
              </Button>
            ) : (
              <Button as={NavLink} to="/login" variant="primary" size="sm" onClick={() => setOpen(false)}>
                Log in
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

function UserMenu({ profile, isAdmin, signOut }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const initial = (profile?.full_name || profile?.email || '?').trim().charAt(0).toUpperCase()

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out')
    setOpen(false)
    navigate('/')
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-line)] py-1 pl-1 pr-2.5 hover:bg-[var(--color-surface-muted)]"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-xs font-semibold text-[var(--color-accent)]">
          {initial}
        </span>
        <span className="max-w-[8rem] truncate text-sm font-medium">
          {profile?.full_name || profile?.email || 'Account'}
        </span>
        <ChevronDown size={14} className="text-[var(--color-text-muted)]" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] py-1 shadow-lg">
          <NavLink
            to="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]"
          >
            <LayoutDashboard size={15} /> My Dashboard
          </NavLink>
          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]"
            >
              <ShieldCheck size={15} /> Admin Dashboard
            </NavLink>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--color-rose)] hover:bg-[var(--color-rose-soft)]"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      )}
    </div>
  )
}
