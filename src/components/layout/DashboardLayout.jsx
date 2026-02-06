import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="max-w-6xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
