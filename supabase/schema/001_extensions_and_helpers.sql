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
