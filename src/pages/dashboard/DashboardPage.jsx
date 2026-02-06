import { useAuth } from '../../contexts/AuthContext'
import { ROLE_LABELS } from '../../config/roles'
import { Card, CardTitle } from '../../components/ui/Card'

export function DashboardPage() {
  const { user, role } = useAuth()
  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">Dashboard</h1>
        <p className="text-neutral-500 mt-1">
          Welcome back, {name}. Role: {role ? ROLE_LABELS[role] : '—'}
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardTitle>Quick access</CardTitle>
          <p className="text-sm text-neutral-600">
            Use the sidebar to open Inventory, Clearances, Reports, and other modules based on your role.
          </p>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardTitle>Olivarez College</CardTitle>
          <p className="text-sm text-neutral-600">
            Inventory Management System — track assets, clearances, and stock levels in one place.
          </p>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardTitle>Need help?</CardTitle>
          <p className="text-sm text-neutral-600">
            Contact your system administrator for access or role changes.
          </p>
        </Card>
      </div>
    </div>
  )
}
