import { supabase } from '../supabase'

export async function fetchInventoryItems(filters = {}) {
  let q = supabase
    .from('inventory_items')
    .select('*')
    .order('created_at', { ascending: false })
  if (filters.department) q = q.eq('department', filters.department)
  if (filters.asset_user != null) {
    if (filters.asset_user === '(Unassigned)') {
      q = q.or('asset_user.is.null,asset_user.eq.')
    } else {
      q = q.eq('asset_user', filters.asset_user)
    }
  }
  const { data, error } = await q
  if (error) throw error
  return data ?? []
}

export async function createInventoryItem(item) {
  const { data, error } = await supabase
    .from('inventory_items')
    .insert([item])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateInventoryItem(id, updates) {
  const { data, error } = await supabase
    .from('inventory_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteInventoryItem(id) {
  const { error } = await supabase.from('inventory_items').delete().eq('id', id)
  if (error) throw error
}
