import { supabase } from '../supabase'

export async function fetchInventoryReport() {
  const { data, error } = await supabase.from('inventory_items').select('*')
  if (error) throw error
  return data ?? []
}

export async function fetchClearanceReport() {
  const { data, error } = await supabase
    .from('clearances')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchDeploymentReport() {
  const { data, error } = await supabase.from('deployments').select('*')
  if (error) throw error
  return data ?? []
}

export function exportToCSV(rows, columns) {
  const headers = columns.map((c) => (typeof c === 'string' ? c : c.key)).join(',')
  const lines = rows.map((row) =>
    columns
      .map((c) => {
        const key = typeof c === 'string' ? c : c.key
        const val = row[key]
        const str = val == null ? '' : String(val)
        return str.includes(',') ? `"${str.replace(/"/g, '""')}"` : str
      })
      .join(',')
  )
  return [headers, ...lines].join('\n')
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
