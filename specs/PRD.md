# Product Requirements Document (PRD) — Desa Works

**Product Name:** Desa Works  
**Tagline:** A community Resource Management System for BUMDes to optimize local workforce allocation and track village project revenue.  
**Version:** v1.1 - Extended & Refined  
**Date:** June 17, 2026  
**Team:** Aldi (24523023), Abdullah (24523229), Kemal (24523123), Dani (24523207)  
**Product Owner:** Group 2  
**Client / Stakeholder:** BUMDes Management (Badan Usaha Milik Desa)  
**Status:** Approved for Implementation  

---

## PART 1: PROBLEM, OBJECTIVES & SCOPE

### 1. Problem Statement

#### 1.1 Background & Context
Village economic projects managed by BUMDes (Badan Usaha Milik Desa) often rely on manual coordination for labor. Currently, there is no centralized database of residents' skills or availability, leading to underutilized human capital and inefficient project management. Without structured data, village leaders struggle to prove the economic impact of their initiatives to stakeholders.

#### 1.2 Problem Statement Format
* **Affected Group:** BUMDes Management and Village Residents.
* **Root Cause:** No structured digital system exists to track skills and participation.
* **Measurable Negative Impact:** Inefficient project execution, missed revenue opportunities, poor data-driven decision-making, and unfair distribution of job opportunities.
* **Statement:** *BUMDes Management cannot efficiently manage and allocate local human resources to village economic activities because no structured digital system exists to track skills and participation, which results in inefficient project execution, missed revenue opportunities, and poor data-driven decision-making.*

#### 1.3 Who is Affected
* **BUMDes Director (Primary):** Struggles with manual worker assignments and lacks visibility into project progress.
* **Village Residents (Secondary):** Face unfair distribution of job opportunities due to the lack of a formal skills registry.
* **Village Head (Stakeholder):** Cannot accurately assess the economic contribution of village projects to the community.

---

### 2. Objectives

#### 2.1 Business Objectives

| # | Objective | Why it matters | Success indicator |
|---|---|---|---|
| 1 | Centralize workforce data | Enables faster matching of skills to project needs. | 100% of project-active residents registered in the database. |
| 2 | Automate worker allocation | Reduces time spent on manual coordination. | 50% reduction in time from project creation to worker assignment. |
| 3 | Track revenue per project | Ensures transparency and helps identify profitable ventures. | Monthly revenue reports generated automatically by the system. |

#### 2.2 User Objectives

| Actor | What they need to accomplish | What stops them today |
|---|---|---|
| **Resident** | Register skills and get notified of jobs. | No platform to showcase their capabilities to village management. |
| **Manager** | Assign the right workers to specific tasks. | Reliance on memory or informal lists of who is "available." |

---

### 3. Success Metrics

| Metric | Baseline (now) | Target (3 months) | How it is measured |
|---|---|---|---|
| **Workforce Registry Size** | 0 (Manual lists) | 200+ Residents | Database count of `profiles` table. |
| **Assignment Speed** | ~3–5 Days | < 24 Hours | Timestamp difference between Project Creation and Assignment confirmation. |
| **Reporting Accuracy** | Manual / Incomplete | 100% Financial Transparency | Matching system revenue logs with BUMDes bank statements. |

---

### 4. Scope

#### 4.1 In Scope & Out of Scope (MVP v1.2)

| ✅ IN Scope (MVP) | ❌ OUT of Scope (v1) |
|---|---|
| Resident skills registration and categorization. | Automatic payroll/salary disbursements. |
| Project creation and workforce requirement definition. | Native Mobile App (MVP will be a Mobile-First Web App). |
| Skill-based worker recommendation engine. | Integration with national ID (Dukcapil) APIs. |
| Work progress recording and revenue tracking. | External vendor management. |
| Conflict detection for overlapping assignments. | Real-time chat/messaging between users. |
| **NEW:** Bilingual Indonesian-first localization & simplified copy. | |
| **NEW:** Assisted/Proxy Profile Registration by RT/RW. | |
| **NEW:** Progressive Web App (PWA) Offline Caching. | |
| **NEW:** WhatsApp notification & verification flow. | |
| **NEW:** Mobile-First UI/UX optimized for villagers. | |

