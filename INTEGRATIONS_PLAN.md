# Integrations and Expansion Plan

Status: draft for sign-off · 2026-11-22

## Index

| # | Component | Type | One-line summary |
|---|-----------|------|------------------|
| 1 | Back end | Project | A server layer the app currently lacks. Needed before any real bank data. |
| 2 | Plaid connector | Tool | Real US/CA/UK/EU bank, card, loan and investment accounts. |
| 3 | UAE Open Finance connector | Tool | Mashreq NEO BIZ and other UAE banks through Al Tareq / Nebras or a licensed aggregator. |
| 4 | Statement import connector | Tool | A fallback for any bank without an API: CSV, OFX, MT940, PDF. |
| 5 | Provider abstraction | Rule | One internal data model so every source looks the same to the app. |
| 6 | Real estate module | Project | Properties, rent roll, leases, expenses, debt, valuation and returns. |
| 7 | Institutional / HNW module | Project | Entities, ownership, private funds, alternatives, consolidated reporting. |
| 8 | Security and compliance | Rule | Token handling, encryption, audit and the licences each region needs. |
| 9 | Rollout sequence | Workflow | The order to build and the gate for each step. |

Edges: 1 → 2, 3, 4 · 5 ↔ 2, 3, 4, 6, 7 · 8 → everything · 6 and 7 share entities and valuations.

---

## 1. Back end (prerequisite)

The current app is one HTML file that stores data in the browser. Real accounts need:

- **API server:** Next.js route handlers in `webapp/`, or a separate Node service.
- **Database:** Postgres for users, institutions, accounts, transactions, holdings, properties and entities.
- **Auth:** real sign-in (email plus passkey or OAuth) to replace the prototype's local login.
- **Secrets store:** provider keys in environment variables only, never in client code.
- **Jobs:** webhooks and a scheduled sync for transactions and balances.

## 2. Plaid connector

- **Flow:** the server creates a `link_token`; the browser opens Plaid Link; the server exchanges the `public_token` for an `access_token`, stores it encrypted, and syncs.
- **Products:** Transactions (`/transactions/sync`), Balance, Investments (holdings and transactions), Liabilities (cards, mortgages, student loans) and Identity.
- **Webhooks:** `SYNC_UPDATES_AVAILABLE`, `ITEM_LOGIN_REQUIRED` and `PENDING_DISCONNECT`. Each one maps to an in-app "Reconnect" state, which the prototype already has.
- **Environments:** Sandbox first (fake banks, free), then Production after Plaid's approval review.
- **Needed from you:** Plaid `client_id` and Sandbox `secret` from dashboard.plaid.com. Later, Production access approval.
- **Coverage:** US, Canada, UK and parts of the EU. It does not cover UAE banks.

## 3. UAE Open Finance connector (Mashreq NEO BIZ and others)

What I found:

