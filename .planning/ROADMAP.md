# Roadmap — Desa Works

> Phased delivery plan. Each phase is independently shippable and assigned to a team member.

## Milestone Overview

| Phase | Name | Owner | Focus | Requirements | Branch |
|-------|------|-------|-------|-------------|--------|
| 1 | Foundation | Abdullah | Project scaffold, DB schema, auth, Supabase config | NF01–NF07 | `main` |
| 2 | Workforce Registration | Aldi | Resident profiles, skill input, availability management | F01, F02, F06 | `feature/aldi-workforce-registration` |
| 3 | Project Assignment | Kemal | Project CRUD, skill matching, worker assignment | F03, F04, F05, F10, F11 | `feature/kemal-project-assignment` |
| 4 | Monitoring & Reports | Dani | Progress tracking, dashboards, revenue reports | F07, F08, F09 | `feature/dani-monitoring-reports` |
| 5 | Integration & Polish | Abdullah | Merge all branches, integration testing, deployment | All | `main` |

---

## Phase 1 — Foundation (Abdullah)

**Goals:** Set up the project skeleton, database schema, authentication, and deployment pipeline.

**Requirements covered:** NF01, NF02, NF03, NF04, NF05, NF06, NF07

**Deliverables:**
- Next.js project scaffold with TypeScript + Tailwind + Shadcn/UI
- Supabase project connected with environment variables
- Database migration: `residents`, `skills`, `resident_skills`, `projects`, `project_skill_requirements`, `assignments`, `progress_updates`, `revenue_records` tables
- Supabase Auth configured with role-based access (resident / manager)
- Row-Level Security (RLS) policies on all tables
- Shared TypeScript types for all database entities
- Supabase client utilities (browser + server)
- Basic layout with navigation shell
- Landing page with login/register
- Privacy Policy and Terms of Service pages
- README.md with setup instructions for team

**Definition of Done:**
- [x] `npm run build` succeeds
- [x] Supabase migration applies cleanly
- [x] Auth login/register flow works
- [x] RLS policies block unauthorized access
- [ ] All team members can clone, install, and run locally

---

## Phase 2 — Workforce Registration (Aldi)

**Goals:** Build the resident registration and skills management system.

**Requirements covered:** F01, F02, F06

**Deliverables:**
- Resident profile creation form (personal info, skills, experience, availability)
- Predefined skill categories dropdown/multi-select with validation
- Skill search and suggestion system
- Resident dashboard showing current profile and assigned projects
- Availability toggle (available/unavailable) with immediate DB update
- Profile edit functionality
- Input validation (Zod schemas) preventing duplicate/unclear entries
- Manager view: list of all registered residents with skill filters

**Definition of Done:**
- [ ] Resident can register, input skills, and update availability
- [ ] Predefined skill categories exist and are enforced
- [ ] Manager can view and filter resident list by skills
- [ ] Duplicate profile detection works
- [ ] All forms validate correctly

---

## Phase 3 — Project Assignment & Workforce Allocation (Kemal)

**Goals:** Build the project management and intelligent worker assignment system.

**Requirements covered:** F03, F04, F05, F10, F11

**Deliverables:**
- Project creation form (name, description, required skills, worker count, timeline)
- Skill-based worker recommendation engine (query residents whose skills match requirements and are available)
- Recommendation list UI with conflict warnings (overlapping project dates)
- Manager can review, adjust, and confirm assignment list
- Assignment confirmation triggers status update and notification
- Worker filtering by skills and availability during assignment
- Manager can unassign workers and re-search
- Requirements change triggers automatic recommendation recalculation

**Definition of Done:**
- [ ] Manager can create projects with skill requirements
- [ ] System recommends matching available workers
- [ ] Conflict detection flags overlapping assignments
- [ ] Assignment confirmation updates DB and triggers notification
- [ ] Filtering works correctly for skills and availability

---

## Phase 4 — Monitoring & Revenue Tracking (Dani)

**Goals:** Build the project monitoring dashboard and financial reporting system.

**Requirements covered:** F07, F08, F09

**Deliverables:**
- Worker task view: access assigned project tasks from personal dashboard
- Work progress update form (progress %, notes, contribution details)
- Progress validation (completeness check, duplicate detection)
- Manager project progress dashboard with analytics charts
- Revenue recording form (per project)
- Automated performance and revenue report generation
- Abnormal financial input detection (revenue exceeds budget warning)
- Draft auto-save for offline resilience

**Definition of Done:**
- [ ] Workers can update progress on assigned tasks
- [ ] Manager dashboard shows live project progress
- [ ] Revenue recording and reporting works
- [ ] Charts display performance and financial data
- [ ] Duplicate submission detection works

---

## Phase 5 — Integration & Polish (Abdullah)

**Goals:** Merge all feature branches, resolve conflicts, integration testing, deploy to Vercel + Supabase.

**Requirements covered:** All F-IDs, All NF-IDs

**Deliverables:**
- All feature branches merged into `main` without conflicts
- End-to-end testing of all workflows
- UI consistency review and polish
- Performance optimization
- Production deployment on Vercel
- Final Supabase migration applied to production
- Complete README with deployment documentation

**Definition of Done:**
- [ ] All 3 feature branches merged cleanly
- [ ] All PRD workflows pass end-to-end testing
- [ ] Deployed and accessible on Vercel
- [ ] Production Supabase DB is seeded with sample data
- [ ] README documents full setup and deployment process
