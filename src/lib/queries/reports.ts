import { createClient } from '@/lib/supabase/server';
import type {
  ProgressStatus,
  ProjectStatus,
  RevenueRecord,
} from '@/lib/types/database';

// ============================================================================
// Report options: time window + Top-N density control (lecturer feedback)
// ============================================================================
export type RangeKey = '7d' | '30d' | '90d' | '365d' | 'all';

export interface ReportOptions {
  /** Rolling time window for trends/records. Defaults to '90d'. */
  range?: RangeKey;
  /** Explicit ISO lower bound (overrides range) — for a custom picker. */
  start?: string;
  /** Max items returned for charts (Top-N). Defaults to 8. */
  limit?: number;
}

const DEFAULT_RANGE: RangeKey = '90d';
const DEFAULT_TOP_N = 8;
const STALE_DAYS = 7;
const OVER_BUDGET_PCT = 150;
const RANGE_DAYS: Record<Exclude<RangeKey, 'all'>, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '365d': 365,
};

function resolveRangeStart(opts: ReportOptions): string | null {
  if (opts.start) return opts.start;
  const range = opts.range ?? DEFAULT_RANGE;
  if (range === 'all') return null;
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - RANGE_DAYS[range]);
  return d.toISOString();
}

// Bucket TIMESTAMPTZ by the user's local (WIB, UTC+7) calendar day — not UTC.
const WIB_DAY = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Jakarta',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
function wibDayKey(iso: string): string {
  return WIB_DAY.format(new Date(iso)); // YYYY-MM-DD
}

// ============================================================================
// Shared shapes
// ============================================================================
export type ProjectHealth = 'on_track' | 'at_risk' | 'delayed' | 'completed' | 'inactive';

interface ProjectOverviewRow {
  id: string;
  name: string;
  status: ProjectStatus;
  start_date: string | null;
  end_date: string | null;
  budget: number;
  actual_revenue: number;
  workers_needed: number;
}

export interface DashboardProjectMetric {
  project: ProjectOverviewRow;
  assignedWorkers: number;
  /** Distinct workers with a confirmed/active assignment (kept name for back-compat). */
  activeAssignments: number;
  completionPercentage: number;
  latestProgressAt: string | null;
  // ---- decision layer ----
  activeWorkers: number;
  completedWorkers: number;
  totalRevenue: number;
  revenueVsBudgetPct: number | null;
  scheduleElapsedPct: number | null;
  health: ProjectHealth;
  understaffed: boolean;
}

export interface DashboardActivityItem {
  id: string;
  projectId: string;
  projectName: string;
  assignmentId: string;
  workerId: string;
  workerName: string;
  progressPercentage: number;
  status: ProgressStatus;
  description: string | null;
  hoursWorked: number;
  createdAt: string;
}

export interface DashboardTimelinePoint {
  projectId: string;
  projectName: string;
  startDate: string | null;
  endDate: string | null;
  currentProgress: number;
}

export type AlertKind = 'delayed' | 'understaffed' | 'stale' | 'over_budget';

export interface DashboardAlert {
  kind: AlertKind;
  severity: 'high' | 'medium';
  projectId: string;
  projectName: string;
  /** i18n key describing the alert, plus params for interpolation. */
  messageKey: string;
  params: Record<string, string | number>;
}

export interface DashboardKpis {
  totalProjects: number;
  activeProjects: number;
  activeWorkersDistinct: number;
  totalResidents: number;
  utilizationRate: number; // % of residents currently assigned
  portfolioCompletion: number; // workers_needed-weighted, active projects only
  delayedCount: number;
  atRiskCount: number;
  understaffedCount: number;
  totalRevenue: number;
}

