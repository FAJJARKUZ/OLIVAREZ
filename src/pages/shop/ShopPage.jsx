import { useEffect, useState } from 'react'
import { Card, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import * as stocksApi from '../../lib/api/stocks'
import { useAuth } from '../../contexts/AuthContext'

export function ShopPage() {
  const { role } = useAuth()

  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [recentRequests, setRecentRequests] = useState([])

  useEffect(() => {
    async function loadRecent() {
      try {
        const data = await stocksApi.fetchStockRequests()
        setRecentRequests((data ?? []).slice(0, 6))
      } catch {
        // non-blocking
      }
    }
    loadRecent()
  }, [])

  async function handleRequest() {
    setError('')
    setSuccess('')
    if (!itemName.trim()) {
      setError('Item name is required.')
      return
    }
    if (!Number.isFinite(Number(quantity)) || Number(quantity) <= 0) {
      setError('Quantity must be a positive number.')
      return
    }

    setLoading(true)
    try {
      await stocksApi.createStockRequest({
        item_name: itemName.trim(),
        quantity: Math.floor(Number(quantity)),
        availability: 'pending',
      })
      setSuccess('Request submitted to supplier.')
      setItemName('')
      setQuantity(1)

      // Refresh recent list
      const data = await stocksApi.fetchStockRequests()
      setRecentRequests((data ?? []).slice(0, 6))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-school-700">Shop</h1>
          <p className="text-gray-600 text-sm mt-1">Request equipment for the supplier.</p>
        </div>
        <div className="text-xs text-gray-500">{role === 'ADMIN' ? 'Administrator' : ''}</div>
      </div>

      {error && <div className="rounded-xl bg-red-50 text-red-600 p-4 text-sm">{error}</div>}
      {success && <div className="rounded-xl bg-green-50 text-green-700 p-4 text-sm">{success}</div>}

      <Card>
        <CardTitle>New equipment request</CardTitle>
        <div className="space-y-4">
          <Input label="Item name" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="e.g. Mouse" />
          <Input
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min={1}
          />
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleRequest} disabled={loading}>
            {loading ? 'Submitting...' : 'Request'}
          </Button>
        </div>
      </Card>

      <Card>
        <CardTitle>Recent requests</CardTitle>
        {recentRequests.length === 0 ? (
          <p className="text-gray-600">No requests yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-600">
                  <th className="pb-3 pr-4">Item</th>
                  <th className="pb-3 pr-4">Quantity</th>
                  <th className="pb-3 pr-4">Availability</th>
                  <th className="pb-3 pr-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100">
                    <td className="py-3 pr-4">{r.item_name ?? '—'}</td>
                    <td className="py-3 pr-4">{r.quantity ?? '—'}</td>
                    <td className="py-3 pr-4">{r.availability ?? 'pending'}</td>
                    <td className="py-3 pr-4">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</td>
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

