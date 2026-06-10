# Aldi's Development Plan — Workforce Skills Registration

> **Owner:** Aldi (24523023)
> **Branch:** `feature/aldi-workforce-registration`
> **Phase:** 2 — Workforce Registration
> **PRD Features:** FR-R01, FR-R03
> **Requirements:** F01, F02, F06

---

## 🎯 Your Mission

You are building **Process 1: Workforce Skills Registration** — the system that lets village residents register their skills, experience, and availability into the workforce database. This is the foundation that the other two processes (Project Assignment and Monitoring) depend on.

---

## 📋 What You Must Build

### Feature F01: Resident Profile & Skills Registration
- **Page:** `/dashboard/residents/register` (or `/dashboard/profile/edit` for existing users)
- Residents can input:
  - Personal information (name, phone, address, date of birth)
  - Skills (selected from predefined categories — multi-select)
  - Experience years per skill
  - Proficiency level per skill (beginner/intermediate/advanced)
  - Additional notes per skill
  - Availability status
- Form validation using **Zod** schemas
- Data saved to `profiles`, `resident_skills` tables via Supabase

### Feature F02: Predefined Skill Categories System
- **Page:** Integrated into the registration form
- Skills are pre-loaded from the `skills` table (already seeded with 20 categories in the migration)
- Searchable/filterable dropdown or multi-select component
- Grouped by category (Farming, Finance, Construction, etc.)
- If a resident enters an unclear/unsupported skill, suggest closest predefined match
- Prevent duplicate skill entries for the same resident

### Feature F06: Availability Status Management
- **Component:** Toggle/switch on resident dashboard
- Residents can toggle between "Available" and "Unavailable"
- Updates the `profiles.availability` field immediately
- Changes are reflected in worker recommendation results (Kemal's feature)

### Manager View: Resident List
- **Page:** `/dashboard/residents`
- List all registered residents with their skills
- Filter by skill category, specific skill, availability status
- Search by name
- Click to view resident profile details

---

## 🗂️ Files You Will Create/Modify

```
src/
├── app/
│   └── (dashboard)/
│       └── residents/
│           ├── page.tsx              ← Resident list (manager view)
│           ├── register/
│           │   └── page.tsx          ← Registration form
│           └── [id]/
│               └── page.tsx          ← Resident profile detail
├── components/
│   ├── residents/
│   │   ├── RegistrationForm.tsx      ← Main registration form
│   │   ├── SkillSelector.tsx         ← Skill multi-select component
│   │   ├── AvailabilityToggle.tsx    ← Available/Unavailable switch
│   │   ├── ResidentCard.tsx          ← Card for resident list
│   │   └── ResidentFilters.tsx       ← Filter sidebar for manager
│   └── ui/                           ← Shadcn components (install as needed)
└── lib/
    ├── validations/
    │   └── resident.ts               ← Zod schemas for resident forms
    └── actions/
        └── residents.ts              ← Server actions for resident CRUD
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

Follow the **Discuss → Plan → Execute → Verify → Ship** cycle from the course guide:

### Step 1: Discuss (with your AI agent)
Ask your AI agent to discuss Phase 2. Tell it:
> "I am building the Workforce Skills Registration feature for DesaWorks. Read the `.planning/REQUIREMENTS.md` and `.planning/ROADMAP.md` files. Let's discuss the implementation details for F01, F02, and F06 before we start coding."

Key decisions to make during discussion:
- Multi-select component style (dropdown vs tag input vs checkbox grid)
- Profile page layout
- How the availability toggle should behave (instant save vs form submit)

### Step 2: Plan (with your AI agent)
Ask your agent to create a plan. Tell it:
> "Based on our discussion, create a detailed implementation plan. Break the work into waves: Wave 1 = data layer (Zod schemas, server actions), Wave 2 = UI components, Wave 3 = pages, Wave 4 = testing."

### Step 3: Execute
Have the agent implement each wave, committing after each:
```bash
git add -A && git commit -m "feat: add resident registration form with skill selector"
git push origin feature/aldi-workforce-registration
```

### Step 4: Verify
Test all your features:
- [ ] A resident can register with skills
- [ ] Predefined categories load correctly
- [ ] Duplicate skills are prevented
- [ ] Availability toggle updates immediately
- [ ] Manager can view and filter resident list
- [ ] Forms validate correctly (try invalid input)

### Step 5: Ship
When everything works:
```bash
git push origin feature/aldi-workforce-registration
```
Abdullah will review and merge your branch into `main`.

---

## 📝 WORKLOG — MANDATORY

**Your AI agent MUST update `worklogs/aldi_worklog.md` after every significant action.**

Tell your agent at the start of every session:
> "Before we start, read the file `worklogs/aldi_worklog.md`. After every significant action (creating files, making decisions, fixing bugs), append a new entry to the worklog. Use the format already in the file. Include the prompt I gave you, what you produced, and any decisions made. This is required for our assignment report."

---

## ⚠️ Important Rules

1. **Stay on your branch** — never push to `main`
2. **Use shared types** — import from `@/lib/types/database` — do not create your own
3. **Use shared Supabase client** — import from `@/lib/supabase/client` or `@/lib/supabase/server`
4. **Commit often** — use conventional commit messages (`feat:`, `fix:`, `docs:`, `test:`)
5. **Pull from main regularly** — `git fetch origin && git merge origin/main` at least daily
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
# Provide this plan file as context to your agent
```

---

## 📊 Acceptance Criteria (Definition of Done)

- [ ] Resident can register with personal info + skills from predefined categories
- [ ] Skills are grouped by category and searchable
- [ ] Proficiency level and experience can be set per skill
- [ ] Duplicate skill entries are detected and prevented
- [ ] Availability toggle works with instant DB update
- [ ] Manager can view all residents with skill/availability filters
- [ ] All forms have proper Zod validation
- [ ] No TypeScript errors (`npx tsc --noEmit` passes)
- [ ] `npm run build` succeeds
- [ ] Worklog is up to date with all sessions documented
