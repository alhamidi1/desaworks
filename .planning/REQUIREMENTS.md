# Requirements — Desa Works

> Traced from PRD v1.0 and Business Process Identification Worksheet.

## Functional Requirements

### Resident Features

| F-ID | Requirement | PRD Ref | Priority |
|------|-------------|---------|----------|
| F01 | Residents can create a profile with personal information, skills, experience, and availability status | FR-R01 | Must |
| F02 | System provides predefined skill categories and validates skill input for standardization | BPI Process 1 | Must |
| F06 | Residents can update their availability status (available/unavailable); system reflects changes immediately in assignment recommendations | FR-R03 | Should |
| F12 | System defaults to conversational Bahasa Indonesia and provides simplified visual navigation | PRD §7.1, 7.2 | Must |
| F15 | System caches progress logs and hours worked offline, auto-syncing when network is restored | PRD §7.5 | Should |
| F16 | Resident interface is designed mobile-first with touch-friendly elements and optimized assets | PRD §7.6 | Must |

### Manager Features

| F-ID | Requirement | PRD Ref | Priority |
|------|-------------|---------|----------|
| F03 | Manager can create village projects with name, description, required skills, number of workers needed, and timeline | FR-M01 | Must |
| F04 | System analyzes RESIDENT_SKILL data and recommends available workers whose skills match project requirements | FR-M02 | Must |
| F05 | Manager confirms assignment list; system updates assignment status and sends notification to workers (dashboard + email if provided) | FR-M04, FR-R02 | Should |
| F07 | Workers can access assigned project tasks and update work progress and contribution details | BPI Process 3 | Must |
| F08 | Manager can view active project progress through a dashboard with analytics | FR-M05 | Must |
| F09 | System generates project performance and revenue reports automatically | FR-M03 | Must |
| F10 | System detects scheduling conflicts — flags residents already assigned to projects with overlapping dates | PRD Edge Case | Should |
| F11 | Manager can filter workers based on skills and availability during the assignment process | FR-M06 | Should |
| F13 | Manager/RT/RW can register and manage profiles/availability on behalf of offline residents (proxy mode) | PRD §7.3 | Must |
| F14 | System sends assignment notifications via WhatsApp with simplified, credentials-free response links | PRD §7.4 | Should |

## Non-Functional Requirements

| NF-ID | Requirement | Target | PRD Ref |
|-------|-------------|--------|---------|
| NF01 | Data at rest encryption | AES-256 via Supabase column-level encryption for personal data | PRD §4.3 |
| NF02 | Password security | bcrypt hashing via Supabase Auth (cost ≥ 10) | PRD §4.3 |
| NF03 | Data in transit | HTTPS/TLS 1.2+ (Vercel default) | PRD §4.3 |
| NF04 | User consent | Registration requires explicit agreement to ToS and Privacy Policy | PRD §4.3 |
| NF05 | Performance | All API responses < 2 seconds under normal load | PRD §Success Metrics |
| NF06 | Responsiveness | UI works on screens 375px and wider | General |
| NF07 | Legal compliance | Data handling compliant with UU PDP No. 27/2022 | PRD §4.2 |

## Requirement-to-Phase Mapping

| Phase | Owner | Requirements |
|-------|-------|-------------|
| Foundation (Abdullah) | Abdullah | NF01–NF07, DB schema for all F-IDs |
| Workforce Registration (Aldi) | Aldi | F01, F02, F06, F12, F13, F16 |
| Project Assignment (Kemal) | Kemal | F03, F04, F05, F10, F11, F14 |
| Monitoring & Reports (Dani) | Dani | F07, F08, F09, F15 |
