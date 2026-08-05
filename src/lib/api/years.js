import { supabase } from '@/lib/supabaseClient'

/** Pass { branchId } to scope to one branch (used everywhere except admin
 * management, which lists years per selected branch the same way). */
export async function getYears({ branchId } = {}) {
  let query = supabase
    .from('years')
    .select('id, name, slug, branch_id, syllabus_url, syllabus_file_name, semesters(count)')
    .order('order_index', { ascending: true })
  if (branchId) query = query.eq('branch_id', branchId)
  const { data, error } = await query
  if (error) throw error
  return data.map((y) => ({ ...y, semesterCount: y.semesters?.[0]?.count ?? 0 }))
}

/** Slugs are unique per branch, so both are required. Includes the parent
 * branch so callers (Semester/Subject pages) can build breadcrumbs without
 * a second fetch. */
export async function getYearBySlug(branchId, slug) {
  const { data, error } = await supabase
    .from('years')
    .select('id, name, slug, branch_id, syllabus_url, syllabus_file_name, branch:branches(id, name, slug)')
    .eq('branch_id', branchId)
    .eq('slug', slug)
    .single()
  if (error) throw error
  return data
}

export async function createYear({ branchId, name, slug, orderIndex = 0 }) {
  const { data, error } = await supabase
    .from('years')
    .insert({ branch_id: branchId, name, slug, order_index: orderIndex })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateYear(id, fields) {
  const { data, error } = await supabase.from('years').update(fields).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteYear(id) {
  const { error } = await supabase.from('years').delete().eq('id', id)
  if (error) throw error
}