#### 4.2 Assumptions & Constraints

| Type | Description |
|---|---|
| **Assumption** | Residents have access to devices (mobile or PC) to input data or can use a kiosk at the BUMDes office. |
| **Constraint** | System must run on local/cloud server connected to a database (Supabase PostgreSQL replacing XAMPP/MySQL). |
| **Constraint** | Legal Compliance: Data management must comply with Personal Data Protection Law (UU PDP) No. 27 of 2022. |

#### 4.3 Data Protection & Encryption Requirements
To comply with Indonesia's Personal Data Protection Law (UU No. 27 of 2022), the system shall implement:
* **Data in transit:** All communication between the user's browser and the server must use HTTPS (TLS 1.2 or higher).
* **Data at rest:** Personal data (name, contact information, skills) must be encrypted in the database using AES-256. (Supabase column-level encryption or PostgreSQL pgcrypto/RLS policies).
* **Passwords:** Stored using one-way hashing with bcrypt (cost factor ≥ 10) via Supabase Auth.
* **Encryption keys:** Must not be hard-coded in source code; keys will be stored in environment variables.
* **Backups:** All database backup files must also be encrypted.
* **User consent:** Residents must explicitly agree to the platform's Terms of Service and Privacy Policy during registration, providing opt-in consent for personal data processing as required by the PDP Law.

---

## PART 2: FUNCTIONAL REQUIREMENTS & WORKFLOWS

### 5. Functional Requirements

#### 5.1 FR Table: Resident

| FR ID | Actor | The system shall... | Condition / Trigger | Priority (MoSCoW) |
|---|---|---|---|---|
| **FR-R01** | Resident | Allow users to input skills and availability. | When the resident creates or updates their profile. | Must (M) |
| **FR-R02** | Resident | Display a notification on the resident’s dashboard and send an email or WhatsApp if provided. | When Manager confirms the assignment. | Should (S) |
| **FR-R03** | Resident | Update personal availability status. | When resident becomes unavailable or available. | Should (S) |
| **FR-R04** | Resident | Log progress (percentage, hours worked, description) for assigned tasks. | When worker reports work progress. | Must (M) |

#### 5.2 FR Table: Manager

| FR ID | Actor | The system shall... | Condition / Trigger | Priority (MoSCoW) |
|---|---|---|---|---|
| **FR-M01** | Manager | Create projects with specific skill requirements. | Project initiation. | Must (M) |
| **FR-M02** | Manager | Recommend workers based on skill matching. The system returns a list of residents whose skills match and are available. | After project requirements are set. | Must (M) |
| **FR-M03** | Manager | Generate project performance and revenue reports. | Dashboard request. | Must (M) |
| **FR-M04** | Manager | Notify assigned workers regarding project assignments. | After assignment confirmation. | Should (S) |
| **FR-M05** | Manager | View active project progress dashboard. | When manager accesses dashboard. | Must (M) |
| **FR-M06** | Manager | Filter workers based on skills and availability. | During workforce assignment process. | Should (S) |

---

### 6. User Workflows

#### 6.1 Workflow: Project Assignment & Workforce Allocation
* **Actor:** BUMDes Manager
* **Goal:** Successfully assign qualified residents to a new village project.
* **FRs covered:** FR-M01, FR-M02, FR-M04, FR-M06

##### Ideal Path
1. Manager initiates a project (e.g., "Mushroom Farm Expansion").
2. Manager defines required skills (e.g., "Agriculture", "Basic Accounting").
3. System analyzes `resident_skills` and recommends available workers.
4. Manager reviews and confirms the assignment list.
5. System updates `assignments` status and triggers worker notification.

##### Decision Points
* **Are there enough residents with the required skills?**
  * *YES:* System shows recommended list.
  * *NO:* Alert manager: *"Insufficient workers on skill X. Broaden the requirements or create a job posting."*
* **Does manager Confirm the final assignment list?**
  * *YES:* System saves assignment, triggers notifications.
  * *NO:* Return to recommended list for editing.

##### Edge Cases
* **A recommended resident is already assigned to another project with overlapping dates:** Flag resident as "conflict" and exclude from auto-selection, showing warning.
* **Manager changes requirements after recommendations are shown:** System recalculates recommendations automatically, clearing previous selection.
* **Resident’s availability changes after assignment (e.g., they leave the village):** Allow manager to unassign and re-search, mark previous assignment as void.

