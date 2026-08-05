-- ============================================================
-- 003: Academic structure — Years -> Semesters -> Subjects
-- Plus resource_types, an admin-editable lookup list
-- (Notes / Previous Papers / Assignments / Lab Programs / Books / PPTs
-- are seeded as starting values, not hardcoded into the schema —
-- admins can rename/add/remove from the Admin Dashboard).
-- No academic data is hardcoded here; this file only creates tables.
-- ============================================================

create table public.years (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  order_index int not null default 0,
  syllabus_url text,
  syllabus_file_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_years_updated_at
  before update on public.years
  for each row execute function public.set_updated_at();

create table public.semesters (
  id uuid primary key default gen_random_uuid(),
  year_id uuid not null references public.years (id) on delete cascade,
  name text not null,
  slug text not null,
  order_index int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (year_id, slug)
);

create index idx_semesters_year_id on public.semesters (year_id);

create trigger set_semesters_updated_at
  before update on public.semesters
  for each row execute function public.set_updated_at();

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  semester_id uuid not null references public.semesters (id) on delete cascade,
  name text not null,
  code text,
  slug text not null,
  order_index int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (semester_id, slug)
);

create index idx_subjects_semester_id on public.subjects (semester_id);

create trigger set_subjects_updated_at
  before update on public.subjects
  for each row execute function public.set_updated_at();

create table public.resource_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

-- Starting values for the categories named in the spec. Admin-editable
-- afterwards from the Admin Dashboard — not a hardcoded enum.
insert into public.resource_types (name, slug, order_index) values
  ('Notes', 'notes', 1),
  ('Previous Papers', 'previous-papers', 2),
  ('Assignments', 'assignments', 3),
  ('Lab Programs', 'lab-programs', 4),
  ('Books', 'books', 5),
  ('PPTs', 'ppts', 6);

-- RLS: academic structure is public to read (needed for anonymous
-- browsing); only admins can manage it.
alter table public.years enable row level security;
alter table public.semesters enable row level security;
alter table public.subjects enable row level security;
alter table public.resource_types enable row level security;

create policy "Years are publicly readable" on public.years for select using (true);
create policy "Admins manage years" on public.years for insert with check (public.is_admin());
create policy "Admins update years" on public.years for update using (public.is_admin());
create policy "Admins delete years" on public.years for delete using (public.is_admin());

create policy "Semesters are publicly readable" on public.semesters for select using (true);
create policy "Admins manage semesters" on public.semesters for insert with check (public.is_admin());
create policy "Admins update semesters" on public.semesters for update using (public.is_admin());
create policy "Admins delete semesters" on public.semesters for delete using (public.is_admin());

create policy "Subjects are publicly readable" on public.subjects for select using (true);
create policy "Admins manage subjects" on public.subjects for insert with check (public.is_admin());
create policy "Admins update subjects" on public.subjects for update using (public.is_admin());
create policy "Admins delete subjects" on public.subjects for delete using (public.is_admin());

create policy "Resource types are publicly readable" on public.resource_types for select using (true);
create policy "Admins manage resource types" on public.resource_types for insert with check (public.is_admin());
create policy "Admins update resource types" on public.resource_types for update using (public.is_admin());
create policy "Admins delete resource types" on public.resource_types for delete using (public.is_admin());
