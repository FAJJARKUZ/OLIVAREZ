import { useState, useEffect } from 'react'
import * as trackingApi from '../../lib/api/tracking'
import { Card, CardTitle } from '../../components/ui/Card'

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
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-school-700 mb-2">Asset Tracking</h1>
          <p className="text-gray-600">Total movements logged: <span className="font-semibold text-school-600">{movements.length}</span></p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm">
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}

        <Card>
          {loading ? (
            <div className="p-6 text-center text-gray-500">
              <p>Loading movement history...</p>
            </div>
          ) : movements.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No movement history available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-school-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-semibold text-school-700">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-school-700">Item</th>
                    <th className="px-4 py-3 text-left font-semibold text-school-700">Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-school-700">Quantity</th>
                    <th className="px-4 py-3 text-left font-semibold text-school-700">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                    <tr key={m.id} className="border-b border-gray-200 hover:bg-school-50 transition-colors">
                      <td className="px-4 py-3 text-gray-600">
                        {m.created_at ? new Date(m.created_at).toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-school-700 font-medium">{m.inventory_items?.name ?? m.item_id ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-700">{m.movement_type ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-700">{m.quantity ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{m.notes ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
