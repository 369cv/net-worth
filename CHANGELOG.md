# Changelog: Self-Healing Loop

Each entry records the benchmark before and after a cycle, what changed, and what is still open. The gates are defined in `HEALING_LOOP.md` §4, and `bench/bench.js` runs them.

## 2026-11-20: Cycles 1–4 (artifact v33 → v35)

### Scorecard by pass

| Gate | Pass 1 | Pass 3 | Pass 4 |
|------|--------|--------|--------|
| Functional flows | 9/12 | 7/13 | **13/13** |
| WCAG 2.2 AA (axe critical/serious) | 95 rules / 642 nodes | **0** | **0** |
| Lighthouse Accessibility | 74 | **100** | **100** |
| Lighthouse Best Practices | 85 | **100** | **100** |
| Lighthouse Performance | 91 | 92 | **97** |
| Lighthouse SEO | 90 | 90 | **90** |
| LCP | 1367 ms | 1329 ms | **1031 ms** |
| CLS | 0.002 | 0.002 | **0.002** |
| Console errors | 0 | 0 | **0** |
| Persistence (reload, logout → login) | pass | pass | **pass** |

Pass 4 result: **BENCHMARK: PASS**.

### Changes

- **Accessibility:**
  - Darkened the muted text token in light and dark mode.
  - Fixed the sidebar text in dark mode, which was nearly invisible.
  - Fixed hard-coded greys: section labels, hidden rows, past days, badges, the login screen.
  - Added an automatic accessible-name pass for icon buttons, inputs and selects.
  - Set the page language and a meta description.
  - Raised small targets to 24 px minimum.
- **Guided tour:**
  - 13 steps covering the whole platform, with a spotlight and plain-language cards.
  - Back, Next, Skip, arrow keys, Escape and a focus trap; respects reduced motion.
  - Starts automatically once, right after onboarding, and can be replayed from **?** → "Take the guided tour".
- **Comment fixes:**
  - The greeting header wraps instead of clipping.
  - Brokerage card buttons no longer wrap.
  - The equity ring no longer spins its text.
  - The spending comparison line is dashed again.
  - The "vs October" button is outlined.
  - The upcoming-transactions grid is bordered.
  - The Recurring calendar, summary, arrows and icons match the reference.
  - The net worth ⋮ menu closes when you change pages, and its privacy icon is fixed.
- **Harness:** the flow tests were brought up to date for the current flows, a tour test was added, and pages are tested exactly as published.

### Open items

- **Financial planner:** no reference provided; waiting on the user's upload.
- **Lighthouse informational audits:** `meta-description` fails because the publish wrapper places meta tags in the body, and `valid-source-maps` is not applicable to inline code. Neither blocks a gate.
- **Back-end gates:** OWASP ASVS L1, API contract tests and INP field data are deferred until a real back end exists.

## 2026-11-20: Cycles 5–8 (artifact v36 → v38)

- **Click-everything smoke test** (`bench/flows/smoke-test.js`): clicks every visible button on 22 screens, 589 clicks in total. It found three real bugs, all fixed:
  - The header gift ("Refer friends") button crashed silently. It now opens Refer friends.
  - Copy link failed inside the artifact frame because the clipboard is blocked there. It now falls back to a method that works.
  - The show-password eye buttons on the Security tab threw errors. They now work.
- **Greeting:** if the saved first name is two letters or fewer and the email starts with it, the greeting uses the email name instead (e.g. "Baha").
- **Will plan photo:** uses the family image from the private-beta assets, served as a separate file (`family.jpg`) so the page stays light.
- **Benchmark:** passes 6, 7 and 8 all PASS, with 14/14 suites, axe 0, Lighthouse A11y 100, Best Practices 100, Performance 90–91, SEO 90, LCP ≤ 1.5 s and CLS 0.002. Passes 7 and 8 ran on the published builds (v37, v38), giving two passes in a row, so the loop stopped.
- **Open:** the Financial planner reference has not been uploaded yet.