- **NEOBiz Connect** is Mashreq's onboarding API: partners submit account applications. It is not an account-data API. ([Fintech Times](https://thefintechtimes.com/mashreq-launches-neobiz-to-develop-the-api-ecosystem/), [Virtuzone](https://virtuzone.com/press-release/mashreq-neobiz-connect-api-integration-live-virtuzone/))
- **The UAE's regulated route** is the CBUAE Open Finance framework. Nebras runs the central API hub, and Al Tareq is the customer consent layer. Business accounts can be linked (Wio Business documents this). ([Nebras](https://nebras-open-finance.com/), [Wio Business guide](https://desk.wio.io/support/solutions/articles/501000414629-wio-business-open-finance-user-guide-faqs))
- **Status:** a July 2026 tracker lists Mashreq as live on Al Tareq. Check this with Nebras before building. ([Himma tracker](https://himma.ai/tools/open-finance-tracker/))
- **Licensed aggregators** already connected to the hub include Lean Technologies and Tarabut Gateway. ([Tarabut on Open Banking Tracker](https://www.openbankingtracker.com/api-aggregators/tarabutgateway))

Options:

1. **Licensed aggregator (Lean or Tarabut). Recommended.** You sign a commercial agreement and they hold the CBUAE licence. Integration looks like Plaid: consent UI, token, then sync. This is the fastest route.
2. **Become a licensed TPP with CBUAE.** You get full control, but it means a long licensing process and compliance cost.
3. **Direct bank partnership** with Mashreq's API team. This is case by case and unlikely to cover personal-finance aggregation.

Needed from you: a decision on the route, then sales contact with Lean or Tarabut to confirm Mashreq NEO BIZ is in their coverage.

## 4. Statement import connector (works everywhere today)

- **Formats:** CSV, OFX/QFX, MT940 (common for UAE and EU business banks) and PDF statements (extracted and then reviewed by the user).
- **Purpose:** a fallback for any bank with no API, and the first way NEO BIZ data can get in before Open Finance access is approved.

## 5. Provider abstraction (rule)

Every source maps into one model: `Institution → Connection → Account → Transaction / Holding / Liability`. Each record carries `source` (`plaid`, `uae_of`, `import`, `manual`) and `currency`. The app never calls a provider directly, so adding a provider never changes screens.

Multi-currency (AED, USD and others) needs daily FX rates and a base-currency setting.

## 6. Real estate module

Who it's for: individual investors, enthusiasts and real estate professionals.

| Area | What it holds |
|------|---------------|
| Property | Address, type (residential, commercial, land, mixed), units, purchase price and date, ownership % and owning entity |
| Valuation | Manual value, an automated estimate where available (US: providers such as ATTOM or HouseCanary; UAE: DLD/Property Finder data where licensed), and valuation history |
| Debt | Mortgages linked from Plaid Liabilities or entered by hand; rate, term, amortization |
| Income | Rent roll, leases (tenant, term, rent, escalations, deposit), vacancy |
| Expenses | Tagged from linked bank transactions: tax, insurance, HOA/service charge, repairs, management |
| Returns | NOI, cap rate, cash-on-cash, DSCR, IRR, equity and LTV, portfolio rollup |
| Documents | Deeds, leases, insurance, with renewal reminders |
| Professional mode | Many owners and clients, a deal pipeline, and per-property P&L export |

## 7. Institutional / HNW module

What high-level and institutional investors need on top:

- **Entities:** LLCs, trusts, holding companies and funds, with an ownership graph and look-through net worth.
- **Alternatives:** private equity and VC commitments (called, uncalled, distributions, capital account), hedge funds, private credit, art, collectibles and crypto.
- **Performance:** TWR and IRR, benchmark comparison, asset-allocation drift and exposure by region, sector and currency.
- **Reporting:** consolidated statements, K-1 and document vault, and an export for accountants.
- **Access:** roles for advisor, accountant, family office staff and read-only partners, with a full audit log.
- **Data feeds:** custodian feeds (Schwab, Fidelity, Pershing) via aggregators such as Addepar-style connectors or Plaid Investments, plus document extraction from capital-call and statement PDFs.

## 8. Security and compliance (rule)

- **Token storage:** encrypt access tokens at rest and never send them to the browser.
- **Logs:** no logging of account numbers or tokens; keep an audit trail of every connection change.
- **Standards:** meet OWASP ASVS Level 1 to start (already a pending gate in `HEALING_LOOP.md`).
- **Privacy:** a privacy policy and data-deletion flow, as Plaid's production review requires.
- **UAE:** follow CBUAE data-residency and consent rules through whichever licensed partner you pick.

## 9. Rollout sequence (workflow)

1. **Back end and auth:** gate is the existing benchmark plus the API tests.
2. **Plaid Sandbox:** link a test bank and see real-shaped data in every screen.
3. **Statement import:** a NEO BIZ statement shows up as an account.
4. **Real estate module:** add, edit and delete a property, and its returns calculate.
5. **Plaid Production:** after Plaid approves.
6. **UAE Open Finance** via the chosen partner.
7. **Institutional module.**

Each step passes the benchmark twice before it moves on, as in `HEALING_LOOP.md`.
