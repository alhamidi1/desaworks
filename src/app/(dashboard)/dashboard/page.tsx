import { getManagerDashboardReport } from '@/lib/queries/reports';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { DashboardSection } from '@/components/dashboard/DashboardGrid';
import { ProjectCompletionChart } from '@/components/dashboard/ProjectCompletionChart';
import { StatusDistributionChart } from '@/components/dashboard/StatusDistributionChart';
import { ProgressOverTimeChart } from '@/components/dashboard/ProgressOverTimeChart';
import { ProgressTimeline } from '@/components/monitoring/ProgressTimeline';
import { ActivityFeed } from '@/components/monitoring/ActivityFeed';
import Link from 'next/link';

export const metadata = {
  title: 'Dashboard — DesaWorks',
  description: 'Overview of all projects, worker activity, and progress across the village enterprise.',
};

export default async function DashboardPage() {
  const report = await getManagerDashboardReport();

  const totalProjects = report.projects.length;

  const activeWorkers = new Set(
    report.projects.flatMap((p) =>
      Array.from({ length: p.assignedWorkers }, (_, i) => `${p.project.id}-${i}`)
    )
  ).size === 0
    ? report.projects.reduce((sum, p) => sum + p.assignedWorkers, 0)
    : report.projects.reduce((sum, p) => sum + p.assignedWorkers, 0);

  const averageCompletion =
    report.projects.length > 0
      ? Math.round(
          report.projects.reduce((sum, p) => sum + p.completionPercentage, 0) /
            report.projects.length
        )
      : 0;

  const recentUpdates = report.recentActivity.length;

  const completionChartData = report.projects.map((p) => ({
    projectName: p.project.name,
    completionPercentage: p.completionPercentage,
    assignedWorkers: p.assignedWorkers,
  }));

  const statusChartData = report.projectStatusDistribution.map((d) => ({
    status: d.status,
    count: d.count,
  }));

  const timelineData = report.timeline.map((t) => ({
    projectName: t.projectName,
    startDate: t.startDate,
    endDate: t.endDate,
    currentProgress: t.currentProgress,
  }));

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Monitor projects, track worker progress, and review activity across your village enterprise.
        </p>
      </div>

      {/* Stats cards row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Projects"
          value={totalProjects}
          description="All registered projects"
          trend={totalProjects > 0 ? 'up' : 'neutral'}
          trendValue={totalProjects > 0 ? `${totalProjects} active` : 'None'}
        />
        <StatsCard
          title="Active Workers"
          value={activeWorkers}
          description="Currently assigned workers"
          trend={activeWorkers > 0 ? 'up' : 'neutral'}
          trendValue={activeWorkers > 0 ? 'Assigned' : 'None'}
        />
        <StatsCard
          title="Avg. Completion"
          value={`${averageCompletion}%`}
          description="Average across all projects"
          trend={averageCompletion >= 50 ? 'up' : averageCompletion > 0 ? 'neutral' : 'neutral'}
          trendValue={
            averageCompletion >= 75
              ? 'On track'
              : averageCompletion >= 50
                ? 'Progressing'
                : averageCompletion > 0
                  ? 'Early stage'
                  : 'No data'
          }
        />
        <StatsCard
          title="Recent Updates"
          value={recentUpdates}
          description="Latest progress reports"
          trend={recentUpdates > 0 ? 'up' : 'neutral'}
          trendValue={recentUpdates > 0 ? 'New' : 'None'}
        />
      </div>

      {/* Project Quick Links */}
      {report.projects.length > 0 && (
        <DashboardSection title="Projects">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {report.projects.map((p) => (
              <Link
                key={p.project.id}
                href={`/projects/${p.project.id}`}
                className="group flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {p.project.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {p.assignedWorkers} workers · {p.completionPercentage}% done
                  </p>
                </div>
                <svg className="h-4 w-4 text-gray-400 group-hover:text-blue-500 shrink-0 ml-2 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            ))}
          </div>
        </DashboardSection>
      )}

      {/* Charts row: completion + status distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardSection title="Project Completion">
          <ProjectCompletionChart data={completionChartData} />
        </DashboardSection>
        <DashboardSection title="Status Distribution">
          <StatusDistributionChart data={statusChartData} />
        </DashboardSection>
      </div>

      {/* Progress over time (full width) */}
      <DashboardSection title="Progress Over Time">
        <ProgressOverTimeChart data={report.progressTrend} />
      </DashboardSection>

      {/* Timeline + Activity feed */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardSection title="Project Timelines">
          <ProgressTimeline data={timelineData} />
        </DashboardSection>
        <DashboardSection title="Recent Activity">
          <ActivityFeed items={report.recentActivity} />
        </DashboardSection>
      </div>
    </div>
  );
}
