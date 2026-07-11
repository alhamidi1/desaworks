# DesaWorks V2 — Senior-Developer Refinement Plan

## Context

DesaWorks is a Community Resource Management System for BUMDes (Indonesian village-owned enterprises): it registers residents + skills, lets a manager create projects and allocate matched workers, tracks progress, and reports revenue. It was built by a 4-junior-dev team as a semester/expo prototype (Next.js 16 App Router, React 19, Tailwind v4, Supabase, Recharts, hand-rolled i18n).

**Why this refinement:** the lecturer criticized the graphs, and the prototype has deep logic/flow flaws that make its "insights" misleading. This plan turns it into a **credible, decision-driving MIS** with a **new UI**. Per the team lead's decisions:

- **Scope = production-leaning:** fix every logic/graph/flow flaw + add an MIS decision layer + a new UI system, **plus** real auth-linked resident registration, PII lockdown + genuine consent, and multi-village tenancy. Encryption / audit-log / automated tests are deferred to a backlog.
- **UI = "Soft-UI / Neumorphism-lite (high-clarity)"** — my recommended alternative to *pure* neumorphism (rationale in Part C). Keeps the soft, tactile, professional feel the team wanted, but stays readable for older / low-digital-literacy village users and passes WCAG AA.
- **Implementers = Abdullah + Dani only** for this update. Aldi & Kemal are on non-coding tasks; **their branches must stay untouched.**
- **Only Abdullah has Supabase access** (dashboard, migrations, service-role, MCP). So **all database work is Abdullah's** — migrations, RLS, seed, SQL views/RPCs, type generation, and the server-side data-fetching layer. **Dani builds presentation only** and never touches the DB; Abdullah shares `.env.local` (project URL + anon *publishable* key) so Dani can run the app locally, and Dani develops components against typed mock fixtures until Abdullah's queries land (see Part E).

**Priority tiers used throughout:** `[A]` = must-do MIS core, `[B]` = production-leaning additions, `[C]` = backlog/out-of-scope. Owner tags: `[ABD]` Abdullah, `[DANI]` Dani.

**Deliverable rule:** this is a plan only — no code is written yet. Abdullah + Dani execute it.

---

## Part A — Critical Assessment (confirmed flaws)

All items below were verified in code and against the **live** Supabase DB (ref `fktghaidkdrwjepvswfa`). The single most damaging fact: **the dashboards only look alive because of seed data.** Live data has assignments in `active`/`completed` and progress `completed` states, but **no application code path ever writes those** — so in real village use every lifecycle-based metric silently flatlines.

### A1. Data & metric logic (the "graphs are wrong" root cause)
| # | Flaw | Location | Impact |
|---|------|----------|--------|
| 1 | Assignment lifecycle dead-ends at `confirmed`; `active`/`completed`/`completed_at` never written | `lib/actions/projects.ts` (only sets `confirmed`/`void`) | Resident "Completed Projects" = always 0; "active" branches are dead |
| 2 | Completion % **drops** assignments with no progress and **ignores `workers_needed`** | `lib/queries/reports.ts:226-228,240` | A 1/5-staffed project reporting 80% shows **80% complete** |
| 3 | "Active Workers" **sums assignments across projects** (double-counts) and counts non-active statuses | `ManagerDashboard.tsx:23` | KPI overstates; contradicts the *distinct* count on the performance page |
| 4 | Portfolio averages are **unweighted** and include draft/cancelled (0%) projects | `ManagerDashboard.tsx:25-31`, `reports.ts` | A 50-worker and a 1-worker project weigh equally; averages skewed |
| 5 | "Budget utilization" is actually **revenue ÷ budget**, mislabeled; averaged incl. zero-budget projects | `reports.ts:386`, `revenue/page.tsx:42-52` | Misleading financial signal |
| 6 | Revenue can be **double-submitted** on the warning path (record inserted before warning shown; no idempotency) | `lib/actions/revenue.ts:160-181`, `RevenueForm.tsx:67-77` | Inflated revenue totals |
| 7 | Progress trend uses **UTC** date bucketing on `TIMESTAMPTZ` for WIB (UTC+7) users; naive mean of all raw updates | `reports.ts:248,316` | Updates before 07:00 WIB shift to the wrong day; jagged/misleading line |
| 8 | Dashboard aggregation = **full-table scans in JS**, re-run per project (up to ~12 full loads to render one report); zero SQL aggregation, no pagination | `reports.ts:126-153`, `getProjectAnalyticsReport`, `performance/page.tsx:59-63` | Will not scale past a few hundred rows |
| 9 | Non-transactional multi-writes (assignments+notifications, project+requirements); capacity check ignores existing confirmed assignments | `projects.ts:344-536,157-160` | Partial state; can exceed `workers_needed` |
| 10 | Recommendations + confirm run `detectSchedulingConflicts` **inside a per-resident loop** (N+1) | `lib/queries/recommendations.ts:263`, `projects.ts:389-399` | Slow assignment screens |

