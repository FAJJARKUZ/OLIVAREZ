import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { BarcodeScanner } from '../../components/BarcodeScanner'
import * as deploymentsApi from '../../lib/api/deployments'
import * as inventoryApi from '../../lib/api/inventory'

export function AssetDeploymentPage() {
  const { role } = useAuth()
  const navigate = useNavigate()
  const isAccounting = role === 'ACCOUNTING'
  const canUpload = isAccounting
  const canEdit = role === 'ADMIN'

  const [deployments, setDeployments] = useState([])
  const [allDeployments, setAllDeployments] = useState([]) // All deployments before filtering
  const [assetOptions, setAssetOptions] = useState([]) // { asset_user, department, inventory_item_id }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showScanner, setShowScanner] = useState(false)
  const [serialNumber, setSerialNumber] = useState('')
  const [searchSerial, setSearchSerial] = useState('')
  const [modal, setModal] = useState(null) // null | { id?, serial_number, asset_name, department, notes, inventory_item_id }

  function applySearchFilter(deploys, search) {
    if (search.trim()) {
      setDeployments(deploys.filter((d) => d.serial_number?.toLowerCase().includes(search.toLowerCase())))
    } else {
      setDeployments(deploys)
    }
  }

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [deployData, items] = await Promise.all([
        deploymentsApi.fetchDeployments(),
        inventoryApi.fetchInventoryItems({}),
      ])
      const allDeploys = deployData ?? []
      setAllDeployments(allDeploys)
      applySearchFilter(allDeploys, searchSerial)
      const byUser = {}
      for (const item of items ?? []) {
        const user = item.asset_user?.trim() || '(Unassigned)'
        if (!byUser[user]) {
          byUser[user] = {
            asset_user: user,
            department: item.department,
            inventory_item_id: item.id,
          }
        }
      }
      setAssetOptions(Object.values(byUser).sort((a, b) => a.asset_user.localeCompare(b.asset_user)))
    } catch (e) {
      setError(e.message)
      setDeployments([])
      setAllDeployments([])
      setAssetOptions([])
    } finally {
      setLoading(false)
    }
  }, [searchSerial])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    applySearchFilter(allDeployments, searchSerial)
  }, [searchSerial, allDeployments])

  function handleScan(value) {
    setSerialNumber(value)
    setShowScanner(false)
  }

  function openAddModal() {
    setModal({
      serial_number: serialNumber,
      asset_name: '',
      department: '',
      notes: '',
      inventory_item_id: null,
    })
  }

  function openEditModal(d) {
    const match = d.inventory_item_id
      ? assetOptions.find((o) => o.inventory_item_id === d.inventory_item_id)
      : assetOptions.find((o) => (o.asset_user === d.asset_name) || (o.asset_user === '(Unassigned)' && !d.asset_name))
    const invId = d.inventory_item_id ?? match?.inventory_item_id ?? null
    setModal({
      id: d.id,
      serial_number: d.serial_number ?? '',
      asset_name: d.asset_name ?? match?.asset_user ?? '',
      department: d.department ?? match?.department ?? '',
      notes: d.notes ?? '',
      inventory_item_id: invId,
    })
  }

  function onSelectAsset(inventoryItemId) {
    const opt = assetOptions.find((o) => o.inventory_item_id === inventoryItemId)
    if (!opt) return
    setModal((m) =>
      m
        ? {
            ...m,
            inventory_item_id: opt.inventory_item_id,
            asset_name: opt.asset_user === '(Unassigned)' ? '' : opt.asset_user,
            department: opt.department,
          }
        : m
    )
  }

  async function handleSaveDeployment() {
    if (!modal) return
    setError('')
    try {
      const payload = {
        serial_number: serialNumber || modal.serial_number,
        asset_name: modal.asset_name || (assetOptions.find((o) => o.inventory_item_id === modal.inventory_item_id)?.asset_user ?? ''),
        department: modal.department,
        notes: modal.notes,
        inventory_item_id: modal.inventory_item_id || null,
      }
      if (modal.id) {
        const prev = deployments.find((d) => d.id === modal.id)
        await deploymentsApi.updateDeployment(modal.id, payload)
        if (prev?.inventory_item_id && prev.inventory_item_id !== payload.inventory_item_id) {
          await inventoryApi.updateInventoryItem(prev.inventory_item_id, { serial_number: null })
        }
        if (payload.inventory_item_id) {
          await inventoryApi.updateInventoryItem(payload.inventory_item_id, { serial_number: payload.serial_number })
        }
      } else {
        const created = await deploymentsApi.createDeployment(payload)
        if (payload.inventory_item_id && created?.id) {
          await inventoryApi.updateInventoryItem(payload.inventory_item_id, { serial_number: payload.serial_number })
        }
      }
      setModal(null)
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleUploadLetter(deploymentId, file) {
    if (!file) return
    setError('')
    try {
      await deploymentsApi.uploadDeploymentLetter(deploymentId, file)
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleDeleteDeployment(id) {
    if (!confirm('Delete this deployment? This will also clear the serial number from the linked asset.')) return
    setError('')
    try {
      const deployment = deployments.find((d) => d.id === id)
      await deploymentsApi.deleteDeployment(id)
      if (deployment?.inventory_item_id) {
        await inventoryApi.updateInventoryItem(deployment.inventory_item_id, { serial_number: null })
      }
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-school-700">Asset Deployment</h1>
      <p className="text-gray-600">
        {canUpload ? 'Upload deployment letters. Admin can view only.' : 'Manage deployed assets and serial numbers. Asset links to ASSET_USER on Tracking.'}
      </p>

      <div className="flex flex-wrap gap-3 items-center text-sm">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchSerial}
            onChange={(e) => setSearchSerial(e.target.value)}
            placeholder="Search serial #"
            className="w-40 px-2.5 py-1.5 border border-gray-200 rounded text-gray-800 text-sm"
          />
          {searchSerial && (
            <button type="button" onClick={() => setSearchSerial('')} className="text-gray-500 hover:text-gray-700 text-xs">
              clear
            </button>
          )}
        </div>
        {canEdit && (
          <>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="Serial #"
                className="w-40 px-2.5 py-1.5 border border-gray-200 rounded text-gray-800 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowScanner(!showScanner)}
                className="px-2 py-1.5 text-gray-600 hover:text-gray-800 border border-gray-200 rounded text-xs"
              >
                {showScanner ? 'Hide' : 'Scan'}
              </button>
            </div>
            <button
              type="button"
              onClick={openAddModal}
              className="px-3 py-1.5 bg-school-600 hover:bg-school-700 text-white rounded text-xs"
            >
              Add
            </button>
          </>
        )}
      </div>
      {showScanner && canEdit && (
        <div className="max-w-md">
          <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 text-red-600 p-4 text-sm">{error}</div>
      )}

      <Card>
        <CardTitle>Deployments</CardTitle>
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : deployments.length === 0 ? (
          <p className="text-gray-600">No deployments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-600">
                  <th className="pb-3 pr-4">Serial #</th>
                  <th className="pb-3 pr-4">Asset</th>
                  <th className="pb-3 pr-4">Department</th>
                  <th className="pb-3 pr-4">Letter</th>
                  <th className="pb-3 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deployments.map((d) => (
                  <tr key={d.id} className="border-b border-gray-100">
                    <td className="py-3 pr-4">{d.serial_number ?? '—'}</td>
                    <td className="py-3 pr-4">{d.asset_name ?? '—'}</td>
                    <td className="py-3 pr-4">{d.department ?? '—'}</td>
                    <td className="py-3 pr-4">
                      <Link
                        to="/clearances"
                        className="text-school-600 hover:underline font-medium"
                      >
                        Clearances
                      </Link>
                      {d.letter_url && (
                        <>
                          {' · '}
                          <a href={d.letter_url} target="_blank" rel="noopener noreferrer" className="text-school-600 hover:underline">
                            View document
                          </a>
                        </>
                      )}
                      {!d.letter_url && canUpload && (
                        <>
                          {' · '}
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="text-sm inline-block max-w-[140px]"
                            onChange={(e) => {
                              const f = e.target.files?.[0]
                              if (f) handleUploadLetter(d.id, f)
                            }}
                          />
                        </>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex gap-2">
                        <Button variant="secondary" className="!py-1 !px-2 text-xs" onClick={() => navigate(`/asset-deployment/${d.id}`)}>
                          Details
                        </Button>
                        {canEdit && (
                          <>
                            <Button variant="secondary" className="!py-1 !px-2 text-xs" onClick={() => openEditModal(d)}>
                              Edit
                            </Button>
                            <Button variant="secondary" className="!py-1 !px-2 text-xs !bg-red-600 !hover:bg-red-700 !text-white" onClick={() => handleDeleteDeployment(d.id)}>
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="rounded-2xl bg-white shadow-xl max-w-md w-full p-6 animate-fade-in">
            <h2 className="text-lg font-semibold mb-4">{modal.id ? 'Edit deployment' : 'New deployment'}</h2>
            <div className="space-y-4">
              <Input
                label="Serial number"
                value={modal.serial_number}
                onChange={(e) => setModal((m) => ({ ...m, serial_number: e.target.value }))}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asset (ASSET_USER)</label>
                <select
                  value={modal.inventory_item_id ?? ''}
                  onChange={(e) => onSelectAsset(e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Select asset from tracking...</option>
                  {assetOptions.map((opt) => (
                    <option key={opt.inventory_item_id} value={opt.inventory_item_id}>
                      {opt.asset_user} — {opt.department}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Department"
                value={modal.department}
                readOnly
                className="bg-gray-50"
                title="Set by selected asset from Asset Tracking"
              />
              <Input
                label="Notes"
                value={modal.notes}
                onChange={(e) => setModal((m) => ({ ...m, notes: e.target.value }))}
              />
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
              <Button onClick={handleSaveDeployment}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