export interface ManagerDashboardReport {
  range: RangeKey;
  kpis: DashboardKpis;
  /** All projects (for tables + status distribution). */
  projects: DashboardProjectMetric[];
  /** Top-N most decision-relevant projects (for charts). */
  topProjects: DashboardProjectMetric[];
  alerts: DashboardAlert[];
  recentActivity: DashboardActivityItem[];
  progressTrend: { date: string; averageProgress: number }[];
  projectStatusDistribution: { status: ProjectStatus; count: number }[];
  timeline: DashboardTimelinePoint[];
}

// Raw row returned by project_metrics_v (NUMERICs arrive as strings via PostgREST).
interface MetricViewRow {
  id: string;
  name: string;
  status: ProjectStatus;
  created_by: string;
  start_date: string | null;
  end_date: string | null;
  budget: string | number;
  workers_needed: number;
  assigned_workers: number;
  active_workers: number;
  completed_workers: number;
  assignment_count: number;
  latest_progress_at: string | null;
  total_revenue: string | number;
  revenue_count: number;
  completion_pct: string | number;
  revenue_vs_budget_pct: string | number | null;
  schedule_elapsed_pct: string | number | null;
  health: ProjectHealth;
  understaffed: boolean;
}

function mapMetric(r: MetricViewRow): DashboardProjectMetric {
  const budget = Number(r.budget);
  const totalRevenue = Number(r.total_revenue);
  return {
    project: {
      id: r.id,
      name: r.name,
      status: r.status,
      start_date: r.start_date,
      end_date: r.end_date,
      budget,
      actual_revenue: totalRevenue,
      workers_needed: r.workers_needed,
    },
    assignedWorkers: r.assigned_workers,
    activeAssignments: r.active_workers,
    completionPercentage: Number(r.completion_pct),
    latestProgressAt: r.latest_progress_at,
    activeWorkers: r.active_workers,
    completedWorkers: r.completed_workers,
    totalRevenue,
    revenueVsBudgetPct: r.revenue_vs_budget_pct === null ? null : Number(r.revenue_vs_budget_pct),
    scheduleElapsedPct: r.schedule_elapsed_pct === null ? null : Number(r.schedule_elapsed_pct),
    health: r.health,
    understaffed: r.understaffed,
  };
}

// Severity ordering so the riskiest projects surface first in Top-N + tables.
const HEALTH_RANK: Record<ProjectHealth, number> = {
  delayed: 0,
  at_risk: 1,
  on_track: 2,
  completed: 3,
  inactive: 4,
};

function byDecisionRelevance(a: DashboardProjectMetric, b: DashboardProjectMetric): number {
  const h = HEALTH_RANK[a.health] - HEALTH_RANK[b.health];
  if (h !== 0) return h;
  if (a.understaffed !== b.understaffed) return a.understaffed ? -1 : 1;
  // most recently active first
  const at = a.latestProgressAt ? new Date(a.latestProgressAt).getTime() : 0;
  const bt = b.latestProgressAt ? new Date(b.latestProgressAt).getTime() : 0;
  return bt - at;
}

const ACTIVE_ASSIGNMENT_STATES = ['confirmed', 'active'] as const;

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

