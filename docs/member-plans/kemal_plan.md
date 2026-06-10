# Kemal's Development Plan — Project Assignment & Workforce Allocation

> **Owner:** Kemal (24523123)
> **Branch:** `feature/kemal-project-assignment`
> **Phase:** 3 — Project Assignment
> **PRD Features:** FR-M01, FR-M02, FR-M04, FR-M06
> **Requirements:** F03, F04, F05, F10, F11

---

## 🎯 Your Mission

You are building **Process 2: Project Assignment & Workforce Allocation** — the core system that lets BUMDes managers create village projects, define skill requirements, and intelligently match/assign workers. This process is the heart of DesaWorks.

---

## 📋 What You Must Build

### Feature F03: Project Creation & Management
- **Page:** `/dashboard/projects/create`
- Manager can create a project with:
  - Name, description
  - Required skills (selected from `skills` table — multi-select)
  - Minimum proficiency level per skill
  - Number of workers needed (total and per skill)
  - Start date and end date
  - Budget estimate
- Project status lifecycle: `draft` → `open` → `in_progress` → `completed`
- Form validation using **Zod** schemas
- Data saved to `projects` and `project_skill_requirements` tables

### Feature F04: Skill-Based Worker Recommendation Engine
- **Page:** `/dashboard/projects/[id]/assign`
- After project requirements are set, system queries the database:
  ```sql
  -- Conceptual query: find residents whose skills match AND who are available
  SELECT residents with matching skills
  WHERE skill matches project requirements
  AND availability = 'available'
  AND proficiency_level >= min_required
  ORDER BY match_score DESC
  ```
- Display recommended workers as a selectable list with:
  - Name, skills, proficiency, experience
  - Match score (how many required skills they have)
  - Conflict warnings (if already on another project with overlapping dates)

### Feature F05: Worker Assignment & Notification
- Manager reviews the recommendation list
- Manager can select/deselect workers
- On confirmation:
  - Create `assignments` records with status `pending` → `confirmed`
  - Create `notifications` for each assigned worker
  - Display success feedback
- Manager can unassign workers later (set status to `void`)

### Feature F10: Conflict Detection
- When recommending workers, check `assignments` table for overlapping dates
- Flag conflicting workers with a visual warning (⚠️ icon + tooltip)
- Exclude from auto-selection but allow manual override

### Feature F11: Manager Worker Filtering
- On the assignment page, manager can filter the recommendation list by:
  - Specific skills
  - Availability status
  - Proficiency level
  - Experience years
- Filters work in real-time (client-side filtering of fetched results)

### Project List & Detail Pages
- **Page:** `/dashboard/projects` — list all projects with status badges
- **Page:** `/dashboard/projects/[id]` — project detail with assigned workers, requirements

---

## 🗂️ Files You Will Create/Modify

```
src/
├── app/
│   └── (dashboard)/
│       └── projects/
│           ├── page.tsx                  ← Project list
│           ├── create/
│           │   └── page.tsx              ← Project creation form
│           └── [id]/
│               ├── page.tsx              ← Project detail view
│               └── assign/
│                   └── page.tsx          ← Worker recommendation & assignment
├── components/
│   ├── projects/
│   │   ├── ProjectForm.tsx               ← Project creation/edit form
│   │   ├── ProjectCard.tsx               ← Card for project list
│   │   ├── ProjectStatusBadge.tsx        ← Status badge component
│   │   ├── SkillRequirementInput.tsx     ← Skill requirement multi-select
│   │   ├── WorkerRecommendationList.tsx  ← Recommendation results list
│   │   ├── WorkerCard.tsx                ← Card for each recommended worker
│   │   ├── ConflictWarning.tsx           ← Overlap warning component
│   │   └── AssignmentFilters.tsx         ← Filter controls for worker list
│   └── ui/                               ← Shadcn components (install as needed)
└── lib/
    ├── validations/
    │   └── project.ts                    ← Zod schemas for project forms
    ├── actions/
    │   └── projects.ts                   ← Server actions for project CRUD
    └── queries/
        └── recommendations.ts            ← Skill matching query logic
```

> **DO NOT modify** files outside the directories listed above. Shared files in `lib/types/`, `lib/supabase/`, and the DB migration are managed by Abdullah.

