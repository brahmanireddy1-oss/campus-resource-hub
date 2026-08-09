import { supabase } from '@/lib/supabaseClient'
import { deleteResourceFile } from './storage'

const ADMIN_SELECT = `
  id, title, description, file_path, file_name, file_size, created_at, status, rejection_reason,
  resource_type:resource_types(id, name),
  uploader:profiles(id, full_name, email),
  subject:subjects(id, name, semester_id)
`

export async function getAdminStats() {
  const [{ count: total }, { count: pending }, { count: approved }, { count: rejected }, { data: uploaders }] =
    await Promise.all([
      supabase.from('resources').select('*', { count: 'exact', head: true }),
      supabase.from('resources').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('resources').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('resources').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
      supabase.from('resources').select('uploaded_by'),
    ])

  const contributors = new Set((uploaders || []).map((r) => r.uploaded_by)).size

  return { total: total ?? 0, pending: pending ?? 0, approved: approved ?? 0, rejected: rejected ?? 0, contributors }
}

export async function getAllResourcesAdmin({ status, search } = {}) {
  let query = supabase.from('resources').select(ADMIN_SELECT).order('created_at', { ascending: false })
  if (status) query = query.eq('status', status)
  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function approveResource(id) {
  const { error } = await supabase
    .from('resources')
    .update({ status: 'approved', rejection_reason: null })
    .eq('id', id)
  if (error) throw error
}

export async function rejectResource(id, reason) {
  const { error } = await supabase
    .from('resources')
    .update({ status: 'rejected', rejection_reason: reason || null })
    .eq('id', id)
  if (error) throw error
}

export async function updateResourceDetails(id, fields) {
  const { data, error } = await supabase.from('resources').update(fields).eq('id', id).select(ADMIN_SELECT).single()
  if (error) throw error
  return data
}

export async function deleteResourceAdmin(id, filePath) {
  const { error } = await supabase.from('resources').delete().eq('id', id)
  if (error) throw error
  if (filePath) await deleteResourceFile(filePath).catch(() => {})
}
