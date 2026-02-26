import { useState, useEffect, useCallback } from 'react'
import * as inventoryApi from '../../lib/api/inventory'
import { BarcodeScanner } from '../../components/BarcodeScanner'

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

const SCANNABLE_FIELDS = [
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
]

export function InventoryPage() {
  const [activeDept, setActiveDept] = useState(DEPARTMENTS[0])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null) // 'add' | { id } | null
  const [form, setForm] = useState({})
  const [deptAction, setDeptAction] = useState(null) // department name or null
  const [deptItems, setDeptItems] = useState([])
  const [deptSelectedAssetId, setDeptSelectedAssetId] = useState(null)
  const [scanningField, setScanningField] = useState(null) // field key being scanned

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await inventoryApi.fetchInventoryItems({ department: activeDept })
      setItems(data || [])
    } catch (e) {
      setError(e.message)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [activeDept])

  useEffect(() => {
    load()
  }, [load])

  function openAdd() {
    const newForm = {}
    ASSET_COLUMNS.forEach((col) => {
      newForm[col.toLowerCase().replace(/ /g, '_')] = ''
    })
    setForm(newForm)
    setModal('add')
  }

  function openEdit(item) {
    setModal({ id: item.id })
    const editForm = {}
    ASSET_COLUMNS.forEach((col) => {
      const key = col.toLowerCase().replace(/ /g, '_')
      editForm[key] = item[key] ?? ''
    })
    setForm(editForm)
  }

  function handleScan(fieldKey) {
    return (value) => {
      setForm((f) => ({ ...f, [fieldKey]: value }))
      setScanningField(null)
    }
  }

  async function openDeptAction(dept) {
    setDeptAction(dept)
    try {
      const data = await inventoryApi.fetchInventoryItems({ department: dept })
      setDeptItems(data || [])
      setDeptSelectedAssetId(null)
    } catch (e) {
      setDeptItems([])
      alert('Unable to load department assets: ' + e.message)
    }
  }

  async function handleSave() {
    setError('')
    try {
      const payload = {
        department: activeDept,
      }
      ASSET_COLUMNS.forEach((col) => {
        const key = col.toLowerCase().replace(/ /g, '_')
        payload[key] = form[key] ?? ''
      })

      if (modal === 'add') {
        const created = await inventoryApi.createInventoryItem(payload)
        setModal(null)
        setItems((prev) => [created, ...prev])
      } else if (modal?.id) {
        const updated = await inventoryApi.updateInventoryItem(modal.id, payload)
        setModal(null)
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
      }
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this asset?')) return
    setError('')
    try {
      await inventoryApi.deleteInventoryItem(id)
      setModal(null)
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-school-600 font-bold text-lg">{ }</span>
            <h1 className="text-gray-900 text-xl font-semibold">Asset Inventory</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openAdd}
              className="px-4 py-2 bg-school-600 hover:bg-school-700 text-white rounded text-sm transition-all"
            >
              + Add Asset
            </button>

          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="p-6 max-w-7xl mx-auto">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-300 text-red-800 p-3 rounded text-sm">
            <span className="text-red-600 font-semibold">Error:</span> {error}
          </div>
        )}

        {/* Department Selector */}
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-3 font-medium">
            Select Department
          </div>
          <div className="flex flex-wrap gap-2">
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept}
                onClick={() => openDeptAction(dept)}
                className={`px-3 py-1 rounded text-xs transition-all ${
                  activeDept === dept
                    ? 'bg-gray-800 text-white border border-gray-800'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">Assets List</h2>
          </div>
          
          {loading ? (
            <div className="p-4 text-gray-500 text-sm">
              <span className="inline-block animate-spin">⟳</span> Loading...
            </div>
          ) : items.length === 0 ? (
            <div className="p-4 text-gray-500 text-sm">
              No assets found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200">
                    {ASSET_COLUMNS.map((col) => (
                      <th key={col} className="px-3 py-2 text-left text-gray-900 font-semibold border-r border-gray-200">
                        {col}
                      </th>
                    ))}
                    <th className="px-3 py-2 text-left text-gray-900 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                                          {items.map((item) => (
                                            <tr key={item.id} className="relative overflow-visible border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      {ASSET_COLUMNS.map((col) => {
                        const key = col.toLowerCase().replace(/ /g, '_')
                        const value = item[key] ?? '—'
                        return (
                          <td key={key} className="px-3 py-2 text-gray-700 border-r border-gray-200">
                            {value}
                          </td>
                        )
                      })}
                      <td className="px-3 py-2 text-center">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => openEdit(item)}
                            aria-label="Edit asset"
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors font-medium"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6L20 8l-6 6M7 17h10" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            aria-label="Delete asset"
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors font-medium"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          

        </div>
      </div>

      {/* Department action modal */}
      {deptAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
          <div className="bg-white border border-gray-200 rounded-lg shadow-2xl max-w-md w-full p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{deptAction}</h3>
            <p className="text-sm text-gray-600 mb-4">Add a new asset for this department or edit an existing one</p>
            <div className="mb-3">
              <label className="block text-xs text-gray-700 mb-2">Existing assets</label>
              <select
                value={deptSelectedAssetId ?? ''}
                onChange={(e) => setDeptSelectedAssetId(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white"
              >
                <option value="">Select asset to edit</option>
                {deptItems.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.asset_user ? `${it.asset_user} (${it.id})` : it.id}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 mb-3">
              <button
                onClick={() => {
                  setActiveDept(deptAction)
                  openAdd()
                  setDeptAction(null)
                }}
                className="px-3 py-2 bg-school-600 hover:bg-school-700 text-white rounded text-sm"
              >
                Add Asset
              </button>

              <button
                onClick={() => {
                  if (!deptSelectedAssetId) return alert('Select an asset to edit')
                  const it = deptItems.find((i) => String(i.id) === String(deptSelectedAssetId))
                  if (!it) return alert('Selected asset not found')
                  setActiveDept(deptAction)
                  openEdit(it)
                  setDeptAction(null)
                }}
                disabled={!deptSelectedAssetId}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm disabled:opacity-50"
              >
                Edit Selected
              </button>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setDeptAction(null)} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
          <div className="bg-white border border-gray-200 rounded-lg shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {modal === 'add' ? 'Add New Asset' : 'Edit Asset'}
            </h2>
            
            <div className="space-y-3 grid grid-cols-2 gap-3 mb-6">
              {ASSET_COLUMNS.map((col) => {
                const key = col.toLowerCase().replace(/ /g, '_')
                const isScannable = SCANNABLE_FIELDS.includes(col)
                return (
                  <div key={col}>
                    <label className="block text-xs text-gray-700 font-medium mb-2">
                      {col}
                      {isScannable && (
                        <button
                          type="button"
                          onClick={() => setScanningField(key)}
                          className="ml-2 text-school-600 hover:text-school-700 text-xs font-normal"
                          title="Scan barcode"
                        >
                          📷 Scan
                        </button>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={form[key] || ''}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                        placeholder={col}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded focus:outline-none focus:border-school-500 focus:ring-1 focus:ring-school-500"
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded text-sm transition-all"
              >
                Cancel
              </button>
              {modal?.id && (
                <button
                  onClick={() => handleDelete(modal.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-all"
                >
                  Delete
                </button>
              )}
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-school-600 hover:bg-school-700 text-white rounded text-sm transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      {scanningField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <BarcodeScanner
            onScan={handleScan(scanningField)}
            onClose={() => setScanningField(null)}
          />
        </div>
      )}
    </div>
  );
}
