import { supabase } from '../supabase'

export async function fetchStockRequests() {
  const { data, error } = await supabase
    .from('stock_requests')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchRestockList() {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .or('quantity.lte(5),quantity.is.null')
    .order('quantity', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function updateItemAvailability(itemId, available) {
  const { data, error } = await supabase
    .from('stock_requests')
    .update({ availability: available })
    .eq('id', itemId)
    .select()
    .single()
  if (error) throw error
  return data
}
