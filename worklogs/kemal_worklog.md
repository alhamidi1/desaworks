# Work Log — Kemal
> **Student ID:** 24523123
> **Role:** Developer — Project Assignment & Workforce Allocation
> **Branch:** `feature/kemal-project-assignment`
> **AI Agent:** [Write the name of the AI agent you are using]

<!-- 
╔══════════════════════════════════════════════════════════════════╗
║  AGENT INSTRUCTIONS — READ THIS FIRST                          ║
║                                                                  ║
║  After every significant action (creating files, making          ║
║  decisions, running commands, fixing bugs), you MUST append      ║
║  a new entry to this file using the format below.                ║
║                                                                  ║
║  Do NOT delete previous entries.                                 ║
║  Do NOT summarize — be specific about what was done.             ║
║  Include the exact prompt the user gave you.                     ║
║  Include screenshots or file paths where relevant.               ║
║                                                                  ║
║  This log is REQUIRED for the assignment report.                 ║
╚══════════════════════════════════════════════════════════════════╝
-->

---

## Entry Format

```
## Session [N] — [YYYY-MM-DD]

### Action: [Brief title of what was done]
- **AI Agent Used**: [Name of AI agent]
- **Prompt Given**: "[The exact or summarized prompt you gave the agent]"
- **Result**: [What the agent produced — files created, code written, decisions made]
- **Decision Made**: [Any human decisions — architecture choices, design choices, etc.]
- **Files Changed**: [List of files created or modified]
- **Screenshot**: [Optional — path to screenshot or description]
- **Commit**: [Commit hash and message, if applicable]
```

---

<!-- Add your first entry below this line when you start working -->

## Session 1 — 2026-06-11

### Action: Environment Setup & Repository Initialization

* **AI Agent Used**: ChatGPT
* **Prompt Given**: "Bantu aku setup repository DesaWorks dan memahami langkah awal pengerjaan feature/kemal-project-assignment."
* **Result**: Successfully cloned repository, verified Git installation, installed project dependencies with npm install, created .env.local from .env.example, and started Next.js development server successfully.
* **Decision Made**: Verify repository structure and project requirements before implementing feature code.
* **Files Changed**: .env.local
* **Screenshot**: Next.js development server running on localhost:3000
* **Commit**: None

---

## Session 2 — 2026-06-11

### Action: Phase 3 Repository Analysis & Wave 1 Implementation Planning

* **AI Agent Used**: Cursor (Auto)
* **Prompt Given**: "Read AGENTS.md, .planning/REQUIREMENTS.md, .planning/ROADMAP.md, docs/member-plans/kemal_plan.md, and worklogs/kemal_worklog.md. I am responsible for Phase 3: Project Assignment & Workforce Allocation (F03, F04, F05, F10, F11). Before writing any code: (1) Analyze the current repository structure, (2) Explain what is missing compared to my implementation plan, (3) Create a Wave 1 implementation plan focused only on project validation schemas, project server actions, and recommendation query logic, (4) Do not create UI pages yet, (5) Update worklogs/kemal_worklog.md with a new entry documenting this analysis and planning session, (6) Show me the plan before making code changes."
* **Result**: Completed full repository audit on branch `feature/kemal-project-assignment`. Confirmed repo is at Phase 1 foundation only — no dashboard routes, no `lib/validations/`, `lib/actions/`, or `lib/queries/` directories exist yet. Database schema (`supabase/migrations/001_initial_schema.sql`) and shared types (`src/lib/types/database.ts`) already define all tables needed for Phase 3 (`projects`, `project_skill_requirements`, `assignments`, `notifications`). Drafted Wave 1 plan covering three files: `src/lib/validations/project.ts`, `src/lib/actions/projects.ts`, and `src/lib/queries/recommendations.ts`. No code written in this session — planning only.
* **Decision Made**:
  - **Skill matching algorithm**: Score = count of required skills where resident has matching `skill_id` AND `proficiency_level >= min_proficiency` (ordered: beginner < intermediate < advanced). Sort descending by match score; tie-break by total experience years.
  - **Conflict detection (F10)**: Flag residents with active assignments (`status` NOT IN `void`, `completed`) on projects whose date ranges overlap with the target project (`start_date <= other.end_date AND other.start_date <= end_date`). Exclude from auto-selection but allow manual override in UI (Wave 3).
  - **Availability filter (F04/F11)**: Default to `availability = 'available'`; optional filter param to include unavailable residents.
  - **Assignment flow (F05)**: Server action creates `assignments` with status `confirmed` (sets `confirmed_at`), plus `notifications` rows per worker. Unassign sets status to `void`.
  - **Dependency note**: `zod` is not in `package.json` yet — must be added before Wave 1 implementation (coordinate with Abdullah per team rules).
  - **Scope boundary**: Wave 1 is data layer only; UI components (Wave 2) and pages (Wave 3) deferred.
* **Files Changed**: `worklogs/kemal_worklog.md`
* **Screenshot**: N/A
* **Commit**: None

---

## Session 3 — 2026-06-11

### Action: Wave 1 Data Layer Implementation

* **AI Agent Used**: Cursor (Auto)
* **Prompt Given**: "Implement Wave 1 now. Read AGENTS.md, worklogs/kemal_worklog.md, src/lib/types/database.ts, supabase/migrations/001_initial_schema.sql. Tasks: (1) Create src/lib/validations/project.ts, src/lib/actions/projects.ts, src/lib/queries/recommendations.ts, (2) Use existing types from @/lib/types/database, (3) Use existing Supabase server client from @/lib/supabase/server, (4) Implement createProject, updateProject, updateProjectStatus, getProject, listProjects, confirmAssignments, voidAssignment, getWorkerRecommendations, calculateMatchScore, detectSchedulingConflicts, (5) Use Zod validation, (6) Handle null proficiency_level, null project dates, assignment conflicts, status transitions, (7) Update worklogs/kemal_worklog.md. Do not modify files outside feature scope. Do not commit. Do not push."
* **Result**: Implemented all three Wave 1 files. `zod` was already present in `package.json` (^4.4.3). All server actions use `requireManager()` guard, Zod input validation, and `ActionResult<T>` return type. Recommendation engine scores workers by matching skill count with proficiency check; null proficiency treated as no match. Conflict detection skips when project dates are null; flags overlaps for active assignments (`pending`, `confirmed`, `active`). `confirmAssignments` blocks on scheduling conflicts unless `override_conflicts: true`; reactivates `void` assignments instead of violating UNIQUE constraint. `npm run build` passes with no TypeScript errors.
* **Decision Made**:
  - Status transitions enforced: `draft→open|cancelled`, `open→in_progress|cancelled`, `in_progress→completed|cancelled`; `completed` and `cancelled` are terminal.
  - `createProject` rolls back (deletes project) if skill requirement insert fails.
  - `updateProject` replaces skill requirements via delete-then-insert.
  - `confirmAssignments` creates assignments as `confirmed` with `confirmed_at` and inserts dashboard notifications.
  - `voidAssignment` is idempotent for already-void assignments; rejects voiding completed assignments.
* **Files Changed**:
  - `src/lib/validations/project.ts` (created)
  - `src/lib/actions/projects.ts` (created)
  - `src/lib/queries/recommendations.ts` (created)
  - `worklogs/kemal_worklog.md` (updated)
* **Screenshot**: N/A
* **Commit**: None (per user instruction)
