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
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError) throw authError
  if (!user?.id) throw new Error('You must be signed in to submit a clearance.')

  const { data, error } = await supabase
    .from('clearances')
    .insert([{ ...clearance, user_id: user.id }])
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
  const safeName = `${Date.now()}-${file.name}`.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `clearance-docs/${id}/${safeName}`
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(path, file, { upsert: true })
  if (uploadError) throw uploadError
  const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path)
  const { error: updateError } = await supabase
    .from('clearances')
    .update({ document_url: urlData.publicUrl })
    .eq('id', id)
  if (updateError) throw updateError
}

export async function deleteClearance(id) {
  const { error } = await supabase.from('clearances').delete().eq('id', id)
  if (error) throw error
}
