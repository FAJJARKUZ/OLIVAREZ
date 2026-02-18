import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { BarcodeScanner } from '../../components/BarcodeScanner'
import * as deploymentsApi from '../../lib/api/deployments'

export function AssetDeploymentPage() {
  const { role } = useAuth()
  const isAccounting = role === 'ACCOUNTING'
  const canUpload = isAccounting
  const canEdit = role === 'ADMIN'

  const [deployments, setDeployments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showScanner, setShowScanner] = useState(false)
  const [serialNumber, setSerialNumber] = useState('')
  const [modal, setModal] = useState(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await deploymentsApi.fetchDeployments()
      setDeployments(data)
    } catch (e) {
      setError(e.message)
      setDeployments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function handleScan(value) {
    setSerialNumber(value)
    setShowScanner(false)
  }

  async function handleSaveDeployment() {
    if (!modal) return
    setError('')
    try {
      await deploymentsApi.createDeployment({
        serial_number: serialNumber || modal.serial_number,
        asset_name: modal.asset_name,
        department: modal.department,
        notes: modal.notes,
      })
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-school-700">Asset Deployment</h1>
      <p className="text-gray-600">
        {canUpload ? 'Upload deployment letters. Admin can view only.' : 'Manage deployed assets and serial numbers.'}
      </p>

      {canEdit && (
        <Card>
          <CardTitle>Scan serial number</CardTitle>
          <div className="flex flex-wrap gap-4 items-end">
            <Input
              label="Serial number"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="Scan or type"
              className="max-w-xs"
            />
            <Button variant="secondary" onClick={() => setShowScanner(!showScanner)}>
              {showScanner ? 'Hide camera' : 'Open camera'}
            </Button>
          </div>
          {showScanner && (
            <div className="mt-4">
              <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
            </div>
          )}
          <Button className="mt-4" onClick={() => setModal({ serial_number: serialNumber, asset_name: '', department: '', notes: '' })}>
            Add deployment
          </Button>
        </Card>
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
                      {d.letter_url ? (
                        <a href={d.letter_url} target="_blank" rel="noopener noreferrer" className="text-school-600 hover:underline">
                          View
                        </a>
                      ) : canUpload ? (
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="text-sm"
                          onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) handleUploadLetter(d.id, f)
                          }}
                        />
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 pr-4">—</td>
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
            <h2 className="text-lg font-semibold mb-4">New deployment</h2>
            <div className="space-y-4">
              <Input
                label="Serial number"
                value={modal.serial_number}
                onChange={(e) => setModal((m) => ({ ...m, serial_number: e.target.value }))}
              />
              <Input
                label="Asset name"
                value={modal.asset_name}
                onChange={(e) => setModal((m) => ({ ...m, asset_name: e.target.value }))}
              />
              <Input
                label="Department"
                value={modal.department}
                onChange={(e) => setModal((m) => ({ ...m, department: e.target.value }))}
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
