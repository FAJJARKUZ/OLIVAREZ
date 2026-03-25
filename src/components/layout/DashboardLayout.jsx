import { Outlet } from 'react-router-dom'
import { TopNav } from './TopNav'

export function DashboardLayout({ theme, toggleTheme }) {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-900">
      <TopNav theme={theme} toggleTheme={toggleTheme} />
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
