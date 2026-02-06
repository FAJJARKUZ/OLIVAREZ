import { ROLES } from './roles'

const nav = (icon, label, path, roles) => ({ icon, label, path, roles })

const dashboardNav = { icon: 'dashboard', label: 'Dashboard', path: '/dashboard', roles: [ROLES.ADMIN, ROLES.ACCOUNTING, ROLES.SUPPLIER] }

export const SIDEBAR_ITEMS = [
  dashboardNav,
  nav('inventory', 'Inventory', '/inventory', [ROLES.ADMIN]),
  nav('tracking', 'Tracking', '/tracking', [ROLES.ADMIN]),
  nav('deployment', 'Asset Deployment', '/asset-deployment', [ROLES.ADMIN, ROLES.ACCOUNTING]),
  nav('clearances', 'Clearances', '/clearances', [ROLES.ADMIN, ROLES.ACCOUNTING]),
  nav('stocks', 'Stocks', '/stocks', [ROLES.ADMIN, ROLES.SUPPLIER]),
  nav('reports', 'Reports', '/reports', [ROLES.ADMIN, ROLES.ACCOUNTING, ROLES.SUPPLIER]),
  nav('financing', 'Financing', '/financing', [ROLES.ADMIN]),
  nav('approval', 'Approval', '/approval', [ROLES.ACCOUNTING]),
  nav('status', 'Status', '/status', [ROLES.ACCOUNTING]),
  nav('finances', 'Finances', '/finances', [ROLES.SUPPLIER]),
]

export function getSidebarItemsForRole(role) {
  if (!role) return []
  return SIDEBAR_ITEMS.filter((item) => item.roles.includes(role))
}
