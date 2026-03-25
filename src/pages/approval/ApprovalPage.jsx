import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import * as clearancesApi from '../../lib/api/clearances'

export function ApprovalPage() {
  const { role } = useAuth()
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
      const statusFilter = ['submitted', 'for_approval']
      const targetFilter = role === 'ACCOUNTING' ? 'ACCOUNTING' : undefined
      const data = await clearancesApi.fetchClearances({
        status: statusFilter,
        target_role: targetFilter,
      })
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
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-school-600 mb-2">Approval Queue</h1>
        <p className="text-gray-600 mb-6">
          <span className="font-medium">Pending:</span> <span className="text-school-600 font-semibold">{clearances.length}</span> requests
        </p>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-300 text-red-800 p-3 rounded text-sm">
            <span className="text-red-600 font-semibold">Error:</span> {error}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">Pending Clearances</h2>
          </div>
          
          {loading ? (
            <div className="p-4 text-gray-500 text-sm">
              <span className="inline-block animate-spin">⟳</span> Loading...
            </div>
          ) : clearances.length === 0 ? (
            <div className="p-4 text-gray-500 text-sm">
              No pending requests
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200">
                    <th className="px-3 py-2 text-left text-gray-900 font-semibold">Type</th>
                    <th className="px-3 py-2 text-left text-gray-900 font-semibold">Description</th>
                    <th className="px-3 py-2 text-left text-gray-900 font-semibold">Date</th>
                    <th className="px-3 py-2 text-left text-gray-900 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clearances.map((c) => (
                    <tr key={c.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-700 font-medium">{c.request_type ?? '—'}</td>
                      <td className="px-3 py-2 text-gray-700">{c.description ?? '—'}</td>
                      <td className="px-3 py-2 text-gray-600">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => setReviewModal(c)}
                          className="text-school-600 hover:text-school-700 text-xs transition-colors font-medium"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          

        </div>
      </div>

      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border border-gray-200 rounded-lg shadow-2xl max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Request</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs text-gray-700 font-medium mb-2">
                  Description
                </label>
                <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded border border-gray-200">
                  {reviewModal.description}
                </p>
              </div>
              
              <div>
                <label className="block text-xs text-gray-700 font-medium mb-2">
                  Decision
                </label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded focus:outline-none focus:border-school-500 focus:ring-1 focus:ring-school-500"
                >
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-700 font-medium mb-2">
                  Notes
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded focus:outline-none focus:border-school-500 focus:ring-1 focus:ring-school-500"
                  rows="3"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                onClick={() => setReviewModal(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReview}
                className="px-4 py-2 bg-school-600 hover:bg-school-700 text-white rounded text-sm transition-all"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
