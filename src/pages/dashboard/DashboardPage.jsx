import { useAuth } from '../../contexts/AuthContext'
import { ROLE_LABELS } from '../../config/roles'
import { Card } from '../../components/ui/Card'
import { useEffect, useState } from 'react'
import * as reportsApi from '../../lib/api/reports'
import * as stocksApi from '../../lib/api/stocks'
import * as deploymentsApi from '../../lib/api/deployments'
import * as clearancesApi from '../../lib/api/clearances'

export function DashboardPage() {
  const { user, role } = useAuth()
  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const [feed, setFeed] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [inventory, restock, deployments, clearances] = await Promise.all([
          reportsApi.fetchInventoryReport(),
          stocksApi.fetchRestockList(),
          deploymentsApi.fetchDeployments(),
          clearancesApi.fetchClearances({ status: 'pending' }),
        ])

        if (cancelled) return

        const items = []

        // Inventory summary
        items.push({
          id: 'inv-summary',
          type: 'inventory',
          title: 'Inventory Overview',
          gist: `Total items: ${inventory.length}`,
          details: `Distinct records: ${inventory.length}`,
        })

        // Low stock
        items.push({
          id: 'low-stock',
          type: 'stock',
          title: 'Low Stock Alert',
          gist: `${restock.length} item(s) low on stock`,
          details: restock.slice(0, 5).map((r) => `${r.name ?? r.item_name ?? r.id} (${r.quantity ?? '—'})`).join(', '),
        })

        // Recent deployments
        items.push({
          id: 'deployments',
          type: 'deploy',
          title: 'Recent Deployments',
          gist: `${deployments.slice(0, 5).length} recent deployment(s)`,
          details: deployments.slice(0, 5).map((d) => `${d.receiver ?? d.assignee ?? d.id} — ${d.asset_name ?? d.item_name ?? ''}`).join('; '),
        })

        // Pending clearances
        items.push({
          id: 'clearances',
          type: 'clearance',
          title: 'Pending Approvals',
          gist: `${clearances.length} pending clearance(s)`,
          details: clearances.slice(0, 5).map((c) => `${c.requester ?? c.user_email ?? c.id}`).join(', '),
        })

        setFeed(items)
      } catch (e) {
        console.error(e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6">
      <div className="max-w-4xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-school-700 mb-2">News Feed</h1>
        <p className="text-gray-600">Overview and recent activity for your inventory system.</p>
      </div>

      <div className="max-w-4xl mx-auto">
        {loading ? (
          <p className="text-gray-600">Loading feed...</p>
        ) : (
          <div className="space-y-4">
            {feed.map((f) => (
              <Card key={f.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-school-700">{f.title}</h3>
                    <p className="text-sm text-gray-700 mt-1">{f.gist}</p>
                    {f.details && <p className="text-sm text-gray-600 mt-2">{f.details}</p>}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
