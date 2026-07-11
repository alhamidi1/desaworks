# Work Log — Abdullah (Team Leader)
> **Student ID:** 24523229
> **Role:** Team Leader — Foundation, Integration, Deployment
> **Branch:** `main`
> **AI Agent:** Antigravity (Google Gemini)

<!-- 
AGENT INSTRUCTIONS: After every significant action (creating files, making decisions, 
running commands, fixing bugs, merging branches), append a new entry to this file using 
the format below. Do not delete previous entries. This log is part of the assignment report.
-->

---

## Session 1 — 2026-06-11

### Action: Project Initialization
- **AI Agent Used**: Antigravity (Google Gemini)
- **Prompt Given**: "Analyze the ISD project guide and help me initialize the DesaWorks project with Git worktrees for parallel team development"
- **Result**: Created Next.js 15 project with TypeScript, Tailwind, Supabase. Generated all GSD planning artifacts (PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md). Created database schema migration with 9 tables, RLS policies, indexes, and seed data. Created individual plan files for all 3 team members.
- **Decisions Made**: 
  - Tech stack: Next.js 15 + Supabase + TypeScript (instead of PHP/XAMPP)
  - Deployment: Vercel + Supabase (instead of local server)
  - Abdullah as team leader (changed from Aldi)
- **Files Changed**: All project files created from scratch
- **Commit**: Initial commit — project scaffold + planning artifacts

---

<!-- Add new entries below this line -->

## Session 2 — 2026-06-11

### Action: Feature Integration, Routing Fixes, Data Seeding, and Report Generation
- **AI Agent Used**: Antigravity (Google Gemini)
- **Prompt Given**: "dani made new commit pull it and compine it to the main" (along with earlier instructions for merges and report generation)
- **Result**:
  - Merged Aldi's `feature/aldi-workforce-registration` branch and fixed Next.js 15 routing (moving routes to `src/app/` and resolving async params).
  - Merged Kemal's `feature/kemal-project-assignment` branch, resolving conflicts in `src/app/(dashboard)/projects/[id]/page.tsx` and adding the secure login redirect page.
  - Set up a full PostgreSQL database seed script (`supabase/seed.sql`) containing high-fidelity mock data.
  - Fetched and merged Dani's latest styling fixes on the project completion chart (truncation and hover tooltips for overlapping X-axis labels).
  - Verified local compilation with `npm run build` passing cleanly.
  - Pushed all merged changes to remote `main` branch to trigger Vercel deployment.
  - Formatted and compiled the final academic report (`DesaWorks_Final_Report.docx`) based on the lecturer's template.
- **Decisions Made**:
  - Preferred Kemal's `projects/[id]/page.tsx` containing the interactive worker assignment flow over Dani's analytics preview, integrating Dani's analytics tools into the dashboard.
  - Chose to truncate project labels in the bar chart to 15 characters with tooltips to maintain chart aesthetics without wrapping.
