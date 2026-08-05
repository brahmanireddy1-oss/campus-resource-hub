import { BookOpen, ShieldCheck, Users } from 'lucide-react'

const points = [
  {
    icon: BookOpen,
    title: 'Organized by Year → Semester → Subject',
    description:
      'Every resource lives under the right subject, so finding what you need takes seconds, not scrolling.',
  },
  {
    icon: ShieldCheck,
    title: 'Reviewed before it goes live',
    description:
      'Student submissions are checked by an admin before anyone else can see them, keeping the library reliable.',
  },
  {
    icon: Users,
    title: 'Built by the batch, for the batch',
    description:
      'Notes, papers, and lab programs shared by students who came before you — and by you, for the ones after.',
  },
]

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-semibold">About Campus Resources</h1>
      <p className="mt-3 text-[var(--color-text-muted)]">
        A single, organized place for the notes, papers, assignments, lab programs, books, and
        slides your coursework actually needs — contributed by students and kept accurate by
        admin review.
      </p>

      <div className="mt-10 flex flex-col gap-6">
        {points.map((p) => (
          <div key={p.title} className="flex gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
              <p.icon size={18} strokeWidth={1.75} />
            </span>
            <div>
              <h3 className="font-display text-base font-semibold">{p.title}</h3>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">{p.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