---

## 🛠️ Tech Stack Reference

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 15 (App Router) | Use Server Components by default, Client Components only when needed |
| Language | TypeScript | Strict mode enabled |
| Styling | Tailwind CSS | Use Shadcn/UI components |
| Forms | React Hook Form + Zod | All forms must validate |
| Database | Supabase (PostgreSQL) | Use the client from `lib/supabase/client.ts` (browser) or `lib/supabase/server.ts` (server) |
| Types | `lib/types/database.ts` | Import types from here — DO NOT create duplicate type files |

---

## 🔄 GSD Workflow to Follow

### Step 1: Discuss (with your AI agent)
Tell your agent:
> "I am building the Project Assignment & Workforce Allocation feature for DesaWorks. Read the `.planning/REQUIREMENTS.md` and `.planning/ROADMAP.md` files. Let's discuss the implementation details for F03, F04, F05, F10, and F11 before we start coding."

Key decisions to make during discussion:
- How the skill matching algorithm should work (exact match? partial match with scoring?)
- How to handle the case when no workers match requirements
- Assignment confirmation UX flow (step-by-step wizard vs single page?)
- How conflict detection checks date overlaps

### Step 2: Plan
Tell your agent:
> "Based on our discussion, create a detailed implementation plan. Break the work into waves: Wave 1 = data layer (Zod schemas, server actions, recommendation query), Wave 2 = UI components, Wave 3 = pages, Wave 4 = testing."

### Step 3: Execute
Have the agent implement each wave, committing after each:
```bash
git add -A && git commit -m "feat: add project creation form with skill requirements"
git push origin feature/kemal-project-assignment
```

### Step 4: Verify
Test all your features:
- [ ] Manager can create a project with skill requirements
- [ ] Recommendation engine returns matching available workers
- [ ] Conflict detection flags overlapping assignments
- [ ] Manager can confirm assignments
- [ ] Workers receive notifications
- [ ] Filtering works correctly
- [ ] Changing requirements recalculates recommendations

### Step 5: Ship
```bash
git push origin feature/kemal-project-assignment
```
Abdullah will review and merge your branch.

---

## 📝 WORKLOG — MANDATORY

**Your AI agent MUST update `worklogs/kemal_worklog.md` after every significant action.**

Tell your agent at the start of every session:
> "Before we start, read the file `worklogs/kemal_worklog.md`. After every significant action (creating files, making decisions, fixing bugs), append a new entry to the worklog. Use the format already in the file. Include the prompt I gave you, what you produced, and any decisions made. This is required for our assignment report."

---

## ⚠️ Important Rules

1. **Stay on your branch** — never push to `main`
2. **Use shared types** — import from `@/lib/types/database` — do not create your own
3. **Use shared Supabase client** — import from `@/lib/supabase/client` or `@/lib/supabase/server`
4. **Commit often** — use conventional commit messages (`feat:`, `fix:`, `docs:`, `test:`)
5. **Pull from main regularly** — `git fetch origin && git merge origin/main`
6. **Update your worklog** — every session, every significant action
7. **Do not install new dependencies** without checking with Abdullah first

---

## 🚀 Getting Started

```bash
# 1. Navigate to your worktree
cd /path/to/your/worktree  # (Abdullah will tell you the path)

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local
# Then fill in the Supabase URL and anon key (ask Abdullah)

# 4. Start dev server
npm run dev

# 5. Open your AI agent and start the Discuss phase
```

---

## 📊 Acceptance Criteria (Definition of Done)

- [ ] Manager can create projects with name, description, skills, workers needed, timeline
- [ ] Skill requirements are selectable from predefined categories
- [ ] Recommendation engine returns workers sorted by skill match score
- [ ] Workers with overlapping project dates are flagged with conflict warning
- [ ] Manager can confirm assignments; records are created in DB
- [ ] Notifications are created for assigned workers
- [ ] Manager can unassign workers (status → void)
- [ ] Filters work for skills, availability, proficiency
- [ ] Changing requirements triggers recommendation recalculation
- [ ] All forms have proper Zod validation
- [ ] No TypeScript errors
- [ ] `npm run build` succeeds
- [ ] Worklog is up to date
