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
