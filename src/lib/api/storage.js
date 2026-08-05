import { supabase } from '@/lib/supabaseClient'

const RESOURCE_BUCKET = 'resource-files'
const SYLLABUS_BUCKET = 'syllabi'

/** Uploads into the caller's own folder: {userId}/{uuid}-{filename} — matches the storage RLS policy. */
export async function uploadResourceFile(file, userId) {
  const path = `${userId}/${crypto.randomUUID()}-${file.name}`
  const { error } = await supabase.storage.from(RESOURCE_BUCKET).upload(path, file)
  if (error) throw error
  return { path, name: file.name, size: file.size }
}

export async function deleteResourceFile(path) {
  const { error } = await supabase.storage.from(RESOURCE_BUCKET).remove([path])
  if (error) throw error
}

/** Bucket is private, so downloads need a short-lived signed URL. */
export async function getResourceDownloadUrl(path) {
  const { data, error } = await supabase.storage.from(RESOURCE_BUCKET).createSignedUrl(path, 3600)
  if (error) throw error
  return data.signedUrl
}

/** syllabi bucket is public — plain public URL, no signing needed. */
export async function uploadSyllabusFile(file, yearId) {
  const path = `${yearId}/${crypto.randomUUID()}-${file.name}`
  const { error } = await supabase.storage.from(SYLLABUS_BUCKET).upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from(SYLLABUS_BUCKET).getPublicUrl(path)
  return { publicUrl: data.publicUrl, fileName: file.name }
}
