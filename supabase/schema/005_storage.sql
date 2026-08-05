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
