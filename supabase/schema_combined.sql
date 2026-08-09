-- ============================================================
-- 001: Extensions & generic helpers (no table dependencies)
-- ============================================================

create extension if not exists "pgcrypto";

-- Reusable updated_at trigger — used by every table with an updated_at column
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Note: is_admin() lives in 002_profiles.sql, not here — it's a `language sql`
-- function, and Postgres validates table references in those at CREATE time
-- (unlike plpgsql), so it can't be created before public.profiles exists.
-- ============================================================
-- 002: profiles
-- Extends auth.users. role is 'student' by default; admins are
-- promoted manually in the Supabase dashboard/SQL editor:
--   update public.profiles set role = 'admin' where email = '...';
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text not null,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Prevent role escalation through the app: any UPDATE issued with the
-- regular (non-service-role) client silently keeps the existing role.
-- Promote admins via the Supabase SQL editor/dashboard instead.
create or replace function public.prevent_role_self_change()
returns trigger
language plpgsql
as $$
begin
  if auth.role() <> 'service_role' and new.role is distinct from old.role then
    new.role = old.role;
  end if;
  return new;
end;
$$;

create trigger guard_profiles_role
  before update on public.profiles
  for each row execute function public.prevent_role_self_change();

-- is_admin(): must be created here, after public.profiles exists — it's a
-- `language sql` function, so Postgres validates the table reference at
-- CREATE time (unlike plpgsql). SECURITY DEFINER so it can read
-- profiles.role without being blocked by profiles' own RLS (avoids
-- recursive RLS). Every later policy in this schema depends on it.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;

create policy "Profiles are viewable by their owner or an admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin());
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
-- ============================================================
-- 004: resources
-- The core content table. file_path must match the object path in the
-- 'resource-files' storage bucket exactly — storage RLS (005) joins on it.
-- ============================================================

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects (id) on delete cascade,
  resource_type_id uuid not null references public.resource_types (id) on delete restrict,
  title text not null,
  description text,
  file_path text not null,       -- path inside the 'resource-files' bucket
  file_name text not null,       -- original filename, for display
  file_size bigint,
  uploaded_by uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_resources_subject_id on public.resources (subject_id);
create index idx_resources_status on public.resources (status);
create index idx_resources_uploaded_by on public.resources (uploaded_by);
create index idx_resources_resource_type_id on public.resources (resource_type_id);

create trigger set_resources_updated_at
  before update on public.resources
  for each row execute function public.set_updated_at();

-- Enforce the approval workflow server-side, regardless of what the
-- client sends:
--   - Admin uploads  -> published immediately (status = 'approved')
--   - Student uploads -> always start 'pending', can't self-approve
--   - Only admins can change status after creation (approve/reject)
create or replace function public.enforce_resource_workflow()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if public.is_admin() then
      new.status := coalesce(new.status, 'approved');
    else
      new.status := 'pending';
      new.reviewed_by := null;
      new.reviewed_at := null;
    end if;
  elsif tg_op = 'UPDATE' then
    if not public.is_admin() then
      -- Non-admins cannot change status or reassign ownership/review fields
      new.status := old.status;
      new.reviewed_by := old.reviewed_by;
      new.reviewed_at := old.reviewed_at;
      new.uploaded_by := old.uploaded_by;
    elsif new.status is distinct from old.status then
      new.reviewed_by := auth.uid();
      new.reviewed_at := now();
    end if;
  end if;
  return new;
end;
$$;

create trigger guard_resource_workflow
  before insert or update on public.resources
  for each row execute function public.enforce_resource_workflow();

alter table public.resources enable row level security;

-- Anyone (including anonymous visitors) can read approved resources;
-- students can additionally see their own submissions of any status;
-- admins can see everything.
create policy "Approved resources are publicly readable"
  on public.resources for select
  using (
    status = 'approved'
    or uploaded_by = auth.uid()
    or public.is_admin()
  );

-- Any authenticated user (student or admin) can submit a resource
-- attributed to themselves. The trigger above decides the real status.
create policy "Authenticated users can submit resources"
  on public.resources for insert
  with check (auth.uid() = uploaded_by);

