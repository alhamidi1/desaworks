# DesaWorks — Agent Context

## Project
Desa Works is a Community Resource Management System for BUMDes (village-owned enterprises in Indonesia). It manages workforce allocation, project assignments, and revenue tracking.

## Tech Stack
- Next.js 15 (App Router) + TypeScript + Tailwind CSS + Shadcn/UI
- Supabase (PostgreSQL + Auth + RLS)
- Recharts (for dashboards)
- Deployed on Vercel + Supabase

## Key Files
- `.planning/PROJECT.md` — Full project spec
- `.planning/REQUIREMENTS.md` — All requirements with F-IDs
- `.planning/ROADMAP.md` — Phased delivery plan
- `src/lib/types/database.ts` — Shared TypeScript types (source of truth)
- `src/lib/supabase/client.ts` — Browser Supabase client
- `src/lib/supabase/server.ts` — Server Supabase client
- `supabase/migrations/001_initial_schema.sql` — Database schema

## Conventions
- Use conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`
- Import types from `@/lib/types/database`
- Import Supabase clients from `@/lib/supabase/client` or `@/lib/supabase/server`
- Use Zod for form validation
- Use React Hook Form for forms
- Server Components by default; Client Components only when needed
- Update the relevant worklog in `worklogs/` after every significant action

## Team
4 developers working in parallel via Git worktrees. Each has their own branch and feature scope. See `.planning/ROADMAP.md` for details.