---

#### 6.2 Workflow: Project Monitoring & Revenue Tracking
* **Actor:** Worker / Manager
* **Goal:** Record project progress, monitor worker contributions, and generate financial analytics for managerial decision-making.
* **FRs covered:** FR-M03, FR-M05, FR-R04

##### Ideal Path
1. Worker accesses assigned project tasks from dashboard.
2. Worker updates work progress and contribution details.
3. System validates and stores submitted progress records.
4. Manager reviews project progress through dashboard analytics.
5. Manager records final project results and generated revenue.
6. System generates updated performance and revenue reports automatically.

##### Decision Points
* **Is the submitted progress data complete?**
  * *YES:* System saves progress update successfully.
  * *NO:* System requests missing or invalid information.
* **Has the project been completed?**
  * *YES:* System enables final revenue recording and report generation.
  * *NO:* System keeps project status active for further updates.

##### Edge Cases
* **Worker submits duplicate progress update:** System detects duplicate submission (same assignment, same progress % on same day) and asks user to confirm or edit.
* **Revenue exceeds expected budget range:** System flags abnormal financial input (revenue exceeds budget by >150%) and alerts manager.
* **Internet disconnects during submission:** System temporarily saves draft locally and allows retry submission.

---

#### 6.3 Workflow: Workforce Skills Registration
* **Actor:** Resident / Manager
* **Goal:** Register resident skills and availability into the workforce database for future project allocation.
* **FRs covered:** FR-R01, FR-R03

##### Ideal Path
1. Resident accesses the registration form through the system dashboard.
2. Resident inputs personal information, skills, experience, and availability status.
3. System validates submitted information for completeness and formatting.
4. System stores resident profile and skill data in the workforce database.
5. Manager reviews newly registered profiles if verification is required.
6. System updates the available workforce list for future project assignments.

##### Decision Points
* **Is all required registration information complete?**
  * *YES:* System accepts registration and stores data successfully.
  * *NO:* System highlights missing or invalid fields for correction.
* **Does the manager approve the submitted profile?**
  * *YES:* Resident profile becomes active in workforce database.
  * *NO:* System marks profile as pending revision or rejected.

##### Edge Cases
* **Resident submits duplicate registration data:** System detects duplicate records (based on contact numbers / email) and prompts resident to update existing profile instead.
* **Resident enters unsupported or unclear skill descriptions:** System suggests predefined skill categories or requests clarification.
* **Resident changes availability after approval:** System updates workforce database immediately and reflects changes in assignment recommendations.

---

## PART 3: INCLUSIVITY & ACCESSIBILITY SETTINGS FOR VILLAGERS

This section documents the specific refinements and features introduced in MVP v1.1 to accommodate villagers and less tech-savvy users.

### 7. Core Accessibility Architecture

#### 7.1 Bilingual Indonesian-First Localization & Conversational Copy
* **Requirement (F12):** The entire user interface must default to clean, conversational Bahasa Indonesia. Technical terms must be translated to match local terms.
* **Implementation Standard:**
  * Avoid dry system jargon (e.g. *"Bad request: invalid parameters"* becomes *"Ada data yang kurang lengkap. Silakan cek kembali formulir Anda."*).
  - Navigational mapping:
    - *Dashboard* -> **Beranda Utama**
    - *My Assignments* -> **Pekerjaan Saya**
    - *Skill Registration* -> **Sensus Keahlian**
    - *Availability* -> **Status Siap Bekerja**
    - *Report* -> **Laporan Hasil Kerja**
    - *Create Project* -> **Mulai Kegiatan Baru**

#### 7.2 Visual-First Dropdowns & Skill Grids
* **Requirement (F13):** Villagers registering skills should not be forced to type search queries or navigate nested text dropdowns.
* **Implementation Standard:**
  - A visual grid representation of skill categories. Each category must have a bold, recognizable icon (e.g., animal silhouette for Animal Husbandry, plant/padi for Farming, masonry trowel for Construction).
  - Size targets: Minimum interactive click target of **48px x 48px** to accommodate users with less steady hands or larger fingers on mobile screens.

