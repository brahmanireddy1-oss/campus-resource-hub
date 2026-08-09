import { supabase } from '@/lib/supabaseClient'

export async function getSubjectsBySemesterId(semesterId) {
  const { data, error } = await supabase
    .from('subjects')
    .select('id, name, code, slug, semester_id, google_drive_url')
    .eq('semester_id', semesterId)
    .order('order_index', { ascending: true })
  if (error) throw error
  return data
}

export async function getSubjectBySlug(semesterId, slug) {
  const { data, error } = await supabase
    .from('subjects')
    .select('id, name, code, slug, semester_id, google_drive_url')
    .eq('semester_id', semesterId)
    .eq('slug', slug)
    .single()
  if (error) throw error
  return data
}

export async function getAllSubjects() {
  const { data, error } = await supabase
    .from('subjects')
    .select('id, name, semester_id, google_drive_url')
    .order('order_index', { ascending: true })
  if (error) throw error
  return data
}

/** Resolves Branch/Year/Semester filters down to a list of semester ids,
 * then returns matching subjects with full parent context (for Browse's
 * search — mirrors the same cascading-filter pattern used elsewhere). */
export async function searchSubjects({ search, branchId, yearId, semesterId } = {}) {
  let semesterIds = null

  if (semesterId) {
    semesterIds = [semesterId]
  } else if (yearId) {
    const { data, error } = await supabase.from('semesters').select('id').eq('year_id', yearId)
    if (error) throw error
    semesterIds = data.map((s) => s.id)
  } else if (branchId) {
    const { data: years, error: yearErr } = await supabase.from('years').select('id').eq('branch_id', branchId)
    if (yearErr) throw yearErr
    const yearIds = years.map((y) => y.id)
    if (!yearIds.length) return []

    const { data: sems, error: semErr } = await supabase.from('semesters').select('id').in('year_id', yearIds)
    if (semErr) throw semErr
    semesterIds = sems.map((s) => s.id)
  }

  if (semesterIds && semesterIds.length === 0) return []

  let query = supabase
    .from('subjects')
    .select(
      `id, name, code, slug, semester_id, google_drive_url,
       semester:semesters(id, name, slug, year:years(id, name, slug, branch:branches(id, name, slug)))`
    )
    .order('order_index', { ascending: true })

  if (semesterIds) query = query.in('semester_id', semesterIds)
  if (search) query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createSubject({ semesterId, name, code, slug, orderIndex = 0, googleDriveUrl }) {
  const { data, error } = await supabase
    .from('subjects')
    .insert({
      semester_id: semesterId,
      name,
      code,
      slug,
      order_index: orderIndex,
      google_drive_url: googleDriveUrl || null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateSubject(id, fields) {
  const { data, error } = await supabase.from('subjects').update(fields).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteSubject(id) {
  const { error } = await supabase.from('subjects').delete().eq('id', id)
  if (error) throw error
}
