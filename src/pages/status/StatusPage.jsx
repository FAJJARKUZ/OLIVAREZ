import { useState, useEffect } from 'react'
import { Card, CardTitle } from '../../components/ui/Card'
import { Select } from '../../components/ui/Select'
import * as clearancesApi from '../../lib/api/clearances'

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

export function StatusPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [clearances, setClearances] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    clearancesApi
      .fetchClearances({ status: statusFilter || undefined })
      .then(setClearances)
      .catch((e) => {
        setError(e.message)
        setClearances([])
      })
      .finally(() => setLoading(false))
  }, [statusFilter])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-800">Status</h1>
      <p className="text-neutral-500">Track approval and clearance statuses.</p>

      <Card>
        <Select
          label="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={STATUS_OPTIONS}
          className="max-w-xs"
        />
      </Card>

      {error && (
        <div className="rounded-xl bg-red-50 text-red-600 p-4 text-sm">{error}</div>
      )}

      <Card>
        <CardTitle>Clearance status</CardTitle>
        {loading ? (
          <p className="text-neutral-500">Loading...</p>
        ) : clearances.length === 0 ? (
          <p className="text-neutral-500">No records.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-neutral-600">
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 pr-4">Description</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Reviewed</th>
                </tr>
              </thead>
              <tbody>
                {clearances.map((c) => (
                  <tr key={c.id} className="border-b border-neutral-100">
                    <td className="py-3 pr-4">{c.request_type ?? '—'}</td>
                    <td className="py-3 pr-4">{c.description ?? '—'}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${
                          c.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : c.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      {c.reviewed_at ? new Date(c.reviewed_at).toLocaleString() : '—'}
                    </td>
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
