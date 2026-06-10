# Desa Works

> Community Resource Management System for BUMDes (Badan Usaha Milik Desa)

A web-based information system that helps village management allocate local human resources to village economic projects, monitor worker participation, and track revenue for data-driven decision-making.

## 🏗️ Tech Stack

- **Frontend & API**: [Next.js 15](https://nextjs.org/) (App Router) + TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/UI](https://ui.shadcn.com/)
- **Database**: PostgreSQL via [Supabase](https://supabase.com/)
- **Auth**: Supabase Auth (email/password, role-based)
- **Charts**: [Recharts](https://recharts.org/)
- **Deployment**: [Vercel](https://vercel.com/) + Supabase

## 👥 Team

| Member | Student ID | Role | Feature |
|--------|-----------|------|---------|
| Abdullah | 24523229 | Team Leader | Foundation, DB schema, integration, deployment |
| Aldi | 24523023 | Developer | Workforce Skills Registration |
| Kemal | 24523123 | Developer | Project Assignment & Allocation |
| Dani | 24523207 | Developer | Monitoring & Revenue Tracking |

## 📁 Project Structure

```
├── .planning/                 # GSD Core planning artifacts
│   ├── PROJECT.md             # Vision, scope, constraints
│   ├── REQUIREMENTS.md        # F-IDs and NF-IDs
│   ├── ROADMAP.md             # Phased delivery plan
│   └── STATE.md               # Progress tracker
├── docs/member-plans/         # Individual member development plans
├── worklogs/                  # Auto-updating work logs per member
├── supabase/migrations/       # Database migration files
├── src/
│   ├── app/                   # Next.js App Router pages
│   ├── components/            # React components
│   └── lib/                   # Shared utilities, types, Supabase config
└── specs/                     # Original PRD & business process docs
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase project (ask Abdullah for credentials)
- Git

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/alhamidi1/desaworks.git
cd desaworks

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase URL and anon key

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### For Team Members (Worktree Setup)

Each team member works in their own Git worktree:

```bash
# Abdullah already created worktrees. Navigate to yours:
cd /path/to/your/worktree

# Install dependencies
npm install

# Copy env and start
cp .env.example .env.local
npm run dev
```

## 🔄 Development Workflow

We follow the **GSD Core** spec-driven development loop:

```
Discuss → Plan → Execute → Verify → Ship
```

1. **Discuss** — Clarify requirements with your AI agent before coding
2. **Plan** — Break work into waves (data → components → pages → tests)
3. **Execute** — Implement with AI assistance, commit after each wave
4. **Verify** — Test against acceptance criteria
5. **Ship** — Push branch, Abdullah reviews and merges

### Branch Strategy

- `main` — Stable, deployable code (Abdullah manages)
- `feature/aldi-workforce-registration` — Aldi's feature branch
- `feature/kemal-project-assignment` — Kemal's feature branch
- `feature/dani-monitoring-reports` — Dani's feature branch

### Commit Convention

```
feat: add resident registration form
fix: correct skill matching query
docs: update API documentation
test: add assignment flow tests
```

## 📊 Database Schema

See [supabase/migrations/001_initial_schema.sql](supabase/migrations/001_initial_schema.sql) for the complete schema.

Key tables: `profiles`, `skills`, `resident_skills`, `projects`, `project_skill_requirements`, `assignments`, `progress_updates`, `revenue_records`, `notifications`

## 📝 Documentation

- [Project Specification](.planning/PROJECT.md)
- [Requirements](.planning/REQUIREMENTS.md)
- [Roadmap](.planning/ROADMAP.md)
- [Aldi's Plan](docs/member-plans/aldi_plan.md)
- [Kemal's Plan](docs/member-plans/kemal_plan.md)
- [Dani's Plan](docs/member-plans/dani_plan.md)

## 📄 License

This project is part of the Information System Development course (2025/2026).
