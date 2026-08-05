import { supabase } from '@/lib/supabaseClient'

export async function getBranches() {
  const { data, error } = await supabase
    .from('branches')
    .select('id, name, slug, years(count)')
    .order('order_index', { ascending: true })
  if (error) throw error
  return data.map((b) => ({ ...b, yearCount: b.years?.[0]?.count ?? 0 }))
}

export async function getBranchBySlug(slug) {
  const { data, error } = await supabase.from('branches').select('id, name, slug').eq('slug', slug).single()
  if (error) throw error
  return data
}

export async function createBranch({ name, slug, orderIndex = 0 }) {
  const { data, error } = await supabase
    .from('branches')
    .insert({ name, slug, order_index: orderIndex })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateBranch(id, fields) {
  const { data, error } = await supabase.from('branches').update(fields).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteBranch(id) {
  const { error } = await supabase.from('branches').delete().eq('id', id)
  if (error) throw error
}
