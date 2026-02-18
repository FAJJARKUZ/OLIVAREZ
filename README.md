

** Build and deploy**

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

This README is intended to be beginner-friendly: follow the steps in order for a working setup. For RLS details and table definitions,