import { useState, useEffect } from 'react'
import { Card, CardTitle } from '../../components/ui/Card'
import * as trackingApi from '../../lib/api/tracking'

export function TrackingPage() {
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    trackingApi
      .fetchMovements()
      .then((data) => {
        if (!cancelled) setMovements(data)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-800">Tracking</h1>
      <p className="text-neutral-500">Inventory movement and history.</p>

      {error && (
        <div className="rounded-xl bg-red-50 text-red-600 p-4 text-sm">{error}</div>
      )}

      <Card>
        <CardTitle>Movement history</CardTitle>
        {loading ? (
          <p className="text-neutral-500">Loading...</p>
        ) : movements.length === 0 ? (
          <p className="text-neutral-500">No movements recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-neutral-600">
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Item</th>
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 pr-4">Quantity</th>
                  <th className="pb-3 pr-4">Notes</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id} className="border-b border-neutral-100">
                    <td className="py-3 pr-4">
                      {m.created_at ? new Date(m.created_at).toLocaleString() : '—'}
                    </td>
                    <td className="py-3 pr-4">
                      {m.inventory_items?.name ?? m.item_id ?? '—'}
                    </td>
                    <td className="py-3 pr-4">{m.movement_type ?? '—'}</td>
                    <td className="py-3 pr-4">{m.quantity ?? '—'}</td>
                    <td className="py-3 pr-4">{m.notes ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
