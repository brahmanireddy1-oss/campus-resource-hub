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
