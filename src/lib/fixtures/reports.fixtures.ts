// Mock fixtures for the V2 report/decision-layer data shapes.
// Dani: import these to build/preview components WITHOUT database access.
// Types are frozen — build against them; Abdullah wires the real queries into the
// server pages and passes the same shapes as props.
//
// `import type` keeps this file free of any server-only runtime code.
import type {
  DashboardProjectMetric,
  ManagerDashboardReport,
  ProjectHealth,
  RevenueReport,
  ImpactReport,
} from '@/lib/queries/reports';

function project(
  name: string,
  health: ProjectHealth,
  completion: number,
  opts: Partial<DashboardProjectMetric> = {}
): DashboardProjectMetric {
  const workersNeeded = opts.project?.workers_needed ?? 4;
  const active = opts.activeWorkers ?? Math.min(workersNeeded, 2);
  return {
    project: {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      status: health === 'completed' ? 'completed' : health === 'inactive' ? 'draft' : 'in_progress',
      start_date: '2026-05-01',
      end_date: '2026-08-01',
      budget: 75_000_000,
      actual_revenue: 40_000_000,
      workers_needed: workersNeeded,
      ...(opts.project ?? {}),
    },
    assignedWorkers: opts.assignedWorkers ?? active,
    activeAssignments: active,
    completionPercentage: completion,
    latestProgressAt: opts.latestProgressAt ?? '2026-07-10T04:00:00Z',
    activeWorkers: active,
    completedWorkers: opts.completedWorkers ?? (health === 'completed' ? workersNeeded : 0),
    totalRevenue: opts.totalRevenue ?? 40_000_000,
    revenueVsBudgetPct: opts.revenueVsBudgetPct ?? 53.3,
    scheduleElapsedPct: opts.scheduleElapsedPct ?? 60,
    health,
    understaffed: opts.understaffed ?? active < workersNeeded,
  };
}

const projects: DashboardProjectMetric[] = [
  project('Renovasi Balai Desa', 'delayed', 36, { scheduleElapsedPct: 78, understaffed: true, activeWorkers: 2, project: { id: 'p1', name: 'Renovasi Balai Desa', status: 'in_progress', start_date: '2026-04-20', end_date: '2026-07-05', budget: 75_000_000, actual_revenue: 0, workers_needed: 4 } }),
  project('Program Batik Desa', 'delayed', 57, { scheduleElapsedPct: 100, revenueVsBudgetPct: 172.5, totalRevenue: 69_000_000 }),
  project('Pengembangan Wisata Sungai', 'on_track', 20, { scheduleElapsedPct: 8, understaffed: true, activeWorkers: 3, project: { id: 'p3', name: 'Pengembangan Wisata Sungai', status: 'in_progress', start_date: '2026-06-20', end_date: '2026-08-30', budget: 120_000_000, actual_revenue: 30_000_000, workers_needed: 5 } }),
  project('Pelatihan Pertanian Organik', 'at_risk', 40, { scheduleElapsedPct: 60 }),
  project('Digitalisasi Administrasi', 'completed', 100, { completedWorkers: 2, totalRevenue: 28_000_000, revenueVsBudgetPct: 112 }),
  project('Pengelolaan Sampah Terpadu', 'inactive', 0, { activeWorkers: 0, understaffed: false }),
  project('Koperasi Digital', 'on_track', 65, {}),
  project('Pasar Desa Online', 'at_risk', 48, {}),
  project('Irigasi Sawah', 'on_track', 72, {}),
  project('Posyandu Sehat', 'delayed', 30, { scheduleElapsedPct: 85, understaffed: true }),
];

export const managerDashboardFixture: ManagerDashboardReport = {
  range: '90d',
  kpis: {
    totalProjects: projects.length,
    activeProjects: 8,
    activeWorkersDistinct: 7,
    totalResidents: 10,
    utilizationRate: 70,
    portfolioCompletion: 45.2,
    delayedCount: 3,
    atRiskCount: 2,
    understaffedCount: 4,
    totalRevenue: 213_000_000,
  },
  projects,
  topProjects: projects.slice(0, 8),
  alerts: [
    { kind: 'delayed', severity: 'high', projectId: 'p1', projectName: 'Renovasi Balai Desa', messageKey: 'alert.delayed', params: { completion: 36, elapsed: 78 } },
    { kind: 'understaffed', severity: 'medium', projectId: 'p3', projectName: 'Pengembangan Wisata Sungai', messageKey: 'alert.understaffed', params: { have: 3, need: 5 } },
    { kind: 'over_budget', severity: 'medium', projectId: 'program-batik-desa', projectName: 'Program Batik Desa', messageKey: 'alert.overBudget', params: { pct: 172.5 } },
    { kind: 'stale', severity: 'medium', projectId: 'posyandu-sehat', projectName: 'Posyandu Sehat', messageKey: 'alert.stale', params: { days: 7 } },
  ],
  recentActivity: Array.from({ length: 6 }, (_, i) => ({
    id: `act-${i}`,
    projectId: 'p3',
    projectName: 'Pengembangan Wisata Sungai',
    assignmentId: `asg-${i}`,
    workerId: `w-${i}`,
    workerName: ['Ahmad Fauzi', 'Siti Rahma', 'Budi Hartono', 'Dewi Lestari', 'Eko Prasetyo', 'Nur Aisyah'][i],
    progressPercentage: 20 + i * 10,
    status: 'in_progress' as const,
    description: 'Memasang papan petunjuk jalur wisata.',
    hoursWorked: 6 + i,
    createdAt: `2026-07-${10 - i}T04:00:00Z`,
  })),
  progressTrend: Array.from({ length: 8 }, (_, i) => ({
    date: `2026-07-${String(3 + i).padStart(2, '0')}`,
    averageProgress: 30 + i * 5,
  })),
  projectStatusDistribution: [
    { status: 'in_progress', count: 5 },
    { status: 'completed', count: 2 },
    { status: 'open', count: 1 },
    { status: 'draft', count: 2 },
  ],
  timeline: projects.map((p) => ({
    projectId: p.project.id,
    projectName: p.project.name,
    startDate: p.project.start_date,
    endDate: p.project.end_date,
    currentProgress: p.completionPercentage,
  })),
};

export const revenueReportFixture: RevenueReport = {
  range: '90d',
  totalRevenue: 213_000_000,
  projects: projects.slice(0, 5).map((p) => ({
    project: p.project,
    totalRevenue: p.totalRevenue,
    revenueCount: 2,
    budgetUtilization: p.revenueVsBudgetPct ?? 0,
    revenueVsBudgetPct: p.revenueVsBudgetPct,
    warning: (p.revenueVsBudgetPct ?? 0) > 150 ? 'Revenue is above 150% of the budget.' : null,
    monthlyTrend: [
      { month: '2026-06', amount: 20_000_000 },
      { month: '2026-07', amount: (p.totalRevenue ?? 0) - 20_000_000 },
    ],
  })),
  monthlyTotals: [
    { month: '2026-05', amount: 45_000_000 },
    { month: '2026-06', amount: 88_000_000 },
    { month: '2026-07', amount: 80_000_000 },
  ],
  records: [],
};

export const impactReportFixture: ImpactReport = {
  residentsEmployed: 8,
  totalResidents: 10,
  participationRate: 80,
  incomeGenerated: 213_000_000,
  activeProjects: 8,
  completedProjects: 2,
  totalHoursContributed: 1240.5,
};
