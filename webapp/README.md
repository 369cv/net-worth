# Net Worth — web app

Next.js 15 · Supabase (auth + Postgres + RLS) · Plaid (sandbox) · Claude advisor. Target: `app.ownyournetworth.app`.

## Components
| Piece | File | Role |
|---|---|---|
| Auth | `app/login`, `app/auth/*`, `middleware.ts` | Magic-link sign-in; all routes gated |
| Schema | `supabase/migrations/0001_init.sql` | plaid_items (server-only), accounts, transactions; RLS |
| Bank link | `components/LinkButton.tsx`, `app/api/plaid/*` | Link token → exchange → sync |
| Sync | `lib/sync.ts` | Accounts + cursor-based transactions sync |
| Dashboard | `app/dashboard` | Net worth, assets/liabilities, 30-day spend, transactions |
| Advisor | `app/advisor`, `app/api/advisor` | Claude chat grounded in the user's own data |

## Setup
1. Supabase: new project → SQL editor → run `supabase/migrations/0001_init.sql`. Auth → URL config: Site URL `https://app.ownyournetworth.app`, redirect `https://app.ownyournetworth.app/auth/callback` (+ `http://localhost:3000/auth/callback`).
2. Copy `.env.example` → `.env.local`, fill keys.
3. `npm install && npm run dev`. Sandbox login in Plaid Link: `user_good` / `pass_good`.

## Deploy (Hostinger Node.js)
Subdomain `app.ownyournetworth.app` → Node.js app from repo `369cv/net-worth`, root `webapp/`, build `npm run build`, start `npm start`. Set env vars in hPanel, then rebuild.
