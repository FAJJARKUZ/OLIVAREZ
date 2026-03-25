import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { ROLES } from '../../config/roles'
import * as clearancesApi from '../../lib/api/clearances'

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'for_approval', label: 'For approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

export function ClearancesPage() {
  const { user, role } = useAuth()
  const isAdmin = role === 'ADMIN'
  const isAccounting = role === 'ACCOUNTING'
  const canSubmit = isAdmin
  const canReview = isAccounting

  const [clearances, setClearances] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ request_type: '', description: '', file: null })
  const [uploadNotice, setUploadNotice] = useState('')
  const [reviewModal, setReviewModal] = useState(null)
  const [reviewStatus, setReviewStatus] = useState('approved')
  const [reviewNotes, setReviewNotes] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await clearancesApi.fetchClearances({ status: statusFilter || undefined })
      setClearances(data)
    } catch (e) {
      setError(e.message)
      setClearances([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [statusFilter])

  async function handleSubmit() {
    setError('')
    setUploadNotice('')
    try {
      const created = await clearancesApi.createClearance({
        request_type: form.request_type,
        description: form.description,
        status: 'pending',
      })
      // If admin uploaded a file, save it and surface clear feedback.
      if (form.file && role === ROLES.ADMIN) {
        try {
          await clearancesApi.uploadClearanceDocument(created.id, form.file)
          setUploadNotice('File uploaded and attached successfully.')
        } catch (uploadError) {
          setUploadNotice(`Request saved, but file upload failed: ${uploadError.message}`)
        }
      } else {
        setUploadNotice('Request submitted successfully.')
      }
      setShowForm(false)
      setForm({ request_type: '', description: '', file: null })
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleReview() {
    if (!reviewModal) return
    setError('')
    try {
      await clearancesApi.updateClearanceStatus(reviewModal.id, reviewStatus, reviewNotes)
      setReviewModal(null)
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-school-700">Clearances</h1>
        {canSubmit && (
          <Button onClick={() => setShowForm(true)}>Submit clearance request</Button>
        )}
      </div>

      <ClearancesTab
        clearances={clearances}
        loading={loading}
        error={error}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        canReview={canReview}
        setReviewModal={setReviewModal}
        onDelete={async (id) => {
          setError('')
          try {
            await clearancesApi.deleteClearance(id)
            load()
          } catch (e) {
            setError(e.message)
          }
        }}
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="rounded-2xl bg-white shadow-xl max-w-md w-full p-6 animate-fade-in">
            <h2 className="text-lg font-semibold mb-4">Submit clearance request</h2>
            <div className="space-y-4">
              <Input
                label="Request type"
                value={form.request_type}
                onChange={(e) => setForm((f) => ({ ...f, request_type: e.target.value }))}
                placeholder="e.g. Exit clearance"
              />
              <Input
                label="Description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Details"
              />
              {role === ROLES.ADMIN && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Attach document</label>
                  <input
                    type="file"
                    accept="*/*"
                    onChange={(e) => setForm((f) => ({ ...f, file: e.target.files[0] }))}
                    className="mt-1 block w-full"
                  />
                  {form.file && (
                    <p className="mt-1 text-xs text-gray-600">Selected: {form.file.name}</p>
                  )}
                </div>
              )}
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>Submit</Button>
            </div>
          </div>
        </div>
      )}

      {uploadNotice && (
        <div className="rounded-xl bg-school-50 text-school-700 p-4 text-sm">{uploadNotice}</div>
      )}

      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="rounded-2xl bg-white shadow-xl max-w-md w-full p-6 animate-fade-in">
            <h2 className="text-lg font-semibold mb-4">Approve or reject</h2>
            <p className="text-sm text-gray-600 mb-4">{reviewModal.description}</p>
            <Select
              label="Decision"
              value={reviewStatus}
              onChange={(e) => setReviewStatus(e.target.value)}
              options={[
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
              ]}
            />
            <Input
              label="Notes"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              className="mt-4"
            />
            <div className="mt-6 flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setReviewModal(null)}>Cancel</Button>
              <Button onClick={handleReview}>Submit</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ClearancesTab({
  clearances,
  loading,
  error,
  statusFilter,
  setStatusFilter,
  canReview,
  setReviewModal,
  onDelete,
}) {
  return (
    <>
      <Card>
        <CardTitle>Filters</CardTitle>
        <Select
          label="Status"
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
        <CardTitle>Requests</CardTitle>
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : clearances.length === 0 ? (
          <p className="text-gray-600">No clearance requests.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-600">
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 pr-4">Description</th>
                  <th className="pb-3 pr-4">Attachment</th>
                  {canReview && <th className="pb-3 pr-4">Comments</th>}
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Date</th>
                  {canReview && <th className="pb-3 pl-4">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {clearances.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100">
                    <td className="py-3 pr-4">{c.request_type ?? '—'}</td>
                    <td className="py-3 pr-4">{c.description ?? '—'}</td>
                    <td className="py-3 pr-4">
                      {c.document_url ? (
                        <a href={c.document_url} target="_blank" rel="noreferrer" className="text-school-600 underline">
                          View file
                        </a>
                      ) : '—'}
                    </td>
                    {canReview && <td className="py-3 pr-4">{c.reviewed_notes ?? '—'}</td>}
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
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                    </td>
                    {canReview && (
                      <td className="py-3 pl-4">
                        <div className="flex items-center gap-2">
                          {c.status === 'pending' && (
                            <Button
                              variant="ghost"
                              onClick={() => setReviewModal(c)}
                            >
                              Review
                            </Button>
                          )}
                          <Button
                            variant="danger"
                            className="!py-1.5 !px-2.5 text-xs"
                            onClick={() => {
                              if (confirm('Delete this clearance request?')) {
                                onDelete(c.id)
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}
