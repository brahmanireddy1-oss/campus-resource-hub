-- ============================================================
-- OPTIONAL — development/testing placeholder data only.
-- Not part of the schema. Run this manually if you want something to
-- click through while building the UI; skip it (or delete these rows
-- later) once real academic data is provided.
-- ============================================================

with y1 as (
  insert into public.years (name, slug, order_index)
  values ('1st Year', '1st-year', 1)
  returning id
), s1 as (
  insert into public.semesters (year_id, name, slug, order_index)
  select id, 'Semester 1', 'semester-1', 1 from y1
  returning id
)
insert into public.subjects (semester_id, name, code, slug, order_index)
select id, 'Data Structures', 'CS201', 'data-structures', 1 from s1;
