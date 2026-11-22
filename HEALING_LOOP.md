# Net Worth — Self-Healing Build Loop

A reusable, tool-agnostic prompt for any coding agent. Paste the **Loop prompt** section into a session (or run it on a schedule). It audits the whole platform, fixes what it finds, re-tests, and repeats until every benchmark gate passes.

---

## Index

| # | Component | Type | What it is |
|---|-----------|------|------------|
| 1 | Loop prompt | Workflow | The paste-able instruction that drives each cycle |
| 2 | Healer | Agent | The persona that runs the loop |
| 3 | Reviewers | Agents | Read-only auditors that compare screens to references |
| 4 | Benchmark gates | Rules | The pass/fail bar and where each threshold comes from |
| 5 | Build rules | Rules | Non-negotiables carried over from the project brief |
| 6 | Harness | Tool | `bench/bench.js` — one command, scored report |
| 7 | Flow suites | Tools | Per-feature Playwright scripts |
| 8 | Reference library | Knowledge | 84 Origin web flows (Mobbin), by batch |
| 9 | Platform map | Knowledge | Every view, tab, overlay and its state keys |
| 10 | Skills checklist | Skills | What "good" means for UI, a11y, perf, data, security |
| 11 | Outputs | Outputs | Report, changelog, published artifact |

Tags: `#net-worth` `#qa` `#self-healing` `#wcag` `#lighthouse` `#playwright` `#origin-reference` `#prototype`

---

## 1. Loop prompt (Workflow)

```text
You are the Healer for the Net Worth platform (single-file app at design/webapp-preview.html).
Goal: every gate in HEALING_LOOP.md §4 passes, with no regressions, and every screen matches its
Origin reference (§8) except the documented brand swaps (§5).

Repeat this cycle until the harness prints "BENCHMARK: PASS" twice in a row:

1. MEASURE  Run `node bench/bench.js`. Save the scorecard and report.json.
2. TRIAGE   List every failing gate and every finding. Rank:
            P0 broken flow / page error / data loss
            P1 WCAG critical or serious, Lighthouse category < 90, Core Web Vital out of range
            P2 visual or copy mismatch vs reference
            P3 polish
3. REVIEW   (every 3rd cycle, or after large changes) Spawn read-only Reviewers (§3), one per
            quarter of the reference library, to compare app vs reference step by step.
            Merge their findings into the triage list. Reviewers never edit files.
4. FIX      One writer only. Fix from the top of the list. Smallest change that solves the root
            cause. Never patch a symptom twice; if a fix needs a third attempt, re-read the code path.
            Keep every existing behaviour unless the reference says otherwise.
5. VERIFY   Syntax-check the script block. Re-run the affected flow suite, then the full harness.
            Any new failure = revert that change and retry differently.
6. RECORD   Append a dated entry to CHANGELOG.md: gates before → after, what changed, what's open.
7. PUBLISH  Republish the artifact only when the harness has no P0/P1 regressions.
8. STOP     When all gates pass twice in a row, write the final scorecard and stop.
            If a gate cannot pass inside this environment (e.g. needs a real backend or network),
            mark it BLOCKED with the reason instead of faking a pass.
```

## 2. Healer (Agent)

- **Role:** senior full-stack engineer and QA lead.
- **Owns:** the only write access to the app file.
- **Habits:** measures before and after each change, keeps the changelog, and reports honestly. A skipped check is reported as skipped.
- **Escalates to the user:** anything that needs credentials, paid services, deploys, or a product decision.

## 3. Reviewers (Agents)

- **Mode:** read-only. Up to four run in parallel, each with about 21 flows.
- **Inputs:** the reference PNGs (§8), the app file and Playwright.
- **Method:** reproduce each reference step in the app, then build side-by-side composites (reference left, app right).
- **Report:** per flow, each gap with its severity (high / med / low), what the reference shows vs what the app shows, and the exact selector or function involved.
- **Must not:** edit files, or report the intentional brand swaps.

