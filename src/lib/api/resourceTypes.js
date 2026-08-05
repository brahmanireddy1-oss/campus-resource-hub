import { supabase } from '@/lib/supabaseClient'

export async function getResourceTypes() {
  const { data, error } = await supabase
    .from('resource_types')
    .select('id, name, slug')
    .order('order_index', { ascending: true })
  if (error) throw error
  return data
}

export async function createResourceType({ name, slug, orderIndex = 0 }) {
  const { data, error } = await supabase
    .from('resource_types')
    .insert({ name, slug, order_index: orderIndex })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateResourceType(id, fields) {
  const { data, error } = await supabase
    .from('resource_types')
    .update(fields)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteResourceType(id) {
  const { error } = await supabase.from('resource_types').delete().eq('id', id)
  if (error) throw error
}
