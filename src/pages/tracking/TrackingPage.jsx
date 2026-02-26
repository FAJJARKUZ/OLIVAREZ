import { useState, useEffect, useCallback } from 'react'
import * as trackingApi from '../../lib/api/tracking'
import * as inventoryApi from '../../lib/api/inventory'
import { Card, CardTitle } from '../../components/ui/Card'

const DEPARTMENTS = [
  'FINANCE DEPARTMENT',
  'ACCOUNTING DEPARTMENT',
  'REGISTRAR DEPARTMENT',
  'HR DEPARTMENT',
  'CLINIC DEPARTMENT',
  'VFAS DEPARTMENT',
  'ORC / SPORTSCENTER DEPARTMENT',
  'MARKETING / LINKAGES DEPARTMENT',
  'OLIVARIAN ECHO OFFICE',
  'QUALITY ASSURANCE DEPARTMENT',
  'SECURITY DEPARTMENT',
  'NURSING DEPARTMENT',
  'PT / RT DEPARTMENT',
  'MASSCOM / PSYCHOLOGY DEPARTMENT',
  'CRIMINOLOGY AND DPA DEPARTMENT',
  'TESDA DEPARTMENT',
  'THRM DEPARTMENT',
  'EDUC DEPARTMENT',
  'OSA / SSG DEPARTMENT',
  'GRADUATE SCHOOL DEPARTMENT',
  'BUSINESS / ACCOUNTANCY / CUSTOM DEPARTMENT',
  'LABORATORY CUSTODIAN',
  'RESEARCH',
  'GUIDANCE DEPARTMENT',
  'CARE GIVING',
  'PE DEPARTMENT',
  'CORNER STORE',
  'AURELIOS PRINTING PRESS DEPARTMENT',
  'PEAC OFFICE',
  'CANTEEN',
  'IMS',
  'EXECUTIVE DEAN OFFICE',
  'PROPERTY CUSTODIAN / MOTOR POOL',
  'BOOKSTORE / SUPPLIES',
]

const ASSET_COLUMNS = [
  'ASSET_USER',
  'MOUSE',
  'KEYBOARD',
  'MAC ADDRESS',
  'PROCESSOR',
  'MOTHERBOARD',
  'RAM',
  'HARD DRIVE',
  'GRAPHIC CARD',
  'OPERATING SYSTEM',
  'OS LICENSES',
  'COLOR OF CASE',
  'POWER SUPPLY',
  'LOCATION',
  'DOP',
  'REMARKS',
]