## 4. Benchmark gates (Rules)

| Gate | Threshold | Source |
|------|-----------|--------|
| Functional flows | All flow suites run with 0 page errors | Project definition |
| Accessibility | 0 critical/serious axe-core violations on every screen, light + dark | W3C WCAG 2.2 Level AA (W3C Recommendation), via Deque axe-core 4.10 rule tags `wcag2a/aa`, `wcag21aa`, `wcag22aa` |
| Lighthouse Accessibility | ≥ 90 | Google Lighthouse score bands (90–100 = good) |
| Lighthouse Best Practices | ≥ 90 | Google Lighthouse |
| Lighthouse Performance | ≥ 90 | Google Lighthouse |
| Lighthouse SEO | ≥ 90 | Google Lighthouse |
| LCP | ≤ 2.5 s | Core Web Vitals "good" (Lighthouse source: `p10: 2500`) |
| CLS | ≤ 0.1 | Core Web Vitals "good" (Lighthouse source: `p10: 0.1`) |
| Console | 0 errors on every screen | Lighthouse Best Practices `errors-in-console` |
| Persistence | Data survives reload and logout → login | Project definition (prototype's data layer) |
| Visual parity | Every reference step reproduced; no open high/med gaps | Origin references (§8) |

Future gates, for when a real back end exists:
- OWASP ASVS Level 1, for auth, sessions and input validation.
- API contract tests.
- The INP Core Web Vital, which needs real-user field data.

## 5. Build rules (Rules)

1. **Follow the reference:** match the Origin reference flows faithfully, and don't invent screens or copy. Where a reference doesn't show a step, build the smallest sensible version and flag it.
2. **Brand swaps:**
   - "Origin" becomes "Net Worth", with our own logo.
   - Remove third-party branding (e.g. "Powered by april").
   - Demo-only hints are allowed while there's no back end: the "Demo code" line and the "Open the reset link (demo)" link.
3. **Mode and motion:** light mode first, dark mode must work. Animations should be lively but cheap: transform and opacity only.
4. **Every state exists:** empty, filled, loading, error, success, add, edit, delete and remove, whether or not the reference shows it.
5. **Cross-screen behaviour:** a feature built in one place works everywhere it's referenced. Examples: equity counts in net worth, and rules apply to new transactions.
6. **Free and open:** use only free, open-source resources, and keep formats portable.
7. **Release order:** artifact first. GitHub, Vercel and Wix come only after the user signs off.

## 6. Harness (Tool)

- **Command:** `node bench/bench.js` (needs `npm i axe-core lighthouse` and the preinstalled Playwright Chromium).
- **What it runs:**
  1. Every flow suite.
  2. axe-core on 18 app screens × light/dark, plus the sign-up and log-in screens.
  3. A persistence round-trip.
  4. Lighthouse over a local HTTP server.
- **Output:** a PASS/FAIL scorecard plus `report.json`.

## 7. Flow suites (Tools)

| Suite | Covers |
|-------|--------|
| `tx-test` | Transactions table, detail, tags, hide and split |
| `rec-test` | Export CSV, add transaction, recurring, add/edit/delete recurring |
| `inv-test` | Reports, saved reports, Invest overview, holdings, Pro view |
| `mw-test` | Add holdings, market watch, holding detail, watchlist, earnings |
| `fc-test` | Forecast setup, events, saving a scenario |
| `eq-test` | Equity add flow, portfolio, vesting |
| `br-test` | Equity edit, equity in net worth, brokerage, bundles, estate |
| `will-test` | Full will creation and dashboard edits |
| `tax-test` | Estate summary, contacts, signed upload, tax filing, notifications |
| `st-test` | Settings panel, dark mode, profile and phone verification, risk, 2FA |
| `sp-test` | Spending settings, budget reset, review settings, rules, tags, delete account |
| `au-test` | Preview matches, logout, login with 2FA, wrong password, password reset |

## 8. Reference library (Knowledge)

There are 84 Origin web flows across 17 batches. The paths below are relative to the session scratchpad: `refN/Origin_Web_<Flow>/`.

| Batch | Flows |
|-------|-------|
| ref2 | Onboarding: add account, complete onboarding, connect, referral, subscribe |
| ref3 | AI advisor: chat, delete, favourite, rename |
| ref4 | Home: filter accounts, hide graph, privacy, weekly recap |
| ref5 | Spending: breakdown and budget, AI budget, daily brief, feedback |
| ref6 | Categories: detail, create category/group, edit budget, category budget |
| ref7 | Transactions: tag, hide, split, detail, list |
| ref8 | Transactions: create tag, edit, filter, search, update category |
| ref9 | Transactions: add transaction, recurring, export CSV, mark reviewed |
| ref10 | Reports and investing: holdings, investments, reports, saved view, Pro view |
| ref11 | Investing: add holdings, watchlist, holding detail, market watch, earnings |
| ref12 | Forecast and equity: forecast, create forecast, add event, equity, add equity |
| ref13 | Brokerage, edit equity info, estate planning, bundles, equity in net worth |
| ref14 | Will: create will, executors, assets, distributions, instructions |
| ref15 | Estate summary, contact info, signed upload, tax, notifications |
| ref16 | Settings, profile, risk assessment, 2FA, dark mode |
| ref17 | Rules, delete budget, delete account, spending settings, review settings |
| ref18 | Log in, log out, preview matches, reset password |

The scratchpad is temporary. Copy these images into the repo (e.g. `design/references/`) before relying on them long-term.

## 9. Platform map (Knowledge)

- **Global state:** `S`, saved to localStorage (`nw-app`, `nw-ob`, `nw-ai`, `nw-member`). Call `render()` after any state change.
- **Views (`S.view`):** `home`, `spending`, `invest`, `forecast`, `equity`, `brokerage`, `estate`, `tax`, `planner`, `settings`.
- **Tab keys:**

| Key | Values |
|-----|--------|
| `S.tab` | Overview, Breakdown & budget, Transactions, Recurring, Reports |
| `S.invTab` | Overview, Holdings, Market watch |
| `S.eqTab` | Overview, Portfolio |
| `S.brTab` | Overview, Explore Bundles |
| `S.esTab` | Overview, Summary, Community, Documents |
| `S.stTab` | profile, accounts, refer, security, docs, member, aiprof |

- **Overlays:**

| Type | Functions |
|------|-----------|
| Modals | `modal()`, `miniModal()` |
| Side panels | `drawer()` |
| Full-screen flows (`.wiz`) | `fcWizard()`, `willFlow()`, `mfaFlow()`, `resetFlow()`, `loginVerify()` |

- **Auth steps (`S.ob.step`):** `signup`, `login`, `account`, `refer`, `goals`, `connect`, `linked`, `source`, `done`.

## 10. Skills checklist (Skills)

- **UI parity:** spacing, type scale, field style, icon size, copy and step order match the reference.
- **States:** every list has an empty state, every form has validation and errors, and every async action has loading and success states.
- **Accessibility:**
  - Labels on all inputs, names on all icon buttons, and visible focus.
  - Contrast of 4.5:1 for text and 3:1 for UI parts.
  - Targets at least 24×24 px, everything works by keyboard, and Escape closes overlays.
- **Performance:** no layout shift on load, animations use transform and opacity only, and no long tasks on render.
- **Data:** every write is saved, survives a reload, and is reversible (undo or delete) where the reference allows it.
- **Security (prototype level):**
  - Escape all user text before inserting it into HTML.
  - Never store secrets in the code.
  - Plan for ASVS L1 once there's a back end.
- **Responsive:** no sideways scrolling at 390 px, and nothing off-screen.

## 11. Outputs

- `bench/report.json` holds the latest scorecard; `CHANGELOG.md` holds the cycle history.
- The published artifact is the live prototype.
