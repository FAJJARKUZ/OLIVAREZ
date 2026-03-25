import { supabase } from '../supabase'

export async function fetchClearances(filters = {}) {
  let q = supabase
    .from('clearances')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters.status) {
    if (Array.isArray(filters.status)) {
      q = q.in('status', filters.status)
    } else {
      q = q.eq('status', filters.status)
    }
  }

  if (filters.target_role) q = q.eq('target_role', filters.target_role)

  const { data, error } = await q
  if (error) throw error
  return data ?? []
}

export async function createClearance(clearance) {
  const { data, error } = await supabase
    .from('clearances')
    .insert([clearance])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateClearanceStatus(id, status, notes = '') {
  const { data, error } = await supabase
    .from('clearances')
    .update({ status, reviewed_notes: notes, reviewed_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function uploadClearanceDocument(id, file) {
  const path = `clearance-docs/${id}/${file.name}`
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(path, file, { upsert: true })
  if (uploadError) throw uploadError
  const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path)
  await supabase
    .from('clearances')
    .update({ document_url: urlData.publicUrl })
    .eq('id', id)
}
