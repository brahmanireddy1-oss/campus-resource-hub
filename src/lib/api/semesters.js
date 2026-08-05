import { supabase } from '@/lib/supabaseClient'

export async function getSemestersByYearId(yearId) {
  const { data, error } = await supabase
    .from('semesters')
    .select('id, name, slug, year_id, subjects(count)')
    .eq('year_id', yearId)
    .order('order_index', { ascending: true })
  if (error) throw error
  return data.map((s) => ({ ...s, subjectCount: s.subjects?.[0]?.count ?? 0 }))
}

export async function getSemesterBySlug(yearId, slug) {
  const { data, error } = await supabase
    .from('semesters')
    .select('id, name, slug, year_id')
    .eq('year_id', yearId)
    .eq('slug', slug)
    .single()
  if (error) throw error
  return data
}

export async function createSemester({ yearId, name, slug, orderIndex = 0 }) {
  const { data, error } = await supabase
    .from('semesters')
    .insert({ year_id: yearId, name, slug, order_index: orderIndex })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateSemester(id, fields) {
  const { data, error } = await supabase.from('semesters').update(fields).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteSemester(id) {
  const { error } = await supabase.from('semesters').delete().eq('id', id)
  if (error) throw error
}