- **Files Changed**:
  - [ProjectCompletionChart.tsx](file:///Users/abdullah/Desktop/DesaWorks/main_abdul/src/components/dashboard/ProjectCompletionChart.tsx)
  - [abdullah_worklog.md](file:///Users/abdullah/Desktop/DesaWorks/main_abdul/worklogs/abdullah_worklog.md)
- **Commit**: `09dfa51` (merge: Dani's latest monitoring fixes)

---

## Session 3 — 2026-07-03

### Action: Compilation Fixes & Type Safety Resolution
- **AI Agent Used**: Antigravity (Google Gemini)
- **Prompt Given**: "fix it fast" (pointing to build failures in terminal)
- **Result**:
  - Diagnosed and fixed syntax typo in `src/app/page.tsx` (`proimport` -> `import`).
  - Identified package typing resolution error in `react-hook-form` v7.78.0 (incomplete release lacking internal declaration source directories, breaking build-time type checks).
  - Reinstalled and locked `react-hook-form` to stable version `7.54.2`, resolving all compiler errors.
  - Verified compilation by running `npm run build` which succeeded cleanly in 3.5s.
- **Decisions Made**:
  - Replaced buggy `react-hook-form` release with stable `7.54.2` rather than modifying tsconfig path maps.
- **Files Changed**:
  - [page.tsx](file:///Users/abdullah/Desktop/DesaWorks/project/src/app/page.tsx)
  - [package.json](file:///Users/abdullah/Desktop/DesaWorks/project/package.json)
  - [package-lock.json](file:///Users/abdullah/Desktop/DesaWorks/project/package-lock.json)

---

## Session 4 — 2026-07-12

### Action: V2 Refinement — Senior review + Phase 0 foundation
- **AI Agent Used**: Claude (Opus)
- **Prompt Given**: "Full senior-developer refinement of the project — fix logic/graph/flow flaws, turn the prototype into a real MIS, add a new UI, and execute my (Abdullah's) part phase by phase."
- **Result**:
  - Produced the full refinement plan at `.planning/REFINEMENT_PLAN_V2.md` (flaw assessment verified against code + live Supabase, MIS decision layer, corrected metric dictionary, graph redesign incl. lecturer's limits/timeframe fixes, Soft-UI/Neumorphism-lite design system, Add/Modify/Remove list, Abdullah↔Dani execution plan).
  - Created branch `feature/v2-mis-core` for the backend/data workstream (only Abdullah has Supabase access; Dani builds presentation independently against fixtures).
  - **Phase 0 migration `003_foundation_auth_and_perf`** applied to Supabase and verified:
    - `handle_new_user` trigger auto-creates a `profiles` row on `auth.users` INSERT — **fixes the registration dead-end**. Smoke-tested: profile created, consent captured, and a client-supplied `role: manager` was correctly forced to `resident` (privilege-escalation guard).
    - Added covering indexes on the 4 unindexed FKs; pinned `search_path` on both trigger functions; revoked API `EXECUTE` on the SECURITY DEFINER trigger fn; ran `ANALYZE`.
    - Advisors cleared: `function_search_path_mutable` and both `*_security_definer_function_executable`. Remaining (deferred to Phase 3 / manual): notifications `WITH CHECK(true)` INSERT policy, leaked-password protection toggle.
- **Decisions Made**:
  - UI direction: **Soft-UI / Neumorphism-lite (high-clarity)** instead of pure neumorphism (accessibility for low-literacy village users).
  - Scope: **production-leaning** (real auth registration + PII lockdown + multi-village tenancy), tiered A/B/C.
  - `handle_new_user` never trusts client-supplied role — residents only; managers promoted separately.
- **Files Changed**:
  - `.planning/REFINEMENT_PLAN_V2.md` (new)
  - `supabase/migrations/003_foundation_auth_and_perf.sql` (new)
  - `.gitignore`

---

## Session 5 — 2026-07-12

### Action: V2 Phase 1 — Metrics engine + assignment lifecycle
- **AI Agent Used**: Claude (Opus)
- **Result**:
  - **Metrics engine (migration 004 `project_metrics_v` + `reports.ts` rewrite):** single SQL view is now the source of truth for per-project metrics (distinct workers, workers_needed-weighted completion, schedule-vs-progress RAG health, revenue-vs-budget). `reports.ts` consumes the view and adds the decision layer — portfolio KPIs, alerts (delayed/understaffed/stale/over-budget), Top-N density control, and `{range, limit}` time-window params with WIB (UTC+7) day bucketing. Replaces the old full-table-scan-per-project pattern. Verified view math against live data; fixed dashboard/revenue/resident KPI computations (distinct active workers, weighted completion, exclude void hours).
  - **Assignment lifecycle (migrations 005/006):** `set_project_status` RPC atomically changes project status AND cascades assignments (in_progress→active, completed→completed+timestamp, cancelled→void). `complete_assignment` SECURITY DEFINER RPC (with in-body authz) lets managers OR the assigned resident complete an assignment; wired into a new `completeAssignment` action and into `submitProgressUpdate` (reaching 100% auto-completes). **This is what finally produces the active/completed states the metrics need in real use (flaw #1).** Verified cascade end-to-end.
  - **Write integrity:** capacity check now counts already-occupied slots; assignment-confirmation notifications are best-effort (won't fail committed assignments); revenue submit has a 2-minute idempotency guard against double-counting; progress duplicate-guard now uses WIB day bounds.
  - `tsc --noEmit` clean throughout.
- **Files Changed**:
  - `supabase/migrations/004_metrics_view.sql`, `005_assignment_lifecycle.sql`, `006_complete_assignment.sql` (new)
  - `src/lib/queries/reports.ts` (rewrite)
  - `src/lib/actions/{projects,progress,revenue}.ts`
  - `src/components/dashboard/ManagerDashboard.tsx`, `src/app/(dashboard)/{dashboard,reports/revenue}/page.tsx`

