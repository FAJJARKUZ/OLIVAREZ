import { supabase } from '../supabase'

export async function fetchDeployments() {
  const { data, error } = await supabase
    .from('deployments')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createDeployment(deployment) {
  const { data, error } = await supabase
    .from('deployments')
    .insert([deployment])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateDeployment(id, updates) {
  const { data, error } = await supabase
    .from('deployments')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function uploadDeploymentLetter(id, file) {
  const path = `deployment-letters/${id}/${file.name}`
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(path, file, { upsert: true })
  if (uploadError) throw uploadError
  const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path)
  await supabase
    .from('deployments')
    .update({ letter_url: urlData.publicUrl })
    .eq('id', id)
}

export async function deleteDeployment(id) {
  const { error } = await supabase.from('deployments').delete().eq('id', id)
  if (error) throw error
}
