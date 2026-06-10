# Desa Works — Project Specification

## Project Name

**Desa Works** — Community Resource Management System for BUMDes

## Problem Statement

BUMDes (Badan Usaha Milik Desa) management cannot efficiently manage and allocate local human resources to village economic activities because no structured digital system exists to track skills and participation. This results in inefficient project execution, missed revenue opportunities, and poor data-driven decision-making.

## Target Users

- **BUMDes Manager** — Creates village projects, assigns workers based on skill matching, monitors project progress, generates revenue reports, and manages workforce allocation.
- **Village Resident** — Registers skills and availability, receives project assignment notifications, updates work progress and contribution details.
- **Village Head (Stakeholder)** — Views high-level reports on economic impact and project outcomes (read-only dashboard).

## Key Features

| F-ID | Feature | Description | MoSCoW |
|------|---------|-------------|--------|
| F01 | Resident Skills Registration | Residents input skills, experience, and availability into their profile | Must |
| F02 | Skill Categories System | Predefined skill categories with validation for standardized data entry | Must |
| F03 | Project Creation | Manager creates projects with specific skill requirements and workforce needs | Must |
| F04 | Skill-Based Worker Recommendation | System recommends available workers matching project skill requirements | Must |
| F05 | Worker Assignment & Notification | Manager confirms assignments; system notifies assigned workers | Should |
| F06 | Availability Status Management | Residents can update their availability; system reflects changes in recommendations | Should |
| F07 | Work Progress Recording | Workers update task progress and contribution details on assigned projects | Must |
| F08 | Project Dashboard | Manager views active project progress with analytics | Must |
| F09 | Revenue & Performance Reports | System generates project performance and revenue reports automatically | Must |
| F10 | Conflict Detection | System flags workers already assigned to overlapping projects | Should |
| F11 | Manager Worker Filtering | Manager can filter workers by skills and availability during assignment | Should |

## Non-Functional Requirements

| NF-ID | Requirement | Target / Measure |
|-------|-------------|-----------------|
| NF01 | Security — Data encryption | Personal data encrypted at rest (Supabase RLS + column encryption) |
| NF02 | Security — Password hashing | bcrypt via Supabase Auth (cost factor ≥ 10) |
| NF03 | Security — Data in transit | HTTPS/TLS 1.2+ (Vercel default) |
| NF04 | Security — User consent | Privacy policy + Terms of Service agreement during registration |
| NF05 | Performance | API responses < 2 seconds under normal load |
| NF06 | Usability | Responsive UI, mobile-friendly (375px and wider) |
| NF07 | Legal compliance | UU PDP No. 27/2022 compliant data handling |

## Out of Scope

- Automatic payroll/salary disbursements
- Mobile native app (web-based MVP only)
- Integration with national ID (Dukcapil) APIs
- External vendor management
- Real-time chat / messaging between users

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **UI Components**: Shadcn/UI (Radix primitives)
- **Backend**: Next.js API Routes + Supabase
- **Database**: PostgreSQL (via Supabase)
- **Auth**: Supabase Auth (email/password, role-based)
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Deployment**: Vercel (frontend + API) + Supabase (DB + Auth)

## Why This Stack

- Vercel is purpose-built for Next.js — zero-config deploys, preview per PR
- Supabase provides managed PostgreSQL + Row-Level Security + built-in Auth
- TypeScript end-to-end reduces bugs across 4 developers using different AI agents
- Shadcn/UI gives accessible, premium components without vendor lock-in
- All major AI agents have excellent training data for Next.js + Supabase

## Constraints

- 4-person student team (Abdullah, Aldi, Kemal, Dani)
- Each member uses their own AI agent (Antigravity, Codex, GitHub Copilot)
- Git worktree-based parallel development — each member works on their own branch
- Must comply with Indonesia's UU PDP No. 27/2022 (Personal Data Protection)
- Semester project timeline

## Team

| Member | Role | Branch | Responsibility |
|--------|------|--------|---------------|
| Abdullah (24523229) | Team Leader | `main` | Project setup, DB schema, integration, deployment |
| Aldi (24523023) | Developer | `feature/aldi-workforce-registration` | Workforce Skills Registration (F01, F02, F06) |
| Kemal (24523123) | Developer | `feature/kemal-project-assignment` | Project Assignment & Allocation (F03, F04, F05, F10, F11) |
| Dani (24523207) | Developer | `feature/dani-monitoring-reports` | Monitoring & Revenue Tracking (F07, F08, F09) |
