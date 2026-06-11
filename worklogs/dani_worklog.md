# Work Log — Dani
> **Student ID:** 24523207
> **Role:** Developer — Project Monitoring & Revenue Tracking
> **Branch:** `feature/dani-monitoring-reports`
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

### Action: Start Wave 1 monitoring data layer
- **AI Agent Used**: GitHub Copilot
- **Prompt Given**: "Read AGENTS.md and my plan in docs/member-plans/dani_plan.md and let's start implementing Wave 1 of my feature. ⚠️ Critical: The AI agent must automatically update my worklog file in worklogs/dani_worklog.md as you make progress."
- **Result**: Installed Zod, then created the Wave 1 data-layer modules for monitoring: shared validation schemas, progress submission server actions, revenue submission server actions, and report aggregation helpers.
- **Decision Made**: Wave 1 stays focused on the data layer only; duplicate progress detection will use the same assignment, same UTC day, and same progress percentage, while revenue warnings will flag amounts that push a project over 150% of its budget.
- **Files Changed**: package.json, package-lock.json, src/lib/validations/monitoring.ts, src/lib/actions/progress.ts, src/lib/actions/revenue.ts, src/lib/queries/reports.ts, worklogs/dani_worklog.md
- **Commit**: Not yet committed

## Session 2 — 2026-06-11

### Action: Validate Wave 1 monitoring data layer
- **AI Agent Used**: GitHub Copilot
- **Prompt Given**: "Read AGENTS.md and my plan in docs/member-plans/dani_plan.md and let's start implementing Wave 1 of my feature. ⚠️ Critical: The AI agent must automatically update my worklog file in worklogs/dani_worklog.md as you make progress."
- **Result**: Ran ESLint and the Next.js production build after the Wave 1 implementation. Both passed successfully, confirming the new monitoring validation, action, and report modules compile cleanly.
- **Decision Made**: Kept the Wave 1 scope unchanged after validation; no follow-up edits were needed because the data layer compiled and linted cleanly.
- **Files Changed**: worklogs/dani_worklog.md
- **Commit**: Not yet committed
