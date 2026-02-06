import { supabase } from '../supabase'

export async function fetchMovements(limit = 100) {
  const { data, error } = await supabase
    .from('inventory_movements')
    .select('*, inventory_items(name)')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export async function createMovement(movement) {
  const { data, error } = await supabase
    .from('inventory_movements')
    .insert([movement])
    .select()
    .single()
  if (error) throw error
  return data
}