#### 7.3 Assisted (Proxy) Registration & Profile Updates
* **Requirement (F14):** Acknowledging that some elder residents do not have smartphones or internet connection, the system must allow a manager or local community coordinator (e.g. Ketua RT/RW) to act as a proxy.
* **Implementation Standard:**
  - **Proxy Mode:** Managers can register a resident manually and assign them projects directly.
  - **Verification:** Profiles created by proxy do not require immediate email or password login. Instead, they are verified using their name and mobile number.
  - **Profile Delegation:** If the resident later gets access to a phone, the BUMDes manager can print a QR code containing an activation token to link the profile to their phone.

#### 7.4 WhatsApp Notification & Confirmations
* **Requirement (F15):** Since email is rarely checked by rural residents, WhatsApp is the primary notification channel.
* **Implementation Standard:**
  - When a resident is assigned to a project, the system triggers a WhatsApp message via an Indonesian gateway (e.g., Fonnte or Twilio WhatsApp).
  - The notification includes a direct token link. When clicked, it opens a simplified mobile page requiring **no login credentials** (only a 4-digit PIN confirmation) to accept or decline the assignment.
  - Template Example:
    > *"Halo Bapak/Ibu [Nama], Anda diusulkan untuk bergabung dalam kegiatan [Nama Kegiatan] sebagai [Keahlian]. Kerja dimulai tanggal [Tanggal Mulai]. Ketuk link ini untuk konfirmasi: [Link_Konfirmasi]"*

#### 7.5 Offline Resilience & Progressive Web App (PWA)
* **Requirement (F16):** Workers frequently operate in fields or plantations with zero cellular coverage. The progress update form must work offline.
* **Implementation Standard:**
  - Use a service worker and `LocalStorage` / `IndexedDB` caching to capture progress reports (hours worked, status, notes) offline.
  - Store submissions as "Draft Terkirim (Menunggu Sinyal)" in the UI.
  - Automatically sync updates with Supabase via background sync API when connection is restored.

#### 7.6 Mobile-First UI/UX & Responsive Layouts
* **Requirement (F17):** The resident interface (registration, dashboard, updates) must be designed mobile-first and optimized for simple touch navigation and slow mobile connections.
* **Implementation Standard:**
  - **Single-Column & Bottom Drawer Layouts:** On screen viewports under 768px, layouts collapse to single-columns. Complex desktop sidebars are replaced by an app-like bottom navigation bar.
  - **Touch & Size Targets:** Interactive elements must have touch targets of at least **48px x 48px** with clear separation to prevent mis-clicks.
  - **Virtual Keyboards:** Use proper inputs (`type="tel"` for phone, `type="number"` for progress percentage/hours) so appropriate numeric keypads trigger automatically on Android/iOS.
  - **Resource Optimization:** Icons and styling must be extremely lightweight (vector SVGs, system font stacks) to reduce load sizes over 2G/3G connections.

---

### 8. Accessibility Verification Metrics

| Accessibility Metric | Target Value | Measurement Method |
|---|---|---|
| **Text Scale Compatibility** | Up to 150% without break | Testing layouts using browser text-zoom settings. |
| **Bilingual Availability** | 100% Indonesian covered | Codebase static analysis checking for raw English strings in UI components. |
| **Proxy Registration Rate** | Supported for all profiles | Verifying `created_by` relationship and proxy badge in manager panel. |
| **Offline Form Retention** | No data loss on offline submit | Simulated offline submits on Chrome DevTools + page reload checks. |
| **Mobile-First Layout Compliance** | 100% fluid mobile view | Page layouts validation on viewport widths down to 320px without horizontal scroll. |

---

### 9. Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| **v0.1** | May 08, 2026 | All | Initial project draft. |
| **v1.0** | June 11, 2026 | Team | Added database schema tracking and detailed functional requirements. |
| **v1.1** | June 17, 2026 | Dani (AI Agent) | Enriched specifications with section 7 and 8 for villager accessibility and local language integration. Added proxy registration and offline PWA targets. |
| **v1.2** | June 17, 2026 | Dani (AI Agent) | Refined specifications to mandate mobile-first UI design patterns for residents. |
