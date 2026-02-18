import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { InventoryPage } from './pages/inventory/InventoryPage'
import { TrackingPage } from './pages/tracking/TrackingPage'
import { AssetDeploymentPage } from './pages/deployment/AssetDeploymentPage'
import { ClearancesPage } from './pages/clearances/ClearancesPage'
import { StocksPage } from './pages/stocks/StocksPage'
import { ReportsPage } from './pages/reports/ReportsPage'
import { FinancingPage } from './pages/financing/FinancingPage'
import { ApprovalPage } from './pages/approval/ApprovalPage'
import { StatusPage } from './pages/status/StatusPage'
import { FinancesPage } from './pages/finances/FinancesPage'
import { ROLES } from './config/roles'

function RedirectIfAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white">Loading...</div>
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/login"
            element={
              <RedirectIfAuth>
                <LoginPage />
              </RedirectIfAuth>
            }
          />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ACCOUNTING, ROLES.SUPPLIER]}><DashboardPage /></ProtectedRoute>} />
            <Route path="inventory" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><InventoryPage /></ProtectedRoute>} />
            <Route path="tracking" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><TrackingPage /></ProtectedRoute>} />
            <Route path="asset-deployment" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ACCOUNTING]}><AssetDeploymentPage /></ProtectedRoute>} />
            <Route path="clearances" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ACCOUNTING]}><ClearancesPage /></ProtectedRoute>} />
            <Route path="stocks" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SUPPLIER]}><StocksPage /></ProtectedRoute>} />
            <Route path="reports" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ACCOUNTING, ROLES.SUPPLIER]}><ReportsPage /></ProtectedRoute>} />
            <Route path="financing" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><FinancingPage /></ProtectedRoute>} />
            <Route path="approval" element={<ProtectedRoute allowedRoles={[ROLES.ACCOUNTING]}><ApprovalPage /></ProtectedRoute>} />
            <Route path="status" element={<ProtectedRoute allowedRoles={[ROLES.ACCOUNTING]}><StatusPage /></ProtectedRoute>} />
            <Route path="finances" element={<ProtectedRoute allowedRoles={[ROLES.SUPPLIER]}><FinancesPage /></ProtectedRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
