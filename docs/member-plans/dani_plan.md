# Dani's Development Plan — Project Monitoring & Revenue Tracking

> **Owner:** Dani (24523207)
> **Branch:** `feature/dani-monitoring-reports`
> **Phase:** 4 — Monitoring & Reports
> **PRD Features:** FR-M03, FR-M05, FR-R03
> **Requirements:** F07, F08, F09

---

## 🎯 Your Mission

You are building **Process 3: Project Monitoring & Revenue Tracking** — the system that lets workers report progress on their assignments and provides managers with dashboards and financial reports. This is the analytics and reporting layer of DesaWorks.

---

## 📋 What You Must Build

### Feature F07: Work Progress Recording
- **Page:** `/dashboard/my-assignments` (worker view)
- Workers can see their active assignments
- For each assignment, workers can submit progress updates:
  - Progress percentage (0–100%)
  - Status (not_started / in_progress / completed)
  - Description of work done
  - Hours worked
- **Validations:**
  - Progress percentage cannot go backwards (new update must be ≥ previous)
  - Duplicate submission detection (same assignment, same day, same percentage → prompt to confirm or edit)
  - Required fields must be filled
- Draft auto-save: if submission fails (e.g., network), save locally and retry
- Data saved to `progress_updates` table

### Feature F08: Manager Project Dashboard
- **Page:** `/dashboard/projects/[id]` (enhanced with analytics — coordinate with Kemal's page)
- **Page:** `/dashboard` (main dashboard overview for managers)
- Dashboard shows:
  - Active projects with completion percentage (aggregate from progress_updates)
  - Number of assigned workers per project
  - Timeline visualization (start date → current progress → end date)
  - Recent activity feed (latest progress updates across all projects)
- Charts using **Recharts**:
  - Bar chart: project completion comparison
  - Line chart: progress over time
  - Pie chart: project status distribution

### Feature F09: Revenue & Performance Reports
- **Page:** `/dashboard/reports`
- Manager can record revenue per project:
  - Amount, description, date
  - Abnormal amount detection: if revenue exceeds budget by >150%, show a warning
- Auto-generated reports:
  - **Project Performance Report:** completion %, worker contributions, time spent
  - **Revenue Summary:** total revenue per project, monthly trends
  - **Worker Contribution Report:** hours worked, tasks completed per worker
- Reports should be viewable on-screen with charts
- Export to CSV option (nice-to-have)

---

## 🗂️ Files You Will Create/Modify

```
src/
├── app/
│   └── (dashboard)/
│       ├── my-assignments/
│       │   └── page.tsx                  ← Worker's assignment list
│       ├── dashboard/
│       │   └── page.tsx                  ← Manager overview dashboard
│       └── reports/
│           ├── page.tsx                  ← Reports main page
│           ├── performance/
│           │   └── page.tsx              ← Project performance report
│           └── revenue/
│               └── page.tsx              ← Revenue report
├── components/
│   ├── monitoring/
│   │   ├── ProgressUpdateForm.tsx        ← Progress submission form
│   │   ├── AssignmentCard.tsx            ← Card for worker's assignment
│   │   ├── ProgressTimeline.tsx          ← Visual progress timeline
│   │   └── ActivityFeed.tsx              ← Recent activity list
│   ├── dashboard/
│   │   ├── StatsCard.tsx                 ← Metric card (total projects, workers, etc.)
│   │   ├── ProjectCompletionChart.tsx    ← Bar chart
│   │   ├── ProgressOverTimeChart.tsx     ← Line chart
│   │   ├── StatusDistributionChart.tsx   ← Pie chart
│   │   └── DashboardGrid.tsx            ← Dashboard layout grid
│   ├── reports/
│   │   ├── RevenueForm.tsx               ← Revenue recording form
│   │   ├── PerformanceTable.tsx          ← Performance data table
│   │   ├── RevenueChart.tsx              ← Revenue trend chart
│   │   ├── WorkerContributionTable.tsx   ← Worker hours/tasks table
│   │   └── ExportButton.tsx             ← CSV export
│   └── ui/                               ← Shadcn components (install as needed)
└── lib/
    ├── validations/
    │   └── monitoring.ts                 ← Zod schemas for progress & revenue forms
    ├── actions/
    │   ├── progress.ts                   ← Server actions for progress updates
    │   └── revenue.ts                    ← Server actions for revenue records
    └── queries/
        └── reports.ts                    ← Aggregation queries for reports
```

> **DO NOT modify** files outside the directories listed above. Shared files in `lib/types/`, `lib/supabase/`, and the DB migration are managed by Abdullah.

---

## 🛠️ Tech Stack Reference

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 15 (App Router) | Use Server Components by default, Client Components only when needed |
| Language | TypeScript | Strict mode enabled |
| Styling | Tailwind CSS | Use Shadcn/UI components |
| Charts | **Recharts** | `npm install recharts` (already approved) |
| Forms | React Hook Form + Zod | All forms must validate |
| Database | Supabase (PostgreSQL) | Use the client from `lib/supabase/client.ts` (browser) or `lib/supabase/server.ts` (server) |
| Types | `lib/types/database.ts` | Import types from here — DO NOT create duplicate type files |

---

## 🔄 GSD Workflow to Follow

### Step 1: Discuss (with your AI agent)
Tell your agent:
> "I am building the Project Monitoring & Revenue Tracking feature for DesaWorks. Read the `.planning/REQUIREMENTS.md` and `.planning/ROADMAP.md` files. Let's discuss the implementation details for F07, F08, and F09 before we start coding."

Key decisions to make during discussion:
- What charts best represent project progress and revenue data?
- How should duplicate progress submissions be detected? (same day? same percentage?)
- Should the dashboard auto-refresh? (real-time via Supabase subscriptions, or manual refresh?)
- Report format and layout

### Step 2: Plan
Tell your agent:
> "Based on our discussion, create a detailed implementation plan. Break the work into waves: Wave 1 = data layer (Zod schemas, server actions, aggregation queries), Wave 2 = chart components, Wave 3 = pages, Wave 4 = testing."

### Step 3: Execute
Have the agent implement each wave, committing after each:
```bash
git add -A && git commit -m "feat: add progress update form with validation"
git push origin feature/dani-monitoring-reports
```

### Step 4: Verify
Test all your features:
- [ ] Workers can view their assignments
- [ ] Progress update form validates correctly
- [ ] Duplicate submissions are detected
- [ ] Manager dashboard shows project analytics with charts
- [ ] Revenue recording works with abnormal amount warnings
- [ ] Reports display accurate aggregated data
- [ ] Charts render correctly with real data

### Step 5: Ship
```bash
git push origin feature/dani-monitoring-reports
```
Abdullah will review and merge your branch.

---

## 📝 WORKLOG — MANDATORY

**Your AI agent MUST update `worklogs/dani_worklog.md` after every significant action.**

Tell your agent at the start of every session:
> "Before we start, read the file `worklogs/dani_worklog.md`. After every significant action (creating files, making decisions, fixing bugs), append a new entry to the worklog. Use the format already in the file. Include the prompt I gave you, what you produced, and any decisions made. This is required for our assignment report."

---

## ⚠️ Important Rules

1. **Stay on your branch** — never push to `main`
2. **Use shared types** — import from `@/lib/types/database` — do not create your own
3. **Use shared Supabase client** — import from `@/lib/supabase/client` or `@/lib/supabase/server`
4. **Install Recharts** — `npm install recharts` — this is pre-approved
5. **Commit often** — use conventional commit messages (`feat:`, `fix:`, `docs:`, `test:`)
6. **Pull from main regularly** — `git fetch origin && git merge origin/main`
7. **Update your worklog** — every session, every significant action
8. **Do not install other new dependencies** without checking with Abdullah first

---

## 🚀 Getting Started

```bash
# 1. Navigate to your worktree
cd /path/to/your/worktree  # (Abdullah will tell you the path)

# 2. Install dependencies
npm install
npm install recharts

# 3. Copy environment variables
cp .env.example .env.local
# Then fill in the Supabase URL and anon key (ask Abdullah)

# 4. Start dev server
npm run dev

# 5. Open your AI agent and start the Discuss phase
```

---

## 📊 Acceptance Criteria (Definition of Done)

- [ ] Workers can view assigned projects on their dashboard
- [ ] Progress update form works with validation (0–100%, no backwards)
- [ ] Duplicate submission detection prompts user
- [ ] Manager dashboard shows active projects with completion charts
- [ ] Bar, line, and pie charts display real data using Recharts
- [ ] Revenue recording form works with abnormal amount warning
- [ ] Performance and revenue reports generate accurately
- [ ] Worker contribution table shows hours and tasks per worker
- [ ] All forms have proper Zod validation
- [ ] No TypeScript errors
- [ ] `npm run build` succeeds
- [ ] Worklog is up to date