### A2. Database, security & data quality
- **Registration cannot create logins.** `createProfile` inserts into `profiles` with **no `id`**, no `auth.signUp`, and there is **no `handle_new_user` trigger**; profiles INSERT RLS is `WITH CHECK(auth.uid()=id)`. Result: self-registered residents can **never log in** — only pre-seeded accounts work. (`lib/actions/residents.ts:6-31`)
- **PII exposed to everyone.** `profiles` and `resident_skills` SELECT are `USING(true)` — any authenticated resident can read every other resident's phone, address, DOB, email, bio.
- **No tenant isolation.** No `village`/`organization` column anywhere → every manager sees all villages' data. Blocks the product as a multi-BUMDes system.
- **Live security advisors:** notifications INSERT policy is `WITH CHECK(true)` (anyone can spam any user); `update_updated_at_column` has a mutable `search_path`; leaked-password protection disabled.
- **Migration hygiene broken:** the DB migration table records **only** `20260707191836_fix_notifications_rls` — the initial schema (`001`) was applied out-of-band and is untracked. Performance advisors: unindexed FKs (`assignments.assigned_by`, `progress_updates.reported_by`, …), RLS re-evaluates `auth.uid()` per row, stale planner stats (never `ANALYZE`d).
- **Type drift.** `lib/types/database.ts` is hand-maintained: nullable DB columns typed non-null; `NUMERIC` (budget/amount/hours) returns as **string** but is typed `number` → latent string-concatenation bugs.
- **Unrealistic seed data.** Live revenue sum ≈ **IDR 1.0 trillion** (~$61M) — 3–4 orders of magnitude too high for a village enterprise. Fabricated consent (`agreed_to_tos:true` hardcoded).

