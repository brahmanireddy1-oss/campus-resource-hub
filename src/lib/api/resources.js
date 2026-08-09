import { supabase } from '@/lib/supabaseClient'
import { uploadResourceFile, deleteResourceFile } from './storage'

const PUBLIC_SELECT = `
  id, title, description, file_path, file_name, file_size, created_at, status, rejection_reason,
  resource_type:resource_types(id, name),
  uploader:profiles(id, full_name, email),
  subject:subjects(id, name, semester_id)
`

/** Resolves Branch/Year/Semester filters down to a list of subject ids,
 * since `resources` only has a direct FK to `subjects`. Returns null = no filter. */
async function resolveSubjectIds({ branchId, yearId, semesterId, subjectId }) {
  if (subjectId) return [subjectId]

  if (semesterId) {
    const { data, error } = await supabase.from('subjects').select('id').eq('semester_id', semesterId)
    if (error) throw error
    return data.map((s) => s.id)
  }

  if (yearId) {
    const { data: semesters, error: semErr } = await supabase
      .from('semesters')
      .select('id')
      .eq('year_id', yearId)
    if (semErr) throw semErr
    const semesterIds = semesters.map((s) => s.id)
    if (!semesterIds.length) return []

    const { data: subjects, error: subErr } = await supabase
      .from('subjects')
      .select('id')
      .in('semester_id', semesterIds)
    if (subErr) throw subErr
    return subjects.map((s) => s.id)
  }

  if (branchId) {
    const { data: years, error: yearErr } = await supabase.from('years').select('id').eq('branch_id', branchId)
    if (yearErr) throw yearErr
    const yearIds = years.map((y) => y.id)
    if (!yearIds.length) return []

    const { data: semesters, error: semErr } = await supabase
      .from('semesters')
      .select('id')
      .in('year_id', yearIds)
    if (semErr) throw semErr
    const semesterIds = semesters.map((s) => s.id)
    if (!semesterIds.length) return []

    const { data: subjects, error: subErr } = await supabase
      .from('subjects')
      .select('id')
      .in('semester_id', semesterIds)
    if (subErr) throw subErr
    return subjects.map((s) => s.id)
  }

  return null
}

export async function getApprovedResources({ search, branchId, yearId, semesterId, subjectId, typeId } = {}) {
  const subjectIds = await resolveSubjectIds({ branchId, yearId, semesterId, subjectId })
  if (subjectIds && subjectIds.length === 0) return []

  let query = supabase
    .from('resources')
    .select(PUBLIC_SELECT)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (subjectIds) query = query.in('subject_id', subjectIds)
  if (typeId) query = query.eq('resource_type_id', typeId)
  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getSubjectResources(subjectId) {
  const { data, error } = await supabase
    .from('resources')
    .select(PUBLIC_SELECT)
    .eq('subject_id', subjectId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

/** A student's own submissions, any status — RLS already scopes this to
 * the caller, but we still filter explicitly for clarity/safety. */
export async function getMySubmissions(userId) {
  const { data, error } = await supabase
    .from('resources')
    .select(PUBLIC_SELECT)
    .eq('uploaded_by', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

/** Used by both the student Submit form and the admin "Upload Resource"
 * modal — the DB trigger decides pending vs. approved based on role. */
export async function createResource({ subjectId, resourceTypeId, title, description, file, userId }) {
  const uploaded = await uploadResourceFile(file, userId)
  const { data, error } = await supabase
    .from('resources')
    .insert({
      subject_id: subjectId,
      resource_type_id: resourceTypeId,
      title,
      description,
      file_path: uploaded.path,
      file_name: uploaded.name,
      file_size: uploaded.size,
      uploaded_by: userId,
    })
    .select(PUBLIC_SELECT)
    .single()

  if (error) {
    // Roll back the uploaded file if the DB insert failed
    await deleteResourceFile(uploaded.path).catch(() => {})
    throw error
  }
  return data
}
