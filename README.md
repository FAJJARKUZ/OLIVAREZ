# Olivarez College – Inventory Management

A green-themed, role-based inventory management web application for **Olivarez College**. It provides separate dashboards for **Admin**, **Accounting**, and **Supplier** with protected routes, Supabase backend, and camera-based barcode scanning.

---

## 1. Project overview

- **Admin**: Full inventory CRUD, tracking, asset deployment (with barcode), clearances, stocks/restock list, reports, financing.
- **Accounting**: Clearances, reports, asset deployment (upload deployment letters; admin view-only), approval of clearance requests, status tracking.
- **Supplier**: Stocks (supply requests, availability), reports, finances (invoices/payment status).

Features include:

- Login, register, forgot password (Supabase Auth).
- Role-based sidebar and protected routes.
- Inventory classification: transfer, reassignment, disposal; department labels; defective assets; IT consumable restock list.
- Printable letters with Olivarez College branding.
- Exportable reports (CSV; PDF can be added via a library like jspdf).

---

## 2. Tech stack

| Layer        | Technology              |
| ------------ | ----------------------- |
| Frontend     | React 19 + Vite 7       |
| Styling      | Tailwind CSS 4         |
| Backend/DB   | Supabase (PostgreSQL)  |
| Auth         | Supabase Auth + RLS    |
| Barcode/QR   | html5-qrcode (camera)  |
| Routing      | React Router 7         |

---

## 3. Prerequisites

- **Node.js** 18+ and **npm**
- A **Supabase** account ([supabase.com](https://supabase.com))

---

## 4. Step-by-step setup

### 4.1 Clone and install

```bash
git clone <your-repo-url> Olivarez
cd Olivarez
npm install
```

### 4.2 Supabase project and schema

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2. In the project, open **SQL Editor** and run the contents of **`supabase/schema.sql`** in order.  
   This creates:
   - `profiles` (role: ADMIN / ACCOUNTING / SUPPLIER)
   - `inventory_items`, `inventory_movements`, `deployments`, `clearances`, `stock_requests`, `supplier_invoices`
   - Trigger to create a profile on signup (role from `user_metadata.role`)
   - Row Level Security (RLS) policies per role
   - Storage bucket `documents` for deployment letters

3. In **Authentication → Providers**, enable **Email** (and optionally confirm email settings).
4. In **Storage**, ensure the `documents` bucket exists and is public if you want direct links to letters.

### 4.3 Environment variables

1. In the project root, create a file named **`.env`** (copy from `.env.example`):

```bash
cp .env.example .env
```

2. In Supabase: **Project Settings → API**. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

3. Edit **`.env`**:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Restart the dev server after changing `.env`.

### 4.4 Run the development server

```bash
npm run dev
```

Open the URL shown (e.g. `http://localhost:5173`). Use **Register** to create an account; choose a role (or leave default). The trigger will create a profile with that role.

---

## 5. Folder structure

```
Olivarez/
├── public/
├── src/
│   ├── components/       # Reusable UI and layout
│   │   ├── layout/       # Sidebar, DashboardLayout
│   │   ├── ui/           # Button, Input, Card, Select
│   │   ├── BarcodeScanner.jsx
│   │   ├── PrintLetter.jsx
│   │   └── ProtectedRoute.jsx
│   ├── config/           # roles.js, sidebar.js (role-based nav)
│   ├── contexts/         # AuthContext (Supabase session + profile/role)
│   ├── lib/              # supabase client, API helpers
│   │   ├── api/          # inventory, tracking, clearances, etc.
│   │   └── supabase.js
│   ├── pages/            # Auth and dashboard pages per feature
│   │   ├── auth/         # Login, Register, ForgotPassword
│   │   ├── dashboard/
│   │   ├── inventory/
│   │   ├── tracking/
│   │   ├── deployment/
│   │   ├── clearances/
│   │   ├── stocks/
│   │   ├── reports/
│   │   ├── financing/
│   │   ├── approval/
│   │   ├── status/
│   │   └── finances/
│   ├── App.jsx            # Router + protected routes
│   ├── main.jsx
│   └── index.css          # Tailwind + theme (green accent)
├── supabase/
│   └── schema.sql        # Tables, RLS, storage, trigger
├── .env.example
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 6. Role-based authentication

- **Sign up**: User registers with email/password; can optionally set `role` (ADMIN, ACCOUNTING, SUPPLIER) in the form. It is stored in `user_metadata` and the DB trigger creates a `profiles` row with that role.
- **Session**: Supabase Auth manages the session; `AuthContext` exposes `user`, `profile`, and `role`.
- **Protected routes**: `ProtectedRoute` checks:
  - If not logged in → redirect to `/login`.
  - If `allowedRoles` is set and the user’s role is not in the list → redirect to `/dashboard`.
- **Sidebar**: `getSidebarItemsForRole(role)` returns only nav items allowed for that role.
- **RLS**: Supabase policies restrict table (and storage) access by role so the backend enforces the same rules.

---

## 7. Build and deploy

**Production build:**

```bash
npm run build
```

Output is in **`dist/`**. Serve with any static host (e.g. Vercel, Netlify, or your server).

**Deploy:**

1. Set the same **`VITE_SUPABASE_URL`** and **`VITE_SUPABASE_ANON_KEY`** in the host’s environment variables.
2. Build command: `npm run build`
3. Publish directory: `dist`

For local preview:

```bash
npm run preview
```

---

## Quick reference

| Task              | Command / location                          |
| ----------------- | -------------------------------------------- |
| Install deps      | `npm install`                                |
| Dev server        | `npm run dev`                                |
| Build             | `npm run build`                              |
| Supabase setup    | Run `supabase/schema.sql` in SQL Editor       |
| Env vars          | `.env` with `VITE_SUPABASE_*`                |
| Role after signup | Set in registration form or in Supabase Auth |

This README is intended to be beginner-friendly: follow the steps in order for a working setup. For RLS details and table definitions, see **`supabase/schema.sql`**.
