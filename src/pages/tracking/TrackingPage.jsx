import { useState, useEffect, useCallback } from 'react'
import * as trackingApi from '../../lib/api/tracking'
import * as inventoryApi from '../../lib/api/inventory'
import { Card, CardTitle } from '../../components/ui/Card'

export function TrackingPage() {
  const [movements, setMovements] = useState([])
  const [assetUsers, setAssetUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [assetUsersLoading, setAssetUsersLoading] = useState(true)
  const [error, setError] = useState('')
  const [editModal, setEditModal] = useState(null) // { asset_user, quantity, ids }
  const [editQuantity, setEditQuantity] = useState(0)

  const loadMovements = useCallback(() => {
    setLoading(true)
    trackingApi
      .fetchMovements()
      .then(setMovements)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const loadAssetUsers = useCallback(() => {
    setAssetUsersLoading(true)
    trackingApi
      .fetchAssetUsersSummary()
      .then(setAssetUsers)
      .catch((e) => setError(e.message))
      .finally(() => setAssetUsersLoading(false))
  }, [])

  useEffect(() => {
    let cancelled = false
    loadMovements()
    return () => { cancelled = true }
  }, [loadMovements])

  useEffect(() => {
    loadAssetUsers()
  }, [loadAssetUsers])

  function openEdit(row) {
    setEditModal(row)
    setEditQuantity(row.quantity)
  }

  function closeEdit() {
    setEditModal(null)
  }

  async function handleRemove(asset_user) {
    if (!confirm(`Remove all assets assigned to "${asset_user}"? This cannot be undone.`)) return
    setError('')
    try {
      const items = await inventoryApi.fetchInventoryItems({ asset_user })
      for (const item of items) {
        await inventoryApi.deleteInventoryItem(item.id)
      }
      loadAssetUsers()
      loadMovements()
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleSaveQuantity() {
    if (!editModal || editQuantity < 0) return
    const delta = editQuantity - editModal.quantity
    if (delta === 0) {
      closeEdit()
      return
    }
    setError('')
    try {
      const items = await inventoryApi.fetchInventoryItems({ asset_user: editModal.asset_user })
      if (delta > 0) {
        for (let i = 0; i < delta; i++) {
          await inventoryApi.createInventoryItem({
            department: items[0]?.department ?? 'GENERAL',
            asset_user: editModal.asset_user === '(Unassigned)' ? '' : editModal.asset_user,
          })
        }
      } else {
        const toDelete = items.slice(0, -delta)
        for (const item of toDelete) {
          await inventoryApi.deleteInventoryItem(item.id)
        }
      }
      loadAssetUsers()
      loadMovements()
      closeEdit()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-school-700 mb-2">Asset Tracking</h1>
          <p className="text-gray-600">Assets by user from inventory • Movement history below</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm">
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}

        {/* Asset Users table (from ASSET_USER in inventory) */}
        <Card className="mb-6">
          <CardTitle>Assets by User (ASSET_USER)</CardTitle>
          {assetUsersLoading ? (
            <div className="p-6 text-center text-gray-500">Loading assets...</div>
          ) : assetUsers.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No asset users in inventory</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-school-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-semibold text-school-700">Asset User</th>
                    <th className="px-4 py-3 text-left font-semibold text-school-700">Quantity</th>
                    <th className="px-4 py-3 text-left font-semibold text-school-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assetUsers.map((row) => (
                    <tr key={row.asset_user} className="border-b border-gray-200 hover:bg-school-50 transition-colors">
                      <td className="px-4 py-3 text-school-700 font-medium">{row.asset_user}</td>
                      <td className="px-4 py-3 text-gray-700">{row.quantity}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <button
                          onClick={() => openEdit(row)}
                          className="px-3 py-1.5 bg-school-600 hover:bg-school-700 text-white rounded text-xs transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleRemove(row.asset_user)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Movement history */}
        <Card>
          <CardTitle>Movement History</CardTitle>
          <p className="text-gray-500 text-sm mb-4">Total movements: {movements.length}</p>
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading movement history...</div>
          ) : movements.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No movement history available</div>
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
                      <td className="px-4 py-3 text-school-700 font-medium">{m.asset_user ?? m.item_id ?? '—'}</td>
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

      {/* Edit quantity modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Quantity</h3>
            <p className="text-sm text-gray-600 mb-2">Asset User: <span className="font-medium text-school-700">{editModal.asset_user}</span></p>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <input
              type="number"
              min={0}
              value={editQuantity}
              onChange={(e) => setEditQuantity(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={closeEdit}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQuantity}
                className="px-4 py-2 bg-school-600 hover:bg-school-700 text-white rounded text-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
