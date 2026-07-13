import { cookies } from 'next/headers';
import {
  getManagerDashboardReport,
  getProjectAnalyticsReport,
} from '@/lib/queries/reports';
import { PerformanceTable } from '@/components/reports/PerformanceTable';
import { WorkerContributionTable } from '@/components/reports/WorkerContributionTable';
import { ExportButton } from '@/components/reports/ExportButton';
import { ProjectCompletionChart } from '@/components/dashboard/ProjectCompletionChart';
import { ProgressOverTimeChart } from '@/components/dashboard/ProgressOverTimeChart';
import { createT, type Locale } from '@/lib/i18n';

export const metadata = {
  title: 'Performance Report — DesaWorks',
  description: 'View project performance metrics, worker contributions, and progress trends.',
};

export default async function PerformanceReportPage() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('desaworks_locale')?.value as Locale) || 'id';
  const t = createT(locale);

  const dashboard = await getManagerDashboardReport();

  // Build performance table data from dashboard metrics
  const performanceData = dashboard.projects.map((metric) => ({
    projectName: metric.project.name,
    completionPercentage: metric.completionPercentage,
    assignedWorkers: metric.assignedWorkers,
    activeAssignments: metric.activeAssignments,
    status: metric.project.status,
  }));

  // Build chart data for ProjectCompletionChart — Top-N only, so the bar chart
  // stays readable instead of rendering all projects as a dense wall of bars.
  const completionChartData = dashboard.topProjects.map((metric) => ({
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
      const hours = workerRow.totalHoursWorked;
      const progress = workerRow.latestProgress?.progress_percentage ?? null;
      const isActive = workerRow.assignment.status === 'active';

      if (existing) {
        existing.totalHoursWorked += hours;
        existing.taskCount += workerRow.taskCount;
        if (progress !== null) {
          existing.latestProgress =
            existing.latestProgress !== null
              ? Math.max(existing.latestProgress, progress)
              : progress;
        }
        if (isActive) {
          existing.assignmentStatus = 'active';
        }
      } else {
        workerMap.set(key, {
          workerName: workerRow.worker.full_name,
          email: workerRow.worker.email,
          totalHoursWorked: hours,
          taskCount: workerRow.taskCount,
          latestProgress: progress,
          assignmentStatus: workerRow.assignment.status,
        });
      }
    }
  }

  const workerData = Array.from(workerMap.values());

  // Prepare CSV export formats
  const performanceExportData = performanceData.map((p) => ({
    'Project Name': p.projectName,
    'Completion %': p.completionPercentage,
    'Assigned Workers': p.assignedWorkers,
    'Active Tasks': p.activeAssignments,
    Status: p.status,
  }));

  const workerExportData = workerData.map((w) => ({
    Name: w.workerName,
    Email: w.email,
    'Total Hours Worked': w.totalHoursWorked,
    'Tasks Count': w.taskCount,
    'Latest Progress %': w.latestProgress ?? 0,
    Status: w.assignmentStatus,
  }));

  // Progress trend data (aggregate from project analytics history)
  const dateProgressMap = new Map<string, number[]>();

  for (const analytics of analyticsResults) {
    for (const history of analytics.progressHistory) {
      const date = history.date;
      const current = dateProgressMap.get(date) ?? [];
      current.push(history.averageProgress);
      dateProgressMap.set(date, current);
    }
  }

  const progressTrendData = Array.from(dateProgressMap.entries())
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
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-700">
          {t('nav.reports')}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">
          {t('performanceReport.title')}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
          {t('performanceReport.subtitle')}
        </p>
      </div>

      {/* Summary stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="nm-raised p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-mute">
            {t('stats.totalProjects')}
          </p>
          <p className="mt-1 text-2xl font-bold text-ink">
            {dashboard.projects.length}
          </p>
        </div>
        <div className="nm-raised p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-mute">
            {t('stats.activeWorkers')}
          </p>
          <p className="mt-1 text-2xl font-bold text-info">
            {workerData.length}
          </p>
        </div>
        <div className="nm-raised p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-mute">
            {t('stats.avgCompletion')}
          </p>
          <p className="mt-1 text-2xl font-bold text-primary-600">
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
        <div className="nm-raised p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-mute">
            {t('stats.totalHoursLogged')}
          </p>
          <p className="mt-1 text-2xl font-bold text-warning/80">
            {workerData
              .reduce((sum, r) => sum + r.totalHoursWorked, 0)
              .toFixed(1)}
            h
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
            <h2 className="text-lg font-bold text-ink">{t('chart.projectCompletion')}</h2>
            {dashboard.projects.length > dashboard.topProjects.length ? (
              <span className="text-xs font-normal text-ink-soft">
                {t('chart.showingTop', { shown: dashboard.topProjects.length, total: dashboard.projects.length })}
              </span>
            ) : null}
          </div>
          <ProjectCompletionChart data={completionChartData} />
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-ink">{t('chart.progressOverTime')}</h2>
          <ProgressOverTimeChart data={progressTrendData} />
        </div>
      </div>

      {/* Performance Table */}
      <section className="mb-8 mt-10 sm:mt-12">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-ink">
              {t('performanceReport.projectPerformance')}
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              {t('performanceReport.projectPerformanceDesc')}
            </p>
          </div>
          <ExportButton
            data={performanceExportData}
            filename="performance-report"
            label={t('performanceReport.exportPerformance')}
          />
        </div>
        <PerformanceTable data={performanceData} />
      </section>

      {/* Worker Contribution Table */}
      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-ink">
              {t('performanceReport.workerContributions')}
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              {t('performanceReport.workerContributionsDesc')}
            </p>
          </div>
          <ExportButton
            data={workerExportData}
            filename="worker-contributions"
            label={t('performanceReport.exportWorkers')}
          />
        </div>
        <WorkerContributionTable data={workerData} />
      </section>
    </main>
  );
}
