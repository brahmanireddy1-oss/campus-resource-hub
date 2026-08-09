import { NavLink } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-line)] bg-[var(--color-paper)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-[var(--color-text-muted)]">
          © {new Date().getFullYear()} Campus Resources. Built by students, for students.
        </p>
        <nav className="flex gap-5">
          <NavLink to="/about" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            About
          </NavLink>
          <NavLink to="/browse" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            Browse Resources
          </NavLink>
        </nav>
      </div>
    </footer>
  )
}
