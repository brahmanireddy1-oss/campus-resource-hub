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
