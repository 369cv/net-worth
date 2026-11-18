# Net Worth — web app

Next.js 15 · **Wix** backend (member login + CMS collections) · Plaid · Claude advisor. Target: `app.ownyournetworth.app`.
UI layout references Origin's web app (structure only); brand is Net Worth's own. Live preview: `design/webapp-preview.html`.

## Components
| Piece | Files | Role |
|---|---|---|
| Auth | `lib/wix-auth.ts`, `app/auth/*`, `app/login`, `middleware.ts` | Wix-hosted member sign-in/up (OAuth + PKCE), httpOnly session cookie |
| Database | `lib/wix-data.ts` | Wix Data API with site API key (server-only) |
| Collections | Wix CMS: `PlaidItems`, `Accounts`, `Transactions`, `Holdings`, `Budgets` | All admin-only; every row has `userId` (Wix member id) |
| Bank link | `components/LinkButton.tsx`, `app/api/plaid/*`, `lib/sync.ts` | Link → exchange → sync accounts, transactions, holdings |
| Screens | `app/dashboard`, `spending`, `invest`, `forecast`, `advisor` | Home, Spending, Invest, Forecast, Advisor |
| Advisor | `app/api/advisor` | Claude, grounded in the member's own rows |

## Environment
See `.env.example`. Needed: `WIX_API_KEY` (Wix → API Keys, Wix Data permission), `PLAID_CLIENT_ID`, `PLAID_SECRET`, `ANTHROPIC_API_KEY`.
Wix login redirect `https://app.ownyournetworth.app/auth/callback` is already allowed on the headless client.

## Run / deploy
`npm install && npm run dev` · Hostinger Node.js app: root `webapp/`, build `npm run build`, start `npm start`.
