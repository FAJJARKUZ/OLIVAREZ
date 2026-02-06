import { useState, useEffect } from 'react'
import { Card, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { Input } from '../../components/ui/Input'
import * as clearancesApi from '../../lib/api/clearances'

export function ApprovalPage() {
  const [clearances, setClearances] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviewModal, setReviewModal] = useState(null)
  const [reviewStatus, setReviewStatus] = useState('approved')
  const [reviewNotes, setReviewNotes] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await clearancesApi.fetchClearances({ status: 'pending' })
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
  }, [])

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
      <h1 className="text-2xl font-bold text-neutral-800">Approval</h1>
      <p className="text-neutral-500">Approve or reject clearance requests.</p>

      {error && (
        <div className="rounded-xl bg-red-50 text-red-600 p-4 text-sm">{error}</div>
      )}

      <Card>
        <CardTitle>Pending clearances</CardTitle>
        {loading ? (
          <p className="text-neutral-500">Loading...</p>
        ) : clearances.length === 0 ? (
          <p className="text-neutral-500">No pending requests.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-neutral-600">
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 pr-4">Description</th>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pl-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {clearances.map((c) => (
                  <tr key={c.id} className="border-b border-neutral-100">
                    <td className="py-3 pr-4">{c.request_type ?? '—'}</td>
                    <td className="py-3 pr-4">{c.description ?? '—'}</td>
                    <td className="py-3 pr-4">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 pl-4">
                      <Button variant="ghost" onClick={() => setReviewModal(c)}>
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="rounded-2xl bg-white shadow-xl max-w-md w-full p-6 animate-fade-in">
            <h2 className="text-lg font-semibold mb-4">Approve or reject</h2>
            <p className="text-sm text-neutral-600 mb-4">{reviewModal.description}</p>
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
