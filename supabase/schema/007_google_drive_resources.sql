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
