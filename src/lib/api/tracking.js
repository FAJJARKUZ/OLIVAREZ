import { supabase } from '../supabase'

export async function fetchMovements(limit = 100) {
  const { data: movements, error: movementsError } = await supabase
    .from('inventory_movements')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (movementsError) throw movementsError
  const items = movements ?? []
  if (items.length === 0) return []
  const itemIds = [...new Set(items.map((m) => m.item_id).filter(Boolean))]
  let map = {}
  if (itemIds.length > 0) {
    const { data: invItems } = await supabase
      .from('inventory_items')
      .select('id, asset_user')
      .in('id', itemIds)
    map = Object.fromEntries((invItems ?? []).map((i) => [i.id, i.asset_user]))
  }
  return items.map((m) => ({ ...m, asset_user: map[m.item_id] ?? null }))
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

export async function fetchAssetUsersSummary() {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('id, asset_user, mouse, keyboard, mac_address, processor, motherboard, ram, hard_drive, graphic_card, operating_system, os_licenses, color_of_case, power_supply, location, dop')
  if (error) throw error
  const items = data ?? []
  const peripheralFields = [
    'mouse', 'keyboard', 'mac_address', 'processor', 'motherboard', 'ram',
    'hard_drive', 'graphic_card', 'operating_system', 'os_licenses',
    'color_of_case', 'power_supply', 'location', 'dop'
  ]
  const byUser = {}
  for (const item of items) {
    const user = item.asset_user?.trim() || '(Unassigned)'
    if (!byUser[user]) byUser[user] = { asset_user: user, quantity: 0, ids: [] }
    const filledCount = peripheralFields.filter((field) => {
      const value = item[field]
      return value != null && String(value).trim() !== ''
    }).length
    byUser[user].quantity += filledCount
    byUser[user].ids.push(item.id)
  }
  return Object.values(byUser).sort((a, b) => a.asset_user.localeCompare(b.asset_user))
}
