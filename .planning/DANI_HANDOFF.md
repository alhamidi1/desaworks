# DesaWorks V2 — Handoff to Dani (UI / Neumorphism-lite workstream)

Abdullah's backend/data workstream (`feature/v2-mis-core`) is done: DB migrations 003–008,
corrected metrics engine + decision layer, assignment lifecycle, manager-invite registration,
multi-village tenancy, and a realistic seed. **You can build the entire UI against the frozen
data shapes below using mock fixtures — no database access needed.**

## 1. Getting started
1. Pull `main` once Abdullah merges `feature/v2-mis-core` (ask him), then branch:
   `git checkout -b feature/v2-ux-neumorphic`
2. Get `.env.local` from Abdullah (Supabase URL + anon key) to run the app: `npm run dev`.
   You do **not** need the service-role key.
3. Build components against **`src/lib/fixtures/reports.fixtures.ts`** — realistic mock
   `ManagerDashboardReport`, `RevenueReport`, `ImpactReport`. Abdullah wires the real
   queries into the server `page.tsx` files and passes these exact shapes as props.
4. Your scope (unchanged from the plan): `src/app/globals.css`, everything in
   `src/components/`, the filter client-controls, `src/lib/i18n/*`, and
   `error.tsx`/`loading.tsx`/`not-found.tsx`. **Do not edit `src/lib/queries`,
   `src/lib/actions`, `supabase/`, or DB code** — that's Abdullah's.

## 2. Design system — build this first
Follow **Part C of `.planning/REFINEMENT_PLAN_V2.md`** ("Soft-UI / Neumorphism-lite,
high-clarity"). Key first task: promote the palette in `globals.css :root` into `@theme`
(so `bg-primary-*` utilities exist), add the `.nm-raised` / `.nm-inset` / `.nm-pressed`
tokens, then rebuild the component recipes (KPI card, buttons, inputs, nav, badge, alert
row, chart container). Retire the `slate`/`zinc` islands and the hardcoded hex.

## 3. Data contract (frozen — import from `@/lib/queries/reports`)
All exported as `type`/`interface` — safe to `import type` into client components.

| Query (Abdullah calls in the server page) | Returns | Feeds |
|---|---|---|
| `getManagerDashboardReport({range?, limit?})` | `ManagerDashboardReport` | Manager dashboard |
| `getProjectAnalyticsReport(projectId, {range?})` | `ProjectAnalyticsReport` | Performance report |
| `getRevenueReport({range?})` | `RevenueReport` | Revenue report |
| `getImpactReport()` | `ImpactReport` | Village-Head impact dashboard |

`ManagerDashboardReport` gives you: `kpis` (distinct active workers, weighted
`portfolioCompletion`, `utilizationRate`, delayed/atRisk/understaffed counts, totalRevenue),
`projects` (all, ranked by risk), `topProjects` (Top-N for charts), `alerts`, `recentActivity`,
`progressTrend` ({date, averageProgress}), `projectStatusDistribution` (zero-count buckets
already dropped), `timeline`. Each project metric carries `health`
(`on_track|at_risk|delayed|completed|inactive`), `completionPercentage`, `scheduleElapsedPct`,
`revenueVsBudgetPct`, `understaffed`.

## 4. The two lecturer fixes you own on every chart
- **Limits:** pin the completion axis to **0–100%**; format the revenue axis with
  `formatCurrency` (IDR) and a sensible domain; label units; add target/threshold reference lines.
- **Density + timeframe:** charts render `report.topProjects` (already Top-N), with a
  "View all" → paginated table for the long tail. Add a **timeframe selector** that writes a
  URL search param (`?range=7d|30d|90d|365d|all`) — Abdullah's server page reads `searchParams`
  and re-queries. Also `?limit=` for Top-N. The selector is a client control; it does not touch the DB.

## 5. Components to (re)build — Props are the fixture shapes
- **Charts** (`components/dashboard/*`, `components/reports/*`): consume the frozen shapes; kill the
  duplicate English internal headers; localize via the existing `chart:` / `status:` i18n keys;
  format date/month axes with `formatDate`; unify to the token palette; drop the redundant table
  under the completion chart.
- **New**: `AlertsPanel` (props: `report.alerts: DashboardAlert[]`), `ImpactDashboard`
  (props: `ImpactReport`), a health/RAG badge, and a workforce-utilization tile
  (`kpis.utilizationRate`).
- **Flows**: resident profile self-service (wire the orphaned `AvailabilityToggle` +
  `updateProfile`/`toggleAvailability`), real consent checkboxes, and the manager
  "Register Resident" + "Join Requests" screens (see §6).

## 6. Registration is now manager-invite (behavior change)
- Public `/register` → submits a **join request** (`POST /api/residents/register`), it no
  longer creates an account. Build it as a "request to join" form **with real ToS/Privacy
  checkboxes** (consent is now enforced server-side).
- Manager screens call these server actions (from `@/lib/actions/residents`):
  `inviteResident(input)` → returns `{ residentId, loginEmail, tempPassword }` (show the
  temp password once so the manager can relay it via WhatsApp), `listJoinRequests()`,
  `approveJoinRequest(id)`, `rejectJoinRequest(id)`.
- Lifecycle actions available to wire into buttons (`@/lib/actions/projects`):
  `updateProjectStatus` (cascades assignments), `completeAssignment(id)`. Workers hitting
  100% progress auto-complete their assignment.

## 7. New i18n keys to add (`src/lib/i18n/id.ts` + `en.ts`)
Alerts: `alert.delayed` ("Terlambat: {completion}% selesai vs {elapsed}% jadwal"),
`alert.understaffed` ("Kurang pekerja: {have}/{need}"), `alert.stale`
("Tidak ada update > {days} hari"), `alert.overBudget` ("Pendapatan {pct}% dari anggaran").
Health: `health.on_track` / `health.at_risk` / `health.delayed` / `health.completed` /
`health.inactive`. Plus keys for the impact tiles, the timeframe selector labels, and
**move all Zod validation messages into i18n** (they currently surface English). The existing
`status:` group already has localized project-status labels — use them in the pie chart.

## 8. Gotchas
- Multi-tenancy is live: everything is village-scoped by RLS automatically — you don't add
  village filters in the UI (the logged-in user only ever sees their village).
- `project_metrics_v` is a `security_invoker` view, so the metrics you receive already respect
  the caller's village.
- Charts must handle the empty-window case (selected range has no data) with a localized empty state.
