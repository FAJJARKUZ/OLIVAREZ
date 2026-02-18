import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardTitle } from '../../components/ui/Card'
import * as stocksApi from '../../lib/api/stocks'
import * as inventoryApi from '../../lib/api/inventory'

export function StocksPage() {
  const { role } = useAuth()
  const isSupplier = role === 'SUPPLIER'

  const [requests, setRequests] = useState([])
  const [restockList, setRestockList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [reqs, restock] = await Promise.all([
        stocksApi.fetchStockRequests().catch(() => []),
        role === 'ADMIN' ? stocksApi.fetchRestockList() : Promise.resolve([]),
      ])
      setRequests(reqs)
      setRestockList(restock)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [role])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-school-700">Stocks</h1>
      <p className="text-gray-600">
        {isSupplier ? 'View supply requests and update availability.' : 'Monitor stock levels and IT consumable restock list.'}
      </p>

      {error && (
        <div className="rounded-xl bg-red-50 text-red-600 p-4 text-sm">{error}</div>
      )}

      {role === 'ADMIN' && (
        <Card>
          <CardTitle>IT consumable restock list (low stock ≤5)</CardTitle>
          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : restockList.length === 0 ? (
            <p className="text-gray-600">No low-stock items.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-600">
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">Department</th>
                    <th className="pb-3 pr-4">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {restockList.map((r) => (
                    <tr key={r.id} className="border-b border-gray-100">
                      <td className="py-3 pr-4">{r.name}</td>
                      <td className="py-3 pr-4">{r.department ?? '—'}</td>
                      <td className="py-3 pr-4">{r.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      <Card>
        <CardTitle>Supply requests</CardTitle>
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : requests.length === 0 ? (
          <p className="text-gray-600">No supply requests.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-600">
                  <th className="pb-3 pr-4">Item</th>
                  <th className="pb-3 pr-4">Quantity</th>
                  <th className="pb-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100">
                    <td className="py-3 pr-4">{r.item_name ?? r.id}</td>
                    <td className="py-3 pr-4">{r.quantity ?? '—'}</td>
                    <td className="py-3 pr-4">{r.availability ?? '—'}</td>
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
