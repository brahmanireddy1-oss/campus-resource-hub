# Database schema — setup instructions

## Run the schema
In your Supabase project → **SQL Editor**, run the files in `schema/` in
order (or just run `schema_combined.sql`, which is all five concatenated):

1. `001_extensions_and_helpers.sql`
2. `002_profiles.sql`
3. `003_academic_structure.sql`
4. `004_resources.sql`
5. `005_storage.sql`

## Make yourself an admin
Sign up once through the app (creates a `profiles` row with
`role = 'student'`), then in the SQL Editor:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

This is the only way to grant admin — there's no self-serve promotion
in the app, by design.

## Optional: seed placeholder data
`seed_dev.sql` inserts one placeholder Year → Semester → Subject so
there's something to click through while building pages. Skip it, or
delete the rows later, once you provide real academic data.

## Entity relationships
```
profiles (id = auth.users.id, role: student | admin)
  └─ resources.uploaded_by, resources.reviewed_by

years
  └─ semesters (year_id)
       └─ subjects (semester_id)
            └─ resources (subject_id)
                 ├─ resource_types (resource_type_id)  -- admin-editable list
                 └─ uploaded_by → profiles

resource_types: Notes, Previous Papers, Assignments, Lab Programs,
Books, PPTs — seeded as starting rows, editable by admins afterwards
(not a fixed enum).

resources.status: pending | approved | rejected
  - Admin insert  → status forces to 'approved' immediately
  - Student insert → status forces to 'pending'
  - Only admins can change status afterwards (approve/reject)
  - Enforced server-side by a trigger, not just app logic
```

## Storage buckets
- **resource-files** (private) — student/admin uploads. A file is only
  readable by its uploader, an admin, or the public once the matching
  `resources` row has `status = 'approved'`. Upload path convention:
  `{user_id}/{filename}`.
- **syllabi** (public) — admin-only uploads, publicly readable, since a
  syllabus should be viewable without logging in.

Both buckets are created by `005_storage.sql`; you don't need to
create them manually in the dashboard.