export function TrackingPage() {
  const [movements, setMovements] = useState([])
  const [assetUsers, setAssetUsers] = useState([])
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [assetUsersLoading, setAssetUsersLoading] = useState(true)
  const [assetsLoading, setAssetsLoading] = useState(true)
  const [error, setError] = useState('')
  const [editModal, setEditModal] = useState(null) // { asset_user, quantity, ids }
  const [editQuantity, setEditQuantity] = useState(0)
  const [assetModal, setAssetModal] = useState(null) // 'add' | { id }
  const [form, setForm] = useState({})

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

  const loadAssets = useCallback(() => {
    setAssetsLoading(true)
    inventoryApi
      .fetchInventoryItems({})
      .then((data) => setAssets(data || []))
      .catch((e) => setError(e.message))
      .finally(() => setAssetsLoading(false))
  }, [])

  useEffect(() => {
    let cancelled = false
    loadMovements()
    return () => { cancelled = true }
  }, [loadMovements])

  useEffect(() => {
    loadAssetUsers()
  }, [loadAssetUsers])

  useEffect(() => {
    loadAssets()
  }, [loadAssets])

  function openAddAsset() {
    const newForm = { department: DEPARTMENTS[0] }
    ASSET_COLUMNS.forEach((col) => {
      newForm[col.toLowerCase().replace(/ /g, '_')] = ''
    })
    setForm(newForm)
    setAssetModal('add')
  }

  function openEditAsset(item) {
    setAssetModal({ id: item.id })
    const editForm = { department: item.department ?? DEPARTMENTS[0] }
    ASSET_COLUMNS.forEach((col) => {
      const key = col.toLowerCase().replace(/ /g, '_')
      editForm[key] = item[key] ?? ''
    })
    setForm(editForm)
  }

  function openEdit(row) {
    setEditModal(row)
    setEditQuantity(row.quantity)
  }

  function closeEdit() {
    setEditModal(null)
  }

  async function handleSaveAsset() {
    setError('')
    try {
      const payload = {
        department: form.department ?? DEPARTMENTS[0],
      }
      ASSET_COLUMNS.forEach((col) => {
        const key = col.toLowerCase().replace(/ /g, '_')
        payload[key] = form[key] ?? ''
      })
      if (assetModal === 'add') {
        const created = await inventoryApi.createInventoryItem(payload)
        setAssetModal(null)
        setAssets((prev) => [created, ...prev])
      } else if (assetModal?.id) {
        const updated = await inventoryApi.updateInventoryItem(assetModal.id, payload)
        setAssetModal(null)
        setAssets((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
      }
      loadAssetUsers()
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleDeleteAsset(id) {
    if (!confirm('Delete this asset?')) return
    setError('')
    try {
      await inventoryApi.deleteInventoryItem(id)
      setAssetModal(null)
      loadAssets()
      loadAssetUsers()
    } catch (e) {
      setError(e.message)
    }
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
      loadAssets()
      loadMovements()
    } catch (e) {
      setError(e.message)
    }
  }

  function printTracking() {
    try {
      const cols = ['DEPARTMENT', 'SERIAL #', ...ASSET_COLUMNS]
      const printContent = `
      <html>
        <head>
          <title>Asset Tracking</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #111827; }
            h1 { text-align: center; color: #16a34a; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f0fdf4; color: #166534; padding: 8px; text-align: left; border: 1px solid #e5e7eb; }
            td { padding: 8px; border: 1px solid #e5e7eb; color: #374151; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>Asset Tracking</h1>
          <table>
            <thead>
              <tr>${cols.map((col) => `<th>${col}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${assets
                .map(
                  (item) =>
                    `<tr>${cols.map((col) => {
                      const key = col === 'DEPARTMENT' ? 'department' : col === 'SERIAL #' ? 'serial_number' : col.toLowerCase().replace(/ /g, '_')
                      return `<td>${item[key] ?? '—'}</td>`
                    }).join('')}</tr>`
                )
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
      `
      const w = window.open('', '_blank')
      w.document.write(printContent)
      w.document.close()
      w.print()
    } catch (e) {
      alert('Unable to print: ' + e.message)
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
      loadAssets()
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

        {/* Assets List - full table with Add New Asset */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="mb-0">Assets List</CardTitle>
            <div className="flex gap-2">
              <button
                onClick={printTracking}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
              >
                Print
              </button>
              <button
                onClick={openAddAsset}
                className="px-4 py-2 bg-school-600 hover:bg-school-700 text-white rounded text-sm transition-colors"
              >
                + Add New Asset
              </button>
            </div>
          </div>
          {assetsLoading ? (
            <div className="p-6 text-center text-gray-500">Loading assets...</div>
          ) : assets.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No assets yet. Click &quot;Add New Asset&quot; to add one.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-school-50 border-b border-gray-200">
                    <th className="px-3 py-2 text-left font-semibold text-school-700 border-r border-gray-200">DEPARTMENT</th>
                    <th className="px-3 py-2 text-left font-semibold text-school-700 border-r border-gray-200">SERIAL #</th>
                    {ASSET_COLUMNS.map((col) => (
                      <th key={col} className="px-3 py-2 text-left font-semibold text-school-700 border-r border-gray-200">
                        {col}
                      </th>
                    ))}
                    <th className="px-3 py-2 text-left font-semibold text-school-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200 hover:bg-school-50 transition-colors">
                      <td className="px-3 py-2 text-gray-700 border-r border-gray-200">{item.department ?? '—'}</td>
                      <td className="px-3 py-2 text-gray-700 border-r border-gray-200">{item.serial_number ?? '—'}</td>
                      {ASSET_COLUMNS.map((col) => {
                        const key = col.toLowerCase().replace(/ /g, '_')
                        return (
                          <td key={key} className="px-3 py-2 text-gray-700 border-r border-gray-200">
                            {item[key] ?? '—'}
                          </td>
                        )
                      })}
                      <td className="px-3 py-2 flex gap-2">
                        <button
                          onClick={() => openEditAsset(item)}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAsset(item.id)}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

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

      {/* Add/Edit Asset modal */}
      {assetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
          <div className="bg-white border border-gray-200 rounded-lg shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {assetModal === 'add' ? 'Add New Asset' : 'Edit Asset'}
            </h2>
            <div className="space-y-3 grid grid-cols-2 gap-3 mb-6">
              <div>
                <label className="block text-xs text-gray-700 font-medium mb-2">DEPARTMENT</label>
                <select
                  value={form.department ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded focus:outline-none focus:border-school-500"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              {ASSET_COLUMNS.map((col) => {
                const key = col.toLowerCase().replace(/ /g, '_')
                return (
                  <div key={col}>
                    <label className="block text-xs text-gray-700 font-medium mb-2">{col}</label>
                    <input
                      type="text"
                      value={form[key] || ''}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      placeholder={col}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded focus:outline-none focus:border-school-500"
                    />
                  </div>
                )
              })}
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <button
                onClick={() => setAssetModal(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded text-sm"
              >
                Cancel
              </button>
              {assetModal?.id && (
                <button
                  onClick={() => handleDeleteAsset(assetModal.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                >
                  Delete
                </button>
              )}
              <button
                onClick={handleSaveAsset}
                className="px-4 py-2 bg-school-600 hover:bg-school-700 text-white rounded text-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

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
