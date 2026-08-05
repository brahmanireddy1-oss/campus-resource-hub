import { supabase } from '@/lib/supabaseClient'

export async function getSubjectsBySemesterId(semesterId) {
  const { data, error } = await supabase
    .from('subjects')
    .select('id, name, code, slug, semester_id')
    .eq('semester_id', semesterId)
    .order('order_index', { ascending: true })
  if (error) throw error
  return data
}

export async function getSubjectBySlug(semesterId, slug) {
  const { data, error } = await supabase
    .from('subjects')
    .select('id, name, code, slug, semester_id')
    .eq('semester_id', semesterId)
    .eq('slug', slug)
    .single()
  if (error) throw error
  return data
}

export async function getAllSubjects() {
  const { data, error } = await supabase
    .from('subjects')
    .select('id, name, semester_id')
    .order('order_index', { ascending: true })
  if (error) throw error
  return data
}

export async function createSubject({ semesterId, name, code, slug, orderIndex = 0 }) {
  const { data, error } = await supabase
    .from('subjects')
    .insert({ semester_id: semesterId, name, code, slug, order_index: orderIndex })
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
