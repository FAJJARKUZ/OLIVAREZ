import { Outlet } from 'react-router-dom'
import { TopNav } from './TopNav'

export function DashboardLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <TopNav />
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