// ============================================================================
// Manager dashboard
// ============================================================================
export async function getManagerDashboardReport(
  opts: ReportOptions = {}
): Promise<ManagerDashboardReport> {
  const supabase = await createClient();
  const range = opts.range ?? DEFAULT_RANGE;
  const limit = opts.limit ?? DEFAULT_TOP_N;
  const rangeStart = resolveRangeStart(opts);

  // 1) Correct per-project metrics — one bounded query, computed in SQL.
  const { data: metricRows } = await supabase.from('project_metrics_v').select('*');
  const metrics = ((metricRows ?? []) as MetricViewRow[]).map(mapMetric);

  // 2) Distinct active workers + total residents (for utilization) — small queries.
  const [{ data: activeAssignmentRows }, { count: residentCount }] = await Promise.all([
    supabase.from('assignments').select('resident_id').in('status', ACTIVE_ASSIGNMENT_STATES as unknown as string[]),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'resident'),
  ]);
  const activeWorkersDistinct = new Set((activeAssignmentRows ?? []).map((r) => r.resident_id)).size;
  const totalResidents = residentCount ?? 0;

  // 3) Portfolio KPIs (workers_needed-weighted completion over ACTIVE projects only).
  const activeProjectsList = metrics.filter((m) => !['draft', 'cancelled'].includes(m.project.status));
  const weightNum = activeProjectsList.reduce((s, m) => s + m.completionPercentage * m.project.workers_needed, 0);
  const weightDen = activeProjectsList.reduce((s, m) => s + m.project.workers_needed, 0);
  const kpis: DashboardKpis = {
    totalProjects: metrics.length,
    activeProjects: activeProjectsList.length,
    activeWorkersDistinct,
    totalResidents,
    utilizationRate: totalResidents > 0 ? Math.round((activeWorkersDistinct / totalResidents) * 1000) / 10 : 0,
    portfolioCompletion: weightDen > 0 ? Math.round((weightNum / weightDen) * 10) / 10 : 0,
    delayedCount: metrics.filter((m) => m.health === 'delayed').length,
    atRiskCount: metrics.filter((m) => m.health === 'at_risk').length,
    understaffedCount: metrics.filter((m) => m.understaffed).length,
    totalRevenue: metrics.reduce((s, m) => s + m.totalRevenue, 0),
  };

  // 4) Alerts (the "what should I do" layer).
  const staleCutoff = Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000;
  const alerts: DashboardAlert[] = [];
  for (const m of metrics) {
    if (m.health === 'delayed') {
      alerts.push({
        kind: 'delayed', severity: 'high', projectId: m.project.id, projectName: m.project.name,
        messageKey: 'alert.delayed',
        params: { completion: m.completionPercentage, elapsed: m.scheduleElapsedPct ?? 0 },
      });
    }
    if (m.understaffed) {
      alerts.push({
        kind: 'understaffed', severity: 'medium', projectId: m.project.id, projectName: m.project.name,
        messageKey: 'alert.understaffed',
        params: { have: m.activeWorkers, need: m.project.workers_needed },
      });
    }
    const isActiveProject = ['open', 'in_progress'].includes(m.project.status);
    const stale = isActiveProject && m.assignedWorkers > 0 &&
      (!m.latestProgressAt || new Date(m.latestProgressAt).getTime() < staleCutoff);
    if (stale) {
      alerts.push({
        kind: 'stale', severity: 'medium', projectId: m.project.id, projectName: m.project.name,
        messageKey: 'alert.stale', params: { days: STALE_DAYS },
      });
    }
    if (m.revenueVsBudgetPct !== null && m.revenueVsBudgetPct > OVER_BUDGET_PCT) {
      alerts.push({
        kind: 'over_budget', severity: 'medium', projectId: m.project.id, projectName: m.project.name,
        messageKey: 'alert.overBudget', params: { pct: m.revenueVsBudgetPct },
      });
    }
  }
  alerts.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === 'high' ? -1 : 1));

  // 5) Status distribution — drop zero-count buckets (no empty pie slices).
  const statusCounts = new Map<ProjectStatus, number>();
  for (const m of metrics) statusCounts.set(m.project.status, (statusCounts.get(m.project.status) ?? 0) + 1);
  const projectStatusDistribution = Array.from(statusCounts.entries())
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);

  // 6) Ranked projects + Top-N for charts.
  const rankedProjects = [...metrics].sort(byDecisionRelevance);
  const topProjects = rankedProjects.slice(0, limit);

  // 7) Progress trend (WIB day buckets, range-filtered, latest-per-assignment-per-day).
  const progressTrend = await buildProgressTrend(supabase, rangeStart, null);

  // 8) Recent activity (bounded).
  const recentActivity = await buildRecentActivity(supabase, rangeStart, null, 20);

  // 9) Timeline for the ranked projects.
  const timeline: DashboardTimelinePoint[] = rankedProjects.map((m) => ({
    projectId: m.project.id,
    projectName: m.project.name,
    startDate: m.project.start_date,
    endDate: m.project.end_date,
    currentProgress: m.completionPercentage,
  }));

  return {
    range,
    kpis,
    projects: rankedProjects,
    topProjects,
    alerts,
    recentActivity,
    progressTrend,
    projectStatusDistribution,
    timeline,
  };
}

