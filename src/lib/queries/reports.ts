import { createClient } from '@/lib/supabase/server';
import type {
  Assignment,
  Profile,
  ProgressStatus,
  ProgressUpdate,
  Project,
  ProjectStatus,
  RevenueRecord,
} from '@/lib/types/database';

type ProjectOverviewRow = Pick<
  Project,
  'id' | 'name' | 'status' | 'start_date' | 'end_date' | 'budget' | 'actual_revenue' | 'workers_needed'
>;

type ProfileSummary = Pick<Profile, 'id' | 'full_name' | 'email' | 'role'>;

type AssignmentSummary = Pick<
  Assignment,
  'id' | 'project_id' | 'resident_id' | 'status' | 'assigned_at' | 'confirmed_at' | 'completed_at' | 'notes'
>;

export interface DashboardProjectMetric {
  project: ProjectOverviewRow;
  assignedWorkers: number;
  activeAssignments: number;
  completionPercentage: number;
  latestProgressAt: string | null;
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

export interface ManagerDashboardReport {
  projects: DashboardProjectMetric[];
  recentActivity: DashboardActivityItem[];
  progressTrend: { date: string; averageProgress: number }[];
  projectStatusDistribution: { status: ProjectStatus; count: number }[];
  timeline: DashboardTimelinePoint[];
}

export interface ProjectAnalyticsWorkerRow {
  assignment: AssignmentSummary;
  worker: ProfileSummary;
  latestProgress: ProgressUpdate | null;
  totalHoursWorked: number;
  taskCount: number;
}

export interface ProjectAnalyticsReport {
  project: ProjectOverviewRow | null;
  workers: ProjectAnalyticsWorkerRow[];
  progressHistory: { date: string; averageProgress: number }[];
  activityFeed: DashboardActivityItem[];
}

export interface RevenueProjectSummary {
  project: ProjectOverviewRow;
  totalRevenue: number;
  revenueCount: number;
  budgetUtilization: number;
  warning: string | null;
  monthlyTrend: { month: string; amount: number }[];
}

export interface RevenueReport {
  projects: RevenueProjectSummary[];
  monthlyTotals: { month: string; amount: number }[];
  records: Array<RevenueRecord & { projectName: string; recordedByName: string | null }>;
}

function toMonthKey(dateString: string) {
  return dateString.slice(0, 7);
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function sumNumericField<T>(items: T[], mapper: (item: T) => number) {
  return items.reduce((sum, item) => sum + mapper(item), 0);
}

function buildCompletionPercentage(progressEntries: ProgressUpdate[]) {
  if (progressEntries.length === 0) {
    return 0;
  }

  return Math.round(average(progressEntries.map((entry) => entry.progress_percentage)) * 10) / 10;
}

function buildWarningForRevenue(project: ProjectOverviewRow, totalRevenue: number) {
  const threshold = Number(project.budget) * 1.5;

  if (Number(project.budget) <= 0 || totalRevenue <= threshold) {
    return null;
  }

  return `Revenue is above 150% of the budget (${threshold.toFixed(2)} threshold).`;
}

async function loadCoreData(supabase: Awaited<ReturnType<typeof createClient>>) {
  const [projectsResult, assignmentsResult, progressResult, revenueResult, profilesResult] = await Promise.all([
    supabase
      .from('projects')
      .select('id, name, description, created_by, status, start_date, end_date, budget, actual_revenue, workers_needed, created_at, updated_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('assignments')
      .select('id, project_id, resident_id, assigned_by, status, assigned_at, confirmed_at, completed_at, notes'),
    supabase
      .from('progress_updates')
      .select('id, assignment_id, reported_by, progress_percentage, status, description, hours_worked, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('revenue_records')
      .select('id, project_id, recorded_by, amount, description, record_date, created_at')
      .order('record_date', { ascending: false }),
    supabase.from('profiles').select('id, full_name, email, role'),
  ]);

  return {
    projects: (projectsResult.data ?? []) as ProjectOverviewRow[],
    assignments: (assignmentsResult.data ?? []) as AssignmentSummary[],
    progressUpdates: (progressResult.data ?? []) as ProgressUpdate[],
    revenueRecords: (revenueResult.data ?? []) as RevenueRecord[],
    profiles: (profilesResult.data ?? []) as ProfileSummary[],
  };
}

function buildProfileLookup(profiles: ProfileSummary[]) {
  return new Map(profiles.map((profile) => [profile.id, profile]));
}

function buildAssignmentLookup(assignments: AssignmentSummary[]) {
  return new Map(assignments.map((assignment) => [assignment.id, assignment]));
}

function groupProgressByAssignment(progressUpdates: ProgressUpdate[]) {
  const grouped = new Map<string, ProgressUpdate[]>();

  for (const update of progressUpdates) {
    const items = grouped.get(update.assignment_id) ?? [];
    items.push(update);
    grouped.set(update.assignment_id, items);
  }

  return grouped;
}

function getLatestProgressByAssignment(progressUpdates: ProgressUpdate[]) {
  const latest = new Map<string, ProgressUpdate>();

  for (const update of progressUpdates) {
    if (!latest.has(update.assignment_id)) {
      latest.set(update.assignment_id, update);
    }
  }

  return latest;
}

function buildDashboardActivityItems(
  progressUpdates: ProgressUpdate[],
  assignments: AssignmentSummary[],
  projects: ProjectOverviewRow[],
  profiles: ProfileSummary[]
) {
  const assignmentLookup = buildAssignmentLookup(assignments);
  const projectLookup = new Map(projects.map((project) => [project.id, project]));
  const profileLookup = buildProfileLookup(profiles);

  return progressUpdates.slice(0, 20).map((update) => {
    const assignment = assignmentLookup.get(update.assignment_id);
    const project = assignment ? projectLookup.get(assignment.project_id) : null;
    const worker = profileLookup.get(update.reported_by);

    return {
      id: update.id,
      projectId: assignment?.project_id ?? '',
      projectName: project?.name ?? 'Unknown project',
      assignmentId: update.assignment_id,
      workerId: update.reported_by,
      workerName: worker?.full_name ?? 'Unknown worker',
      progressPercentage: update.progress_percentage,
      status: update.status,
      description: update.description,
      hoursWorked: Number(update.hours_worked),
      createdAt: update.created_at,
    };
  });
}

export async function getManagerDashboardReport(): Promise<ManagerDashboardReport> {
  const supabase = await createClient();
  const { projects, assignments, progressUpdates, profiles } = await loadCoreData(supabase);

  const latestProgressByAssignment = getLatestProgressByAssignment(progressUpdates);

  const projectMetrics = projects.map((project) => {
    const projectAssignments = assignments.filter((assignment) => assignment.project_id === project.id && assignment.status !== 'void');
    const projectLatestUpdates = projectAssignments
      .map((assignment) => latestProgressByAssignment.get(assignment.id))
      .filter((update): update is ProgressUpdate => Boolean(update));
    const latestProgressAt =
      projectLatestUpdates.length > 0
        ? projectLatestUpdates.reduce((latest, update) =>
            new Date(update.created_at).getTime() > new Date(latest.created_at).getTime() ? update : latest
          ).created_at
        : null;

    return {
      project,
      assignedWorkers: projectAssignments.length,
      activeAssignments: projectAssignments.filter((assignment) => assignment.status === 'active' || assignment.status === 'confirmed').length,
      completionPercentage: buildCompletionPercentage(projectLatestUpdates),
      latestProgressAt,
    };
  });

  const progressTrendMap = new Map<string, number[]>();

  for (const update of progressUpdates) {
    const dateKey = update.created_at.slice(0, 10);
    const values = progressTrendMap.get(dateKey) ?? [];
    values.push(update.progress_percentage);
    progressTrendMap.set(dateKey, values);
  }

  const progressTrend = Array.from(progressTrendMap.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, values]) => ({
      date,
      averageProgress: Math.round(average(values) * 10) / 10,
    }));

  const projectStatusDistribution = (['draft', 'open', 'in_progress', 'completed', 'cancelled'] as ProjectStatus[]).map((status) => ({
    status,
    count: projects.filter((project) => project.status === status).length,
  }));

  const timeline = projectMetrics.map(({ project, completionPercentage }) => ({
    projectId: project.id,
    projectName: project.name,
    startDate: project.start_date,
    endDate: project.end_date,
    currentProgress: completionPercentage,
  }));

  return {
    projects: projectMetrics,
    recentActivity: buildDashboardActivityItems(progressUpdates, assignments, projects, profiles),
    progressTrend,
    projectStatusDistribution,
    timeline,
  };
}

export async function getProjectAnalyticsReport(projectId: string): Promise<ProjectAnalyticsReport> {
  const supabase = await createClient();
  const { projects, assignments, progressUpdates, profiles } = await loadCoreData(supabase);

  const project = projects.find((entry) => entry.id === projectId) ?? null;
  const projectAssignments = assignments.filter((assignment) => assignment.project_id === projectId);
  const assignmentLookup = buildAssignmentLookup(projectAssignments);
  const profileLookup = buildProfileLookup(profiles);
  const relevantUpdates = progressUpdates.filter((update) => assignmentLookup.has(update.assignment_id));
  const latestProgressByAssignment = getLatestProgressByAssignment(relevantUpdates);
  const progressByAssignment = groupProgressByAssignment(relevantUpdates);

  const workers = projectAssignments.map((assignment) => {
    const worker = profileLookup.get(assignment.resident_id) ?? {
      id: assignment.resident_id,
      full_name: 'Unknown worker',
      email: '',
      role: 'resident',
    };
    const assignmentUpdates = progressByAssignment.get(assignment.id) ?? [];

    return {
      assignment,
      worker,
      latestProgress: latestProgressByAssignment.get(assignment.id) ?? null,
      totalHoursWorked: Math.round(sumNumericField(assignmentUpdates, (update) => Number(update.hours_worked)) * 10) / 10,
      taskCount: assignmentUpdates.length,
    };
  });

  const progressHistoryMap = new Map<string, number[]>();

  for (const update of relevantUpdates) {
    const dateKey = update.created_at.slice(0, 10);
    const values = progressHistoryMap.get(dateKey) ?? [];
    values.push(update.progress_percentage);
    progressHistoryMap.set(dateKey, values);
  }

  const progressHistory = Array.from(progressHistoryMap.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, values]) => ({
      date,
      averageProgress: Math.round(average(values) * 10) / 10,
    }));

