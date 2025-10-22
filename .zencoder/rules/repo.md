# Project Overview

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + custom components
- **Database**: Prisma ORM targeting PostgreSQL (Supabase)
- **Auth**: Supabase client in `src/hooks/useAuth.ts`

# Key Directories

1. `src/app` — Route handlers and app directory pages.
2. `src/components` — Reusable UI components, including admin dashboard elements.
3. `src/hooks` — Custom React hooks (e.g., `useAuth`).
4. `src/lib` — Utilities, services, Supabase client, Prisma client, schema definitions.
5. `prisma` — Prisma schema and migrations.

# Admin Dashboard Stats Flow

- Frontend component: `src/components/admin/dashboard-admin/AdminDashboard.tsx`
  - Fetches `/api/admin/stats` for dashboard metrics.
  - Caches results in `sessionStorage`.

- API route: `src/app/api/admin/stats/route.ts`
  - Aggregates user stats via Supabase admin client.
  - `onlineUsers` relies on `profile` table timestamp (24h window).

# Known Issues / Notes

- Ensure Supabase `profile` table has `updated_at` or similar timestamp updated after login for accurate "Pengguna Login" metric.
- Check Supabase Row Level Security (RLS) policies if fetching data server-side fails.

# Setup & Commands

- Install deps: `npm install`
- Dev server: `npm run dev`
- Lint: `npm run lint`
- Prisma client generation: `npx prisma generate`

# Testing

- No dedicated automated test suite noted. Use manual verification for admin stats and auth flows.

# Deployment

- Review `.env` / `.env.local` for Supabase keys.
- Configure Supabase Service Role key securely on server for `/api/admin/stats`.