-- Only admins can edit resources after creation (approve/reject/edit).
create policy "Admins can update resources"
  on public.resources for update
  using (public.is_admin());

create policy "Admins can delete resources"
  on public.resources for delete
  using (public.is_admin());
-- ============================================================
-- 005: Storage buckets
--
-- resource-files (private): student/admin uploads for Notes, Previous
--   Papers, Assignments, Lab Programs, Books, PPTs. Kept private so a
--   pending/rejected submission's file isn't publicly reachable — only
--   the uploader and admins can read it until resources.status = 'approved'.
--   Upload path convention (enforced by policy): {auth.uid()}/{filename}
--
-- syllabi (public): admin-only uploads, publicly readable, since a
--   syllabus is meant to be visible to any visitor without logging in.
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resource-files',
  'resource-files',
  false,
  52428800, -- 50 MB
  array['application/pdf', 'application/zip', 'application/x-zip-compressed',
        'image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'syllabi',
  'syllabi',
  true,
  52428800,
  array['application/pdf']
)
on conflict (id) do nothing;

-- ---- resource-files policies ----

create policy "Read own, approved, or admin (resource-files)"
  on storage.objects for select
  using (
    bucket_id = 'resource-files'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
      or exists (
        select 1 from public.resources r
        where r.file_path = storage.objects.name
          and r.status = 'approved'
      )
    )
  );

create policy "Authenticated users upload to their own folder (resource-files)"
  on storage.objects for insert
  with check (
    bucket_id = 'resource-files'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Admins delete any file (resource-files)"
  on storage.objects for delete
  using (bucket_id = 'resource-files' and public.is_admin());

create policy "Admins update any file (resource-files)"
  on storage.objects for update
  using (bucket_id = 'resource-files' and public.is_admin());

-- ---- syllabi policies ----

create policy "Syllabi are publicly readable"
  on storage.objects for select
  using (bucket_id = 'syllabi');

create policy "Admins manage syllabi (insert)"
  on storage.objects for insert
  with check (bucket_id = 'syllabi' and public.is_admin());

create policy "Admins manage syllabi (update)"
  on storage.objects for update
  using (bucket_id = 'syllabi' and public.is_admin());

create policy "Admins manage syllabi (delete)"
  on storage.objects for delete
  using (bucket_id = 'syllabi' and public.is_admin());
-- ============================================================
-- 006: Branches
-- New top of the hierarchy: Branch -> Year -> Semester -> Subject -> Resources
-- Run this AFTER 001-005 have already been applied.
-- ============================================================

create table public.branches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  order_index int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_branches_updated_at
  before update on public.branches
  for each row execute function public.set_updated_at();

alter table public.branches enable row level security;

create policy "Branches are publicly readable" on public.branches for select using (true);
create policy "Admins manage branches" on public.branches for insert with check (public.is_admin());
create policy "Admins update branches" on public.branches for update using (public.is_admin());
create policy "Admins delete branches" on public.branches for delete using (public.is_admin());

-- Link years -> branches. Nullable so this migration doesn't fail on
-- existing years; assign each one a branch from the Admin Dashboard
-- (Academic Structure -> pick a Branch, then add/re-create its Years
-- under it) after running this.
alter table public.years add column branch_id uuid references public.branches (id) on delete cascade;

create index idx_years_branch_id on public.years (branch_id);

-- A year's slug ("1st-year") should be reusable across different
-- branches, so uniqueness moves from global to per-branch.
alter table public.years drop constraint if exists years_slug_key;
alter table public.years add constraint years_branch_slug_key unique (branch_id, slug);
-- ============================================================
-- 007: Google Drive resources
-- Replaces the individual-file submission/approval model with one
-- Google Drive folder URL per subject. No RLS changes needed — the
-- existing "Subjects are publicly readable" / "Admins update subjects"
-- policies from 003_academic_structure.sql already cover this column,
-- since RLS is row-level, not column-level.
--
-- Not touched by this migration (left in place, now unused): the
-- `resources` and `resource_types` tables, and the `resource-files`
-- storage bucket. Nothing reads from them anymore after this change,
-- but nothing forces you to drop them either — do that manually later
-- if you want a full cleanup.
-- ============================================================

alter table public.subjects add column google_drive_url text;
