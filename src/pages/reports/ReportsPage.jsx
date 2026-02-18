import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import * as reportsApi from '../../lib/api/reports'

const REPORT_TYPES = [
  { value: 'inventory', label: 'Inventory' },
  { value: 'clearance', label: 'Clearance' },
  { value: 'deployment', label: 'Deployment' },
]

export function ReportsPage() {
  const { role } = useAuth()
  const [reportType, setReportType] = useState('inventory')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      let result = []
      if (reportType === 'inventory') result = await reportsApi.fetchInventoryReport()
      else if (reportType === 'clearance') result = await reportsApi.fetchClearanceReport()
      else result = await reportsApi.fetchDeploymentReport()
      setData(result)
    } catch (e) {
      setError(e.message)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [reportType])

  function handleExportCSV() {
    if (data.length === 0) return
    const columns = Object.keys(data[0])
    const csv = reportsApi.exportToCSV(data, columns)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    reportsApi.downloadBlob(blob, `report-${reportType}-${Date.now()}.csv`)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-school-700">Reports</h1>
      <p className="text-gray-600">View and export inventory, clearance, and deployment reports.</p>

      <Card>
        <CardTitle>Select report</CardTitle>
        <div className="flex flex-wrap gap-4 items-end">
          <Select
            label="Report type"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            options={REPORT_TYPES}
            className="max-w-xs"
          />
          <Button variant="secondary" onClick={load}>Refresh</Button>
          <Button variant="outline" onClick={handleExportCSV} disabled={data.length === 0}>
            Export CSV
          </Button>
        </div>
      </Card>

      {error && (
        <div className="rounded-xl bg-red-50 text-red-600 p-4 text-sm">{error}</div>
      )}

      <Card>
        <CardTitle>{reportType} report</CardTitle>
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : data.length === 0 ? (
          <p className="text-gray-600">No data.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-600">
                  {Object.keys(data[0]).map((k) => (
                    <th key={k} className="pb-3 pr-4 capitalize">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 50).map((row, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    {Object.values(row).map((v, j) => (
                      <td key={j} className="py-3 pr-4">
                        {v != null ? String(v) : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data.length > 50 && (
          <p className="mt-2 text-sm text-gray-600">Showing first 50 rows. Export CSV for full data.</p>
        )}
      </Card>
    </div>
  )
}
