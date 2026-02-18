import { useState, useEffect } from 'react'
import { Card, CardTitle } from '../../components/ui/Card'
import { supabase } from '../../lib/supabase'

export function FinancesPage() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase
      .from('supplier_invoices')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) throw err
        setInvoices(data ?? [])
      })
      .catch((e) => {
        setError(e.message)
        setInvoices([])
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-school-700">Finances</h1>
      <p className="text-gray-600">Invoices and payment status (Supplier).</p>

      {error && (
        <div className="rounded-xl bg-red-50 text-red-600 p-4 text-sm">{error}</div>
      )}

      <Card>
        <CardTitle>Invoices</CardTitle>
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : invoices.length === 0 ? (
          <p className="text-gray-600">No invoices. Table supplier_invoices can be added in Supabase.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-600">
                  <th className="pb-3 pr-4">Reference</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-100">
                    <td className="py-3 pr-4">{inv.reference ?? inv.id}</td>
                    <td className="py-3 pr-4">{inv.amount ?? '—'}</td>
                    <td className="py-3 pr-4">{inv.payment_status ?? '—'}</td>
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