### A3. Graphs / visualization (direct lecturer feedback)
- **Duplicate headers:** each chart renders a localized section title **and** its own hardcoded **English** title (e.g. `ProjectCompletionChart.tsx:60-62` "Analytics / Project completion"). On the manager dashboard an Indonesian title sits on top of an English one.
- **Charts ignore existing i18n:** `chart:` and `status:` keys already exist in `id.ts`/`en.ts` but no chart uses them.
- **Raw machine labels:** pie shows enum strings ("in_progress") incl. **zero-count** slices (`StatusDistributionChart.tsx:83`, `reports.ts:261`); axes show raw `YYYY-MM-DD` / `YYYY-MM` (`ProgressOverTimeChart.tsx:59`, `RevenueChart.tsx:63`).
- **Wrong analytical framing:** the "progress over time" line mixes all projects into one average; "active workers" shows two different numbers on two pages; trend arrows are **decorative** (`trend='up'` whenever count > 0 — no baseline).
- **Chartjunk & off-palette:** a redundant data table repeats the bar chart below it (`ProjectCompletionChart.tsx:104-114`); three unrelated color systems (teal / slate / zinc).
- **No clear limits (lecturer):** axes have no explicit bounds/units (completion isn't pinned 0–100%, revenue has no scaled IDR ticks), and there is **no cap on items** — every project becomes a bar, so ~100 projects render as an unreadable, dense chart. No target/threshold reference lines either.
- **No timeframe (lecturer):** no date-range filter or time-window selector anywhere; time-series show *all* history at one fixed granularity, so a manager can't ask "this month / last 30 days / this quarter," and sparse days look jagged.
- **Net effect:** the graphs don't help a manager *decide* anything — no targets, no health, no "what to do next."

### A4. UX, flow & consistency
- Self-registered residents hit a **dead end** (no account). `AvailabilityToggle` + the resident edit/update route exist but are **wired to no page** — residents can't set availability or edit skills, yet the recommender filters on availability. Consent is fabricated (no checkbox).
- **~50% of strings are unlocalized** (mostly English) despite complete dictionaries — all charts, `PerformanceTable`, `RevenueForm`, `AssignWorkersPanel`, `WorkerCard`, `ProjectStatusBadge` (Indonesian-only), `ProjectCard` (hardcoded `locale='id'`), the manager register page, and **every Zod message**.
- **Design system half-built:** tokens defined in `:root` but not promoted to Tailwind `@theme` → no `bg-primary-*` utilities → hex hardcoded everywhere; no shadcn/ui despite the docs claiming it.
- Missing `error.tsx` / `not-found.tsx` / `loading.tsx` / `middleware.ts` (no central session refresh). Test credentials shown **in production** (`login/page.tsx`). `public/logo.png` + `icon.png` unused; browser tab still shows the default Next favicon.

### A5. MIS gaps (why it's a prototype, not an MIS)
It records data and draws charts, but doesn't **guide decisions**: no project **health** (schedule vs progress), no **alerts** (at-risk / understaffed / stale / overloaded / skill-gap), no **workforce utilization** or **skill-coverage** analytics, no **participation-equity** view, and **no stakeholder/Village-Head impact dashboard** (a persona named in `PROJECT.md` that was never built).

---

## Part B — Target State: what "a real MIS" looks like

### B1. The decision layer (the heart of the upgrade) `[A]`
Every screen should answer **"what's the state, what's wrong, and what should I do?"** Add:

1. **Project Health (RAG):** compare *schedule elapsed %* vs *completion %*. `On-track` (completion ≥ elapsed − 10%), `At-risk` (10–25% behind), `Delayed` (>25% behind or past `end_date` and <100%). Drives color + sort order everywhere a project appears.
2. **Alerts panel** on the manager dashboard, each with a one-click action:
   - Understaffed: confirmed workers < `workers_needed`.
   - Unfilled skill gap: a required skill has no available matching resident → suggests training/recruitment.
   - Stale: no progress update in > N days (default 7).
   - Overloaded resident: assigned to ≥ 3 date-overlapping active projects.
   - Over-budget: revenue/cost signal beyond threshold.
3. **Workforce analytics:** utilization rate = distinct assigned residents ÷ total residents; **skill coverage/gap** = required-vs-available per skill; **participation equity** = distribution of assignments across residents (flag if few residents get most work — a governance concern for village fairness).
4. **Stakeholder / Village-Head impact dashboard (read-only):** residents employed, total income generated for the village, # active projects, participation breadth. Fulfills the third persona and is the "policy guidance" surface.
5. Keep + extend the existing **skill-match recommender** (`getWorkerRecommendations`) — it's the best decision tool already present; surface its score as a visual meter, not text.

### B2. Corrected metric dictionary `[A]` (single source of truth for both devs)
| Metric | Correct definition |
|--------|--------------------|
| Assignment status | `pending → confirmed → active → completed` (+`void`). `active` set when work starts (manual "Start" or on `start_date`); `completed` + `completed_at` set on "Mark done" or when latest progress = 100%. |
| Project completion % | `sum(latest progress per active/confirmed assignment) / (max(activeAssignments, workers_needed) × 100)`. Unfilled slots + no-progress assignments count as 0. Draft/cancelled excluded from portfolio rollups. |
| Active workers (KPI) | `COUNT(DISTINCT resident_id)` where status ∈ (`confirmed`,`active`). Never summed across projects. |
| Workforce utilization | `distinct assigned residents ÷ total residents` (also show ÷ available residents). |
| Portfolio completion | Mean **weighted by `workers_needed`**, over non-draft/non-cancelled projects only. |
| Revenue-vs-budget | `total revenue ÷ budget` — **rename** the label (it is not "utilization"); average only over projects with budget > 0. |
| Progress trend | Portfolio **weighted** completion per day, deduped to latest-per-assignment, bucketed in **WIB (UTC+7)**, with a straight-line **target** overlay. |
| Project health | schedule-elapsed% vs completion% → On-track / At-risk / Delayed (see B1.1). |

### B3. Graph redesign spec `[A][DANI]`
| Chart | Fix |
|-------|-----|
| Completion (bar) | RAG-colored bars, target reference line, localized labels, **remove** the redundant table beneath, one wrapper header only |
| Status distribution (donut) | Humanized **localized** labels via `status:` keys, **drop zero-count** slices, count + % in legend |
| Progress over time (area) | Weighted portfolio completion, WIB buckets, target line, axis via `formatDate` |
| Revenue (area/bar) | **Realistic IDR**, revenue-vs-budget grouped bars, IDR-formatted axis (`formatCurrency`), cumulative + monthly toggle |
| **NEW** Workforce utilization + skill-gap | Utilization gauge + horizontal bar of required-vs-available per skill |
| All | One header (kill internal English headers), system palette, colorblind-safe categorical set, localized empty/loading states, units on every axis |

**Cross-cutting chart requirements — directly answering the lecturer's "no limits, no timeframe" critique** `[A]`:
- **Explicit limits & units on every axis:** completion axis fixed **0–100%**; revenue axis uses scaled, `formatCurrency`-formatted IDR ticks with a sensible domain; every axis carries a unit label. Add **target/threshold reference lines** (100% goal, budget line) so a value has meaning.
- **Density control for large N (the "100 projects" problem):** never plot all projects. Categorical charts render **Top-N** (default 8, ranked by health-risk or recency) **+ an "Others" aggregate**, with a "View all" link to a **paginated/sortable table** for the long tail. For portfolio-scale views, show a **distribution** (RAG-bucket histogram) instead of one-bar-per-project. Horizontal scroll is a last resort, not the default.
- **Timeframe selector (global):** a date-range control — **This week / This month / This quarter / This year / Custom** — filters all time-based charts *and* KPIs. Implemented via a **URL search param** (`?range=30d`) so the server component re-fetches (the selector needs no DB access). Time-series x-axis domain = the *selected window* (timeframe always visible even when data is sparse), and **bucket granularity adapts**: daily ≤ 31 days, weekly ≤ ~26 weeks, monthly beyond.
- **Empty-window state:** if the selected range has no data, show a clear localized empty state, not a blank/broken chart.
- **Query contract:** all report queries accept `{ range, limit/pageSize, projectId? }` and do **range-filtering, bucketing, and Top-N server-side** (Abdullah's layer) so the client never over-fetches — this also fixes the full-table-scan issue (A1.8).

---

## Part C — UI / Design System: "Soft-UI / Neumorphism-lite (high-clarity)"

**Why not pure neumorphism:** pure neumorphism makes controls the *same* color as the background, distinguished only by faint shadow. For older / low-digital-literacy village users on cheap phones in daylight, that's hard to see and fails WCAG AA contrast — the opposite of what an MIS for this audience needs.

**The recommended strategy** keeps neumorphism's *soft, tactile, calm, premium* feel where it's safe (surfaces, inputs, nav) but makes **anything the user must read or tap high-contrast and clearly bounded.** It's "clean and professional, not too complex," and it maps cleanly onto the tokens the team already defined.

**Principles:** (1) soft raised surfaces for containers; (2) inset "wells" for inputs and pressed states (this is where neumorphism genuinely helps); (3) **solid, filled, high-contrast** primary actions and text — never soft; (4) data/graphs always full-contrast + labeled; (5) icons always paired with text labels; (6) generous type + 44px targets; (7) WCAG AA min, `prefers-reduced-motion` respected.

### C1. Tokens → promote into Tailwind `@theme` `[DANI]` (`src/app/globals.css`)
The current palette lives in `:root` but isn't in `@theme`, so `bg-primary-*` utilities don't exist. Move the scales into `@theme` so utilities generate, then add the soft-shadow system:

```css
@theme {
  /* promote existing primary-50..900 + neutral + semantic so bg-primary-500 etc. exist */
  --color-primary-500: #05c8ae;  --color-primary-600: #00a18f; /* …full scale… */
  --color-surface:      #eceff3;   /* page base — mid-light so both shadows read */
  --color-card:         #f4f6f9;   /* raised surface (slightly lighter than base) */
  --color-ink:          #1a1d23;   /* AA body text */
  --color-ink-soft:     #5b6068;   /* AA secondary text (darker than today's #868e96) */
  /* semantic, AA-contrast on light surfaces */
  --color-success: #0f9d76; --color-warning: #c2740a; --color-danger: #e11d48; --color-info: #2563eb;
  /* Neumorphism-lite dual shadows */
  --nm-raised: 6px 6px 14px rgba(163,177,198,.45), -6px -6px 14px rgba(255,255,255,.85);
  --nm-raised-sm: 3px 3px 8px rgba(163,177,198,.40), -3px -3px 8px rgba(255,255,255,.85);
  --nm-inset: inset 4px 4px 8px rgba(163,177,198,.42), inset -4px -4px 8px rgba(255,255,255,.90);
}
/* utility classes */
.nm-raised { background: var(--color-card); border: 1px solid rgba(255,255,255,.6); box-shadow: var(--nm-raised); border-radius: var(--radius-lg); }
.nm-inset  { background: var(--color-surface); box-shadow: var(--nm-inset); border-radius: var(--radius-md); }
.nm-pressed:active { box-shadow: var(--nm-inset); }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
```
Also: remove the dead `--font-geist-mono` reference; retire `.glass`/`.glass-dark` glassmorphism in favor of the neumorphic system; keep `.touch-target`, safe-area, and range-slider styles.

### C2. Component recipes `[DANI]`
- **Card / KPI stat:** `.nm-raised` container; big AA-contrast value; label in `--color-ink-soft`; a real delta ("+2 this week") only when a baseline exists — **remove decorative arrows**.
- **Primary button:** solid `bg-primary-600 text-white` + `--nm-raised-sm`, `.nm-pressed` on press. **Secondary:** `.nm-raised` neutral surface + `text-ink`. Both ≥ 44px.
- **Input / select / textarea:** `.nm-inset` well + visible border + teal focus ring (already global). Big labels above (never placeholder-only).
- **Nav (sidebar/bottom bar):** raised bar; active item = inset well + primary text/icon (clear "you are here").
- **Status badge:** solid semantic bg + AA text, localized label.
- **Alert row:** left semantic accent bar + icon + text + action button.
- **Chart container:** `.nm-raised` with one localized title, legend, and formatted axes.

### C3. Accessibility & audience rules `[DANI]`
AA contrast on all text/controls; icon **+** text everywhere; 44px targets; localized empty/error/loading states; dynamic `<html lang>`; wire `public/logo.png` (auth + sidebar) and `public/icon.png` (favicon via `app/icon.png` metadata). Dark-mode tokens = `[C]` backlog (neumorphism dark needs its own shadow set).

---

## Part D — Feature changes: Add / Modify / Remove

### Add
`[A]` Assignment lifecycle actions (Start / Mark-done writing `active`/`completed`/`completed_at`) · Project Health (RAG) · Alerts panel · Workforce utilization + skill-gap analytics · Village-Head impact dashboard · realistic demo seed (sane IDR, full lifecycle) · Soft-UI/Neumorphism-lite design system · redesigned + 1 new chart · **global timeframe filter + Top-N density controls** · `error.tsx`/`not-found.tsx`/`loading.tsx` · logo/favicon wiring · localized empty/loading states.
`[B]` Real auth-linked registration (`handle_new_user` trigger + `auth.signUp` self-signup + manager server-side invite) · resident profile self-service (edit skills + availability) · genuine consent checkboxes · `villages` table + multi-tenant `village_id` scoping · SQL aggregation views/RPCs + FK indexes · `middleware.ts` session refresh.
`[C]` Column encryption · audit log · automated test suite · offline/push · Dukcapil.

### Modify
`[A]` `lib/queries/reports.ts` (all metric formulas per B2) · `ManagerDashboard.tsx` (distinct workers, weighted completion, tokens not hex, real deltas) · all charts (localize via existing `chart:`/`status:` keys, humanize, format axes, unify palette, drop zero slices + redundant table) · finish i18n (charts, tables, `RevenueForm`, `AssignWorkersPanel`, `WorkerCard`, `ProjectStatusBadge`, `ProjectCard`, manager register page; move **Zod messages** into i18n keys) · unify `slate`/`zinc` → tokens · revenue submit idempotency + warning-path UX · `confirmAssignments`/`createProject` wrapped in RPC/transaction + capacity counts existing.
`[B]` RLS: scope `profiles`/`resident_skills` SELECT to same-village/role; restrict notifications INSERT · fix `update_updated_at_column` search_path · `database.ts` nullability + `NUMERIC` handling (prefer Supabase-generated types) · dynamic `<html lang>`.

### Remove
Test credentials shown in production (`login/page.tsx`) · redundant table under `ProjectCompletionChart` · dead status branches (`on_hold`, unreachable `active`/`completed`) · fabricated `agreed_to_tos/privacy` hardcoding · glassmorphism helpers (replaced) · default Next scaffold SVGs + default favicon · unrealistic seed magnitudes · dead `--font-geist-mono` · ad-hoc root debug scripts (`query-db.js`, `test-*.js`) untracked/moved to `scripts/`.

---

## Part E — Git & Team Execution Plan (Abdullah + Dani)

### E0. Git reality & rules
- Branches today: `main` (**2 unpushed commits** ahead of origin = the two logo commits), `feature/dani-monitoring-reports` (**1 unmerged commit `8328cf8`** — useful localization + validation fixes), `feature/aldi-workforce-registration` (1 stale unmerged commit), `feature/kemal-project-assignment` (fully merged). 3 worktree *directories* are already deleted (prunable) but branches are intact.
- **Rules:** Do **not** delete or `git branch -d` Aldi's/Kemal's branches; do **not** run `git worktree prune` (leave their metadata alone). Work only on two new branches. Small conventional commits; update `worklogs/` per repo convention; PR into `main`.

### E1. Pre-flight (do first, together)
1. `[ABD]` Push `main`'s 2 logo commits to `origin/main` so everyone starts synced.
2. `[ABD]` Review `feature/dani-monitoring-reports` tip `8328cf8`; if the localization/validation fixes are wanted, merge (or cherry-pick) it into `main` **before** branching, so V2 starts from the best base.
3. `[ABD]` Commit the pending `.gitignore` change.
4. Create the two work branches from updated `main`:
   - `[ABD]` `feature/v2-mis-core` (data, logic, security, auth, tenancy, migrations).
   - `[DANI]` `feature/v2-ux-neumorphic` (design system, charts, dashboard/report UI, i18n, flows).

### E2. Split rationale & interface contract
Split **by layer**, forced cleanly by the fact that **only Abdullah can reach Supabase**:
- **Abdullah = everything that touches the DB:** `supabase/` migrations, RLS, seed, SQL views/RPCs, type generation, all of `lib/actions/` + `lib/queries/`, auth/tenancy, **and the server-component data-fetching in `page.tsx` files** (the code that calls queries and reads `searchParams`).
- **Dani = presentation only:** `globals.css` design system, all `components/` (charts, cards, forms, selectors, alerts panel, impact-dashboard UI), the **timeframe/filter client controls** (which only update the URL search param), `lib/i18n/*` dictionaries, and `error.tsx`/`loading.tsx`/`not-found.tsx`. Dani never edits DB code.
- **Seam 1 — data shape:** Abdullah **freezes the return types** of `lib/queries/reports.ts` in Phase 0 and hands Dani typed **mock fixtures** matching them. Dani builds every component against fixtures and is *never blocked* by lacking DB access; Abdullah then wires the real query into the server page and passes props to Dani's client component.
- **Seam 2 — filtering:** the timeframe/Top-N selectors are Dani's client controls that write `?range=…&limit=…` to the URL; Abdullah's server component reads `searchParams` and calls the query. No shared mutable state, no DB access on Dani's side.
- **Seam 3 — i18n:** Dani owns the dictionaries; when Abdullah needs a new key (e.g., a server-side error message) he requests it in the PR.
- **Env:** Abdullah shares `.env.local` (URL + anon publishable key) so Dani can run `npm run dev` against the shared DB (reads honor RLS); any state Dani needs for visual testing (e.g., a 100-project stress set) is seeded by Abdullah.

**Sequencing — Abdullah-first, Dani-async (recommended given the DB-access constraint):** Abdullah can complete his **entire** part first and merge, with Dani starting his whenever he wants. Abdullah's layers have **no upstream dependency on Dani's UI**, and finishing first means the data contract is *finalized* (no moving target). To keep it clean:
- Abdullah keeps the app runnable by **leaving existing components in place** (don't delete old UI); Dani replaces them one by one later.
- Abdullah tests his side without Dani by **editing the URL param by hand** (`?range=30d&limit=8`) instead of the not-yet-built selector.
- On finishing, Abdullah merges `feature/v2-mis-core` → `main` and leaves Dani a **handoff bundle**: (1) frozen `reports.ts` return types, (2) a `*.fixtures.ts` mock per component, (3) the `searchParams` convention (`range`, `limit`), (4) a TS `Props` interface for every component Dani must build, (5) a list of new i18n keys added. Dani then branches from the updated `main` and builds UI entirely against fixtures — no DB access needed.

### E3. Phased sequence (dependencies matter)

**Phase 0 — Foundations (parallel, unblock everything)**
- `[DANI]` Land the design tokens in `@theme` + `.nm-*` utilities + component recipes (Part C1/C2) and merge to `main` fast, so all later UI builds on real utilities. Wire logo/favicon.
- `[ABD]` Write migration `003_lifecycle_and_integrity.sql`: add assignment lifecycle transitions support, `handle_new_user` trigger, FK indexes, fix `update_updated_at_column` search_path, `ANALYZE`. **Track it properly** via Supabase migrations. Freeze the new `reports.ts` return types (types only) and share with Dani.

**Phase 1 — MIS core logic `[A]`**
- `[ABD]` Rewrite `reports.ts` per the B2 metric dictionary (fix completion, distinct active workers, WIB bucketing, weighted rollups, rename revenue-vs-budget, dedupe latest-per-assignment). Add lifecycle actions (Start / Mark-done) in `lib/actions/projects.ts`; capacity counts existing; wrap multi-writes in an RPC/transaction; revenue idempotency guard.
- `[ABD]` Build health (RAG) + alerts computation + workforce/skill-gap aggregation (prefer SQL views/RPCs for scale).
- `[ABD]` Add `{ range, limit, projectId? }` params to the report queries with **server-side range-filtering, adaptive bucketing, and Top-N**; server pages read `searchParams` and pass typed props down.
- `[DANI]` Redesign every chart per B3 **+ the cross-cutting limits/timeframe rules** against the frozen types + fixtures; add the new utilization/skill-gap chart; build the **timeframe + Top-N selectors** (URL-param client controls); verify density with a ~100-item mock fixture; localize all chart text via existing `chart:`/`status:` keys; fix `ManagerDashboard.tsx` (tokens, real deltas, one header each).

**Phase 2 — Flows, auth & i18n `[A]/[B]`**
- `[ABD]` `[B]` Real registration: `auth.signUp` self-flow + manager server-side invite (service-role client, **server-only**); consent captured for real; resident account activation. Remove fabricated consent.
- `[DANI]` `[A]` **Presentational** build-out (against fixtures): profile self-service form + `AvailabilityToggle`, consent checkboxes, Village-Head impact dashboard, alerts panel; finish the remaining ~50% i18n incl. moving Zod messages to i18n keys; unify `slate`/`zinc` → tokens; add `error.tsx`/`not-found.tsx`/`loading.tsx`; gate test creds to non-prod.
- `[ABD]` Wire the server pages + data for the above (profile fetch, `updateProfile`/`toggleAvailability`, impact + alerts queries) and pass typed props into Dani's components.

**Phase 3 — Tenancy & hardening `[B]`**
- `[ABD]` `villages` table + `village_id` on profiles/projects; backfill a default village; rewrite RLS to scope by the caller's village and lock down `profiles`/`resident_skills` SELECT + notifications INSERT; `middleware.ts` for session refresh; regenerate `database.ts` types via Supabase.
- `[DANI]` Village context in the UI (label/selector where relevant); visually verify every list respects tenant scoping; provide the Indonesian/English copy for seed content.
- `[ABD]` Author the realistic bilingual **seed** (sane IDR magnitudes, full lifecycle) + a large-N stress set (~100 projects) for chart-density integration testing.

**Phase 4 — Integrate, verify, demo `[A]`**
- Both: merge both branches to `main` via PRs (Dani's design-system PR first if not already), reconcile the `reports.ts`↔charts seam, run Part F end-to-end, clear Supabase advisors, record a clean demo walkthrough for the expo.

### E4. Daily discipline
Pull `main` daily; keep PRs small and reviewable; never touch Aldi's/Kemal's branches; update `worklogs/abdullah_worklog.md` / `worklogs/dani_worklog.md` after each significant step (repo convention).

---

## Part F — Verification (end-to-end)

Run locally: `npm run dev` (Next 16). For each change, **drive the real flow and check the number against the DB**, not just types.

1. **Seed & lifecycle:** load realistic seed; as a manager create → open → confirm → **start** → **complete** a project; confirm `assignments.status`/`completed_at` advance and the resident's "Completed" KPI increments (proves A1.1 fixed).
2. **Metrics truth-check:** for one project, compute expected completion / active-workers / revenue-vs-budget by hand from `execute_sql` counts and confirm the dashboard matches (proves B2). Confirm portfolio average is weighted and excludes draft/cancelled.
3. **Graphs (lecturer fixes):** every chart has one localized title, humanized labels, **explicit axis limits + units** (completion pinned 0–100%, IDR-scaled revenue), target/reference lines, no zero-count slices, no redundant table; toggle ID⇄EN and confirm charts + Zod messages translate; WIB bucketing correct across a pre-07:00-WIB update.
   - **Density:** load the ~100-project stress set and confirm charts stay readable (Top-N + "Others" + "view all" table), not a dense wall of bars.
   - **Timeframe:** change the range selector (week/month/quarter/custom) and confirm the data, x-axis window, and bucket granularity all update via the URL param; an empty range shows a localized empty state.
4. **Registration/auth `[B]`:** self-register a resident → they can **log in** → set availability → appear in recommendations. Manager invite path works. Consent is real (unchecked = blocked).
5. **Security/tenancy `[B]`:** as resident, confirm you **cannot** read another resident's PII; as manager in village A, confirm village B's data is invisible; run `get_advisors` (security + performance) and confirm the notifications-INSERT, search_path, and unindexed-FK findings are cleared; `ANALYZE` done.
6. **UI/a11y:** at 375px, sidebar/bottom-nav, 44px targets, AA contrast on text/buttons, reduced-motion respected, logo + favicon show.
7. **Perf:** dashboard/report render issues a bounded number of queries (no per-project full-table reloads).

---

## Part G — Out of scope (backlog `[C]`)
Column-level encryption (pgcrypto), audit trail, automated test suite (no test runner exists today), dark mode, offline/PWA, push notifications, Dukcapil national-ID integration, full UU PDP legal compliance. Track in `.planning/` for a future milestone.

---

## Suggested first actions after approval
1. I save this plan into the repo as `.planning/REFINEMENT_PLAN_V2.md` (and optionally add the metric-dictionary + design tokens as their own referenceable docs).
2. I produce a **clickable Soft-UI/Neumorphism-lite mockup** (single self-contained HTML, using the Part C tokens) so you and Dani can see the target look before building — optional but recommended for the expo.
3. Abdullah runs the Phase 0 / E1 pre-flight git steps; Dani starts the design-system foundation.
