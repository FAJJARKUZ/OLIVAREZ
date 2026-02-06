import { useState, useEffect } from 'react'
import { Card, CardTitle } from '../../components/ui/Card'
import { supabase } from '../../lib/supabase'

export function FinancingPage() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const { data: items } = await supabase.from('inventory_items').select('quantity, name')
        const totalItems = items?.length ?? 0
        const totalQty = items?.reduce((s, i) => s + (Number(i.quantity) || 0), 0) ?? 0
        setSummary({ totalItems, totalQty })
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-800">Financing</h1>
      <p className="text-neutral-500">Inventory-related financial summaries.</p>

      {error && (
        <div className="rounded-xl bg-red-50 text-red-600 p-4 text-sm">{error}</div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardTitle>Inventory summary</CardTitle>
          {loading ? (
            <p className="text-neutral-500">Loading...</p>
          ) : summary ? (
            <ul className="text-sm text-neutral-600 space-y-2">
              <li>Total item types: {summary.totalItems}</li>
              <li>Total quantity (units): {summary.totalQty}</li>
            </ul>
          ) : (
            <p className="text-neutral-500">No data.</p>
          )}
        </Card>
        <Card>
          <CardTitle>Notes</CardTitle>
          <p className="text-sm text-neutral-600">
            Financial details can be extended with cost per item, department budgets, and purchase orders linked to Supabase.
          </p>
        </Card>
      </div>
    </div>
  )
}
