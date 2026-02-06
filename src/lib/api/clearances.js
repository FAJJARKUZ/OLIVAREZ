import { supabase } from '../supabase'

export async function fetchClearances(filters = {}) {
  let q = supabase
    .from('clearances')
    .select('*')
    .order('created_at', { ascending: false })
  if (filters.status) q = q.eq('status', filters.status)
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