  return {
    project,
    workers,
    progressHistory,
    activityFeed: buildDashboardActivityItems(relevantUpdates, assignments, projects, profiles),
  };
}

export async function getRevenueReport(): Promise<RevenueReport> {
  const supabase = await createClient();
  const { projects, revenueRecords, profiles } = await loadCoreData(supabase);

  const projectLookup = new Map(projects.map((project) => [project.id, project]));
  const profileLookup = buildProfileLookup(profiles);

  const monthlyTotalsMap = new Map<string, number>();

  for (const record of revenueRecords) {
    const monthKey = toMonthKey(record.record_date);
    const currentAmount = monthlyTotalsMap.get(monthKey) ?? 0;
    monthlyTotalsMap.set(monthKey, currentAmount + Number(record.amount));
  }

  const monthlyTotals = Array.from(monthlyTotalsMap.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([month, amount]) => ({
      month,
      amount: Math.round(amount * 100) / 100,
    }));

  const records = revenueRecords.map((record) => ({
    ...record,
    projectName: projectLookup.get(record.project_id)?.name ?? 'Unknown project',
    recordedByName: profileLookup.get(record.recorded_by)?.full_name ?? null,
  }));

  const projectsSummary = projects.map((project) => {
    const projectRecords = revenueRecords.filter((record) => record.project_id === project.id);
    const totalRevenue = Math.round(sumNumericField(projectRecords, (record) => Number(record.amount)) * 100) / 100;
    const monthlyTrendMap = new Map<string, number>();

    for (const record of projectRecords) {
      const monthKey = toMonthKey(record.record_date);
      monthlyTrendMap.set(monthKey, (monthlyTrendMap.get(monthKey) ?? 0) + Number(record.amount));
    }

    const monthlyTrend = Array.from(monthlyTrendMap.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([month, amount]) => ({
        month,
        amount: Math.round(amount * 100) / 100,
      }));

    return {
      project,
      totalRevenue,
      revenueCount: projectRecords.length,
      budgetUtilization: Number(project.budget) <= 0 ? 0 : Math.round((totalRevenue / Number(project.budget)) * 1000) / 10,
      warning: buildWarningForRevenue(project, totalRevenue),
      monthlyTrend,
    };
  });

  return {
    projects: projectsSummary,
    monthlyTotals,
    records,
  };
}
