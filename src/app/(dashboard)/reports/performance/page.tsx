import {
  getManagerDashboardReport,
  getProjectAnalyticsReport,
} from '@/lib/queries/reports';
import { PerformanceTable } from '@/components/reports/PerformanceTable';
import { WorkerContributionTable } from '@/components/reports/WorkerContributionTable';
import { ExportButton } from '@/components/reports/ExportButton';
import { ProjectCompletionChart } from '@/components/dashboard/ProjectCompletionChart';
import { ProgressOverTimeChart } from '@/components/dashboard/ProgressOverTimeChart';

export const metadata = {
  title: 'Performance Report — DesaWorks',
  description: 'View project performance metrics, worker contributions, and progress trends.',
};

export default async function PerformanceReportPage() {
  const dashboard = await getManagerDashboardReport();

  // Build performance table data from dashboard metrics
  const performanceData = dashboard.projects.map((metric) => ({
    projectName: metric.project.name,
    completionPercentage: metric.completionPercentage,
    assignedWorkers: metric.assignedWorkers,
    activeAssignments: metric.activeAssignments,
    status: metric.project.status,
  }));

  // Build chart data for ProjectCompletionChart
  const completionChartData = dashboard.projects.map((metric) => ({
    projectName: metric.project.name,
    completionPercentage: metric.completionPercentage,
    assignedWorkers: metric.assignedWorkers,
  }));

  // Aggregate worker data from all projects with assignments
  const workerMap = new Map<
    string,
    {
      workerName: string;
      email: string;
      totalHoursWorked: number;
      taskCount: number;
      latestProgress: number | null;
      assignmentStatus: string;
    }
  >();

  const projectsWithAssignments = dashboard.projects.filter(
    (m) => m.assignedWorkers > 0
  );

  // Fetch analytics for projects with assignments (limit to first 10 for performance)
  const analyticsPromises = projectsWithAssignments
    .slice(0, 10)
    .map((m) => getProjectAnalyticsReport(m.project.id));

  const analyticsResults = await Promise.all(analyticsPromises);

  for (const analytics of analyticsResults) {
    for (const workerRow of analytics.workers) {
      const key = workerRow.worker.id;
      const existing = workerMap.get(key);

      if (existing) {
        existing.totalHoursWorked += workerRow.totalHoursWorked;
        existing.taskCount += workerRow.taskCount;
        // Keep the most recent progress
        if (
          workerRow.latestProgress &&
          (existing.latestProgress === null ||
            workerRow.latestProgress.progress_percentage > existing.latestProgress)
        ) {
          existing.latestProgress = workerRow.latestProgress.progress_percentage;
        }
        // Prefer active status over others
        if (
          workerRow.assignment.status === 'active' ||
          workerRow.assignment.status === 'confirmed'
        ) {
          existing.assignmentStatus = workerRow.assignment.status;
        }
      } else {
        workerMap.set(key, {
          workerName: workerRow.worker.full_name,
          email: workerRow.worker.email,
          totalHoursWorked: workerRow.totalHoursWorked,
          taskCount: workerRow.taskCount,
          latestProgress: workerRow.latestProgress?.progress_percentage ?? null,
          assignmentStatus: workerRow.assignment.status,
        });
      }
    }
  }

  const workerData = Array.from(workerMap.values()).sort(
    (a, b) => b.totalHoursWorked - a.totalHoursWorked
  );

  // Build CSV export data
  const performanceExportData = performanceData.map((row) => ({
    Project: row.projectName,
    'Completion (%)': row.completionPercentage,
    'Assigned Workers': row.assignedWorkers,
    'Active Assignments': row.activeAssignments,
    Status: row.status,
  }));

  const workerExportData = workerData.map((row) => ({
    Worker: row.workerName,
    Email: row.email,
    'Total Hours': row.totalHoursWorked,
    Tasks: row.taskCount,
    'Latest Progress (%)': row.latestProgress ?? 'N/A',
    Status: row.assignmentStatus,
  }));

  // Aggregate progress history for ProgressOverTimeChart
  const allProgressHistory = analyticsResults.flatMap(
    (a) => a.progressHistory
  );
  const progressByDate = new Map<string, number[]>();

  for (const point of allProgressHistory) {
    const values = progressByDate.get(point.date) ?? [];
    values.push(point.averageProgress);
    progressByDate.set(point.date, values);
  }

  const progressTrendData = Array.from(progressByDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({
      date,
      averageProgress:
        Math.round(
          (values.reduce((sum, v) => sum + v, 0) / values.length) * 10
        ) / 10,
    }));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      {/* Page header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">
          Reports
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          Performance Report
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Overview of project completion, worker contributions, and progress
          trends across all managed projects.
        </p>
      </div>

      {/* Summary stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Total Projects
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {dashboard.projects.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Active Workers
          </p>
          <p className="mt-1 text-2xl font-bold text-blue-600">
            {workerData.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Avg. Completion
          </p>
          <p className="mt-1 text-2xl font-bold text-teal-600">
            {performanceData.length > 0
              ? (
                  performanceData.reduce(
                    (sum, r) => sum + r.completionPercentage,
                    0
                  ) / performanceData.length
                ).toFixed(1)
              : '0'}
            %
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Total Hours Logged
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-600">
            {workerData
              .reduce((sum, r) => sum + r.totalHoursWorked, 0)
              .toFixed(1)}
            h
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <ProjectCompletionChart data={completionChartData} />
        <ProgressOverTimeChart data={progressTrendData} />
      </div>

      {/* Performance Table */}
      <section className="mb-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Project Performance
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Completion, workers, and status for each project.
            </p>
          </div>
          <ExportButton
            data={performanceExportData}
            filename="performance-report"
            label="Export Performance"
          />
        </div>
        <PerformanceTable data={performanceData} />
      </section>

      {/* Worker Contribution Table */}
      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Worker Contributions
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Aggregated hours, tasks, and progress for all assigned workers.
            </p>
          </div>
          <ExportButton
            data={workerExportData}
            filename="worker-contributions"
            label="Export Workers"
          />
        </div>
        <WorkerContributionTable data={workerData} />
      </section>
    </main>
  );
}
