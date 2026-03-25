import { useEffect, useMemo, useState } from 'react'
import { Card, CardTitle } from '../../components/ui/Card'
import { Select } from '../../components/ui/Select'
import * as stocksApi from '../../lib/api/stocks'
import { useAuth } from '../../contexts/AuthContext'

const AVAILABILITY_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'fulfilled', label: 'Fulfilled' },
  { value: 'available', label: 'Available' },
  { value: 'not available', label: 'Not available' },
]

export function OrdersPage() {
  const { role } = useAuth()
  const isSupplier = role === 'SUPPLIER'

  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const statusBadgeClass = useMemo(
    () => ({
      pending: 'bg-amber-100 text-amber-800',
      fulfilled: 'bg-green-100 text-green-800',
      available: 'bg-green-50 text-green-800',
      'not available': 'bg-red-100 text-red-800',
    }),
    [],
  )

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await stocksApi.fetchStockRequests()
      setRequests(data ?? [])
    } catch (e) {
      setError(e.message)
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleUpdateAvailability(id, availability) {
    setError('')
    setUpdatingId(id)
    try {
      await stocksApi.updateItemAvailability(id, availability)
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-school-700">Orders</h1>
          <p className="text-gray-600 text-sm mt-1">Requests made by Administrator.</p>
        </div>
        <div className="text-xs text-gray-500">{isSupplier ? 'Supplier view' : ''}</div>
      </div>

      {error && <div className="rounded-xl bg-red-50 text-red-600 p-4 text-sm">{error}</div>}

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : requests.length === 0 ? (
        <p className="text-gray-600">No admin requests yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((r) => (
            <Card key={r.id} className="overflow-hidden">
              <div className="p-5 flex flex-col gap-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900">{r.item_name ?? '—'}</div>
                  <div className="text-xs text-gray-500 mt-1">Quantity: {r.quantity ?? '—'}</div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
                      statusBadgeClass[r.availability] ?? 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {r.availability ?? 'pending'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                  </span>
                </div>

                <div className="mt-1">
                  <Select
                    label="Update availability"
                    value={r.availability ?? 'pending'}
                    onChange={(e) => handleUpdateAvailability(r.id, e.target.value)}
                    options={AVAILABILITY_OPTIONS}
                    disabled={!isSupplier || updatingId === r.id}
                  />
                </div>

                {updatingId === r.id && <div className="text-xs text-gray-500">Saving...</div>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

