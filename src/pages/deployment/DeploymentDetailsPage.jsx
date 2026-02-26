import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import * as deploymentsApi from '../../lib/api/deployments'
import * as inventoryApi from '../../lib/api/inventory'

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

export function DeploymentDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [deployment, setDeployment] = useState(null)
  const [asset, setAsset] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const deployments = await deploymentsApi.fetchDeployments()
      const d = deployments.find((dep) => dep.id === id)
      if (!d) {
        setError('Deployment not found')
        setLoading(false)
        return
      }
      setDeployment(d)
      if (d.inventory_item_id) {
        const items = await inventoryApi.fetchInventoryItems({})
        const item = items.find((i) => i.id === d.inventory_item_id)
        setAsset(item || null)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="space-y-6">
        <p className="text-gray-600">Loading deployment details...</p>
      </div>
    )
  }

  if (error || !deployment) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-school-700">Deployment Details</h1>
        <div className="rounded-xl bg-red-50 text-red-600 p-4 text-sm">{error || 'Deployment not found'}</div>
        <Button onClick={() => navigate('/asset-deployment')}>Back to Deployments</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-school-700">Deployment Details</h1>
        <Button variant="secondary" onClick={() => navigate('/asset-deployment')}>
          Back to Deployments
        </Button>
      </div>

      <Card>
        <CardTitle>Deployment Information</CardTitle>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Serial #</label>
            <p className="text-gray-900">{deployment.serial_number ?? '—'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <p className="text-gray-900">{deployment.department ?? '—'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name</label>
            <p className="text-gray-900">{deployment.asset_name ?? '—'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <p className="text-gray-900">{deployment.notes ?? '—'}</p>
          </div>
        </div>
      </Card>

      {asset && (
        <Card>
          <CardTitle>Asset Details</CardTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-school-50 border-b border-gray-200">
                  <th className="px-3 py-2 text-left font-semibold text-school-700 border-r border-gray-200">Field</th>
                  <th className="px-3 py-2 text-left font-semibold text-school-700">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="px-3 py-2 text-gray-700 font-medium border-r border-gray-200">ASSET_USER</td>
                  <td className="px-3 py-2 text-gray-900">{asset.asset_user ?? '—'}</td>
                </tr>
                {ASSET_COLUMNS.slice(1).map((col) => {
                  const key = col.toLowerCase().replace(/ /g, '_')
                  return (
                    <tr key={col} className="border-b border-gray-200">
                      <td className="px-3 py-2 text-gray-700 font-medium border-r border-gray-200">{col}</td>
                      <td className="px-3 py-2 text-gray-900">{asset[key] ?? '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {!asset && (
        <Card>
          <p className="text-gray-600">No linked asset found for this deployment.</p>
        </Card>
      )}
    </div>
  )
}