// ---- shared: progress trend ------------------------------------------------
async function buildProgressTrend(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rangeStart: string | null,
  assignmentIds: string[] | null
): Promise<{ date: string; averageProgress: number }[]> {
  if (assignmentIds && assignmentIds.length === 0) return [];
  let query = supabase
    .from('progress_updates')
    .select('assignment_id, progress_percentage, created_at')
    .order('created_at', { ascending: false });
  if (rangeStart) query = query.gte('created_at', rangeStart);
  if (assignmentIds) query = query.in('assignment_id', assignmentIds);

  const { data } = await query;
  const rows = (data ?? []) as unknown as {
    assignment_id: string;
    progress_percentage: number;
    created_at: string;
  }[];

  // For each WIB day, keep the latest update per assignment, then average those.
  const perDay = new Map<string, Map<string, number>>();
  for (const row of rows) {
    const day = wibDayKey(row.created_at);
    const dayMap = perDay.get(day) ?? new Map<string, number>();
    if (!dayMap.has(row.assignment_id)) dayMap.set(row.assignment_id, row.progress_percentage); // rows are desc → first is latest
    perDay.set(day, dayMap);
  }
  return Array.from(perDay.entries())
    .map(([date, m]) => ({ date, averageProgress: Math.round(average([...m.values()]) * 10) / 10 }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ---- shared: recent activity ----------------------------------------------
async function buildRecentActivity(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rangeStart: string | null,
  assignmentIds: string[] | null,
  limit: number
): Promise<DashboardActivityItem[]> {
  if (assignmentIds && assignmentIds.length === 0) return [];
  let query = supabase
    .from('progress_updates')
    .select(
      `id, assignment_id, reported_by, progress_percentage, status, description, hours_worked, created_at,
       assignment:assignments!inner ( project_id, project:projects ( name ) ),
       reporter:profiles!progress_updates_reported_by_fkey ( full_name )`
    )
    .order('created_at', { ascending: false })
    .limit(limit);
  if (rangeStart) query = query.gte('created_at', rangeStart);
  if (assignmentIds) query = query.in('assignment_id', assignmentIds);

  const { data } = await query;
  const one = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? v[0] ?? null : v ?? null);

  return ((data ?? []) as unknown as Record<string, unknown>[]).map((row) => {
    const assignment = one(row.assignment as any);
    const project = assignment ? one(assignment.project) : null;
    const reporter = one(row.reporter as any);
    return {
      id: row.id as string,
      projectId: (assignment?.project_id as string) ?? '',
      projectName: (project?.name as string) ?? 'Unknown project',
      assignmentId: row.assignment_id as string,
      workerId: row.reported_by as string,
      workerName: (reporter?.full_name as string) ?? 'Unknown worker',
      progressPercentage: row.progress_percentage as number,
      status: row.status as ProgressStatus,
      description: (row.description as string) ?? null,
      hoursWorked: Number(row.hours_worked ?? 0),
      createdAt: row.created_at as string,
    };
  });
}

// ============================================================================
// Per-project analytics (no full-table reload — filters by projectId)
// ============================================================================
export interface ProjectAnalyticsWorkerRow {
  assignment: {
    id: string;
    project_id: string;
    resident_id: string;
    status: string;
    assigned_at: string;
    confirmed_at: string | null;
    completed_at: string | null;
    notes: string | null;
  };
  worker: { id: string; full_name: string; email: string; role: string };
  latestProgress: { progress_percentage: number } | null;
  totalHoursWorked: number;
  taskCount: number;
}

export interface ProjectAnalyticsReport {
  project: ProjectOverviewRow | null;
  metric: DashboardProjectMetric | null;
  workers: ProjectAnalyticsWorkerRow[];
  progressHistory: { date: string; averageProgress: number }[];
  activityFeed: DashboardActivityItem[];
}

export async function getProjectAnalyticsReport(
  projectId: string,
  opts: ReportOptions = {}
): Promise<ProjectAnalyticsReport> {
  const supabase = await createClient();
  const rangeStart = resolveRangeStart(opts);

  const { data: metricRow } = await supabase
    .from('project_metrics_v')
    .select('*')
    .eq('id', projectId)
    .maybeSingle();
  const metric = metricRow ? mapMetric(metricRow as MetricViewRow) : null;

  const { data: assignmentRows } = await supabase
    .from('assignments')
    .select('id, project_id, resident_id, status, assigned_at, confirmed_at, completed_at, notes, worker:profiles!assignments_resident_id_fkey ( id, full_name, email, role )')
    .eq('project_id', projectId);

  const assignments = (assignmentRows ?? []) as unknown as Record<string, any>[];
  const assignmentIds = assignments.map((a) => a.id as string);

  let progressRows: { assignment_id: string; progress_percentage: number; hours_worked: number | string; created_at: string }[] = [];
  if (assignmentIds.length > 0) {
    const { data } = await supabase
      .from('progress_updates')
      .select('assignment_id, progress_percentage, hours_worked, created_at')
      .in('assignment_id', assignmentIds)
      .order('created_at', { ascending: false });
    progressRows = (data ?? []) as typeof progressRows;
  }

  const latestByAssignment = new Map<string, number>();
  const hoursByAssignment = new Map<string, number>();
  const countByAssignment = new Map<string, number>();
  for (const p of progressRows) {
    if (!latestByAssignment.has(p.assignment_id)) latestByAssignment.set(p.assignment_id, p.progress_percentage);
    hoursByAssignment.set(p.assignment_id, (hoursByAssignment.get(p.assignment_id) ?? 0) + Number(p.hours_worked ?? 0));
    countByAssignment.set(p.assignment_id, (countByAssignment.get(p.assignment_id) ?? 0) + 1);
  }

  const one = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? v[0] ?? null : v ?? null);
  const workers: ProjectAnalyticsWorkerRow[] = assignments.map((a) => {
    const w = one(a.worker) ?? { id: a.resident_id, full_name: 'Unknown worker', email: '', role: 'resident' };
    const latest = latestByAssignment.get(a.id);
    return {
      assignment: {
        id: a.id, project_id: a.project_id, resident_id: a.resident_id, status: a.status,
        assigned_at: a.assigned_at, confirmed_at: a.confirmed_at, completed_at: a.completed_at, notes: a.notes,
      },
      worker: { id: w.id, full_name: w.full_name, email: w.email, role: w.role },
      latestProgress: latest === undefined ? null : { progress_percentage: latest },
      totalHoursWorked: Math.round((hoursByAssignment.get(a.id) ?? 0) * 10) / 10,
      taskCount: countByAssignment.get(a.id) ?? 0,
    };
  });

  const progressHistory = await buildProgressTrend(supabase, rangeStart, assignmentIds);
  const activityFeed = await buildRecentActivity(supabase, rangeStart, assignmentIds, 20);

  return { project: metric?.project ?? null, metric, workers, progressHistory, activityFeed };
}

// ============================================================================
// Revenue report
// ============================================================================
export interface RevenueProjectSummary {
  project: ProjectOverviewRow;
  totalRevenue: number;
  revenueCount: number;
  /** revenue ÷ budget × 100 (0 when no budget). Kept name for back-compat. */
  budgetUtilization: number;
  /** null when budget <= 0 — use this to exclude from averages. */
  revenueVsBudgetPct: number | null;
  warning: string | null;
  monthlyTrend: { month: string; amount: number }[];
}

export interface RevenueReport {
  range: RangeKey;
  totalRevenue: number;
  projects: RevenueProjectSummary[];
  monthlyTotals: { month: string; amount: number }[];
  records: Array<RevenueRecord & { projectName: string; recordedByName: string | null }>;
}

export async function getRevenueReport(opts: ReportOptions = {}): Promise<RevenueReport> {
  const supabase = await createClient();
  const range = opts.range ?? DEFAULT_RANGE;
  const rangeStart = resolveRangeStart(opts);

  const { data: metricRows } = await supabase.from('project_metrics_v').select('*');
  const metrics = ((metricRows ?? []) as MetricViewRow[]).map(mapMetric);

  // Revenue records within range, joined with project + recorder names.
  let recordQuery = supabase
    .from('revenue_records')
    .select('id, project_id, recorded_by, amount, description, record_date, created_at, project:projects ( name ), recorder:profiles!revenue_records_recorded_by_fkey ( full_name )')
    .order('record_date', { ascending: false })
    .limit(500);
  if (rangeStart) recordQuery = recordQuery.gte('created_at', rangeStart);
  const { data: recordRows } = await recordQuery;

  const one = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? v[0] ?? null : v ?? null);
  const records = ((recordRows ?? []) as unknown as Record<string, any>[]).map((r) => ({
    id: r.id, project_id: r.project_id, recorded_by: r.recorded_by,
    amount: Number(r.amount), description: r.description ?? null,
    record_date: r.record_date, created_at: r.created_at,
    projectName: (one(r.project)?.name as string) ?? 'Unknown project',
    recordedByName: (one(r.recorder)?.full_name as string) ?? null,
  })) as RevenueReport['records'];

  // Monthly totals across all records in range (record_date is a DATE — no TZ issue).
  const monthlyMap = new Map<string, number>();
  for (const r of records) {
    const month = r.record_date.slice(0, 7);
    monthlyMap.set(month, (monthlyMap.get(month) ?? 0) + Number(r.amount));
  }
  const monthlyTotals = Array.from(monthlyMap.entries())
    .map(([month, amount]) => ({ month, amount: Math.round(amount * 100) / 100 }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Per-project revenue summary from the metrics view (correct revenue-vs-budget).
  const recordsByProject = new Map<string, typeof records>();
  for (const r of records) {
    const list = recordsByProject.get(r.project_id) ?? [];
    list.push(r);
    recordsByProject.set(r.project_id, list);
  }
  const projects: RevenueProjectSummary[] = metrics.map((m) => {
    const monthly = new Map<string, number>();
    for (const r of recordsByProject.get(m.project.id) ?? []) {
      const month = r.record_date.slice(0, 7);
      monthly.set(month, (monthly.get(month) ?? 0) + Number(r.amount));
    }
    return {
      project: m.project,
      totalRevenue: m.totalRevenue,
      revenueCount: m.project.id ? (recordsByProject.get(m.project.id)?.length ?? 0) : 0,
      budgetUtilization: m.revenueVsBudgetPct ?? 0,
      revenueVsBudgetPct: m.revenueVsBudgetPct,
      warning: m.revenueVsBudgetPct !== null && m.revenueVsBudgetPct > OVER_BUDGET_PCT
        ? `Revenue is above ${OVER_BUDGET_PCT}% of the budget.`
        : null,
      monthlyTrend: Array.from(monthly.entries())
        .map(([month, amount]) => ({ month, amount: Math.round(amount * 100) / 100 }))
        .sort((a, b) => a.month.localeCompare(b.month)),
    };
  });

  return {
    range,
    totalRevenue: metrics.reduce((s, m) => s + m.totalRevenue, 0),
    projects,
    monthlyTotals,
    records,
  };
}
