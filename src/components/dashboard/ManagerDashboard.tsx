'use client';

import { StatsCard } from '@/components/dashboard/StatsCard';
import { DashboardSection } from '@/components/dashboard/DashboardGrid';
import { ProjectCompletionChart } from '@/components/dashboard/ProjectCompletionChart';
import { StatusDistributionChart } from '@/components/dashboard/StatusDistributionChart';
import { ProgressOverTimeChart } from '@/components/dashboard/ProgressOverTimeChart';
import { ProgressTimeline } from '@/components/monitoring/ProgressTimeline';
import { ActivityFeed } from '@/components/monitoring/ActivityFeed';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { ManagerDashboardReport } from '@/lib/queries/reports';

interface ManagerDashboardProps {
  report: ManagerDashboardReport;
}

export function ManagerDashboard({ report }: ManagerDashboardProps) {
  const { t } = useLanguage();

  const totalProjects = report.projects.length;

  const activeWorkers = report.projects.reduce((sum, p) => sum + p.assignedWorkers, 0);

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

  const timelineData = report.timeline.map((tl) => ({
    projectName: tl.projectName,
    startDate: tl.startDate,
    endDate: tl.endDate,
    currentProgress: tl.currentProgress,
  }));

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#1a1d23] sm:text-2xl lg:text-3xl">
          {t('dashboard.managerTitle')}
        </h1>
        <p className="mt-1 text-sm text-[#868e96]">
          {t('dashboard.managerSubtitle')}
        </p>
      </div>

      {/* Stats cards row */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatsCard
          title={t('stats.totalProjects')}
          value={totalProjects}
          description={t('stats.allRegistered')}
          trend={totalProjects > 0 ? 'up' : 'neutral'}
          trendValue={totalProjects > 0 ? t('stats.active', { count: totalProjects }) : t('stats.none')}
        />
        <StatsCard
          title={t('stats.activeWorkers')}
          value={activeWorkers}
          description={t('stats.currentlyAssigned')}
          trend={activeWorkers > 0 ? 'up' : 'neutral'}
          trendValue={activeWorkers > 0 ? t('stats.assigned') : t('stats.none')}
        />
        <StatsCard
          title={t('stats.avgCompletion')}
          value={`${averageCompletion}%`}
          description={t('stats.avgAcrossProjects')}
          trend={averageCompletion >= 50 ? 'up' : 'neutral'}
          trendValue={
            averageCompletion >= 75
              ? t('stats.onTrack')
              : averageCompletion >= 50
                ? t('stats.progressing')
                : averageCompletion > 0
                  ? t('stats.earlyStage')
                  : t('stats.noData')
          }
        />
        <StatsCard
          title={t('stats.recentUpdates')}
          value={recentUpdates}
          description={t('stats.latestReports')}
          trend={recentUpdates > 0 ? 'up' : 'neutral'}
          trendValue={recentUpdates > 0 ? t('stats.new') : t('stats.none')}
        />
      </div>

      {/* Project Quick Links */}
      {report.projects.length > 0 && (
        <DashboardSection title={t('nav.projects')}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {report.projects.map((p) => (
              <Link
                key={p.project.id}
                href={`/projects/${p.project.id}`}
                className="group flex items-center justify-between rounded-2xl border border-[#e9ecef] bg-white p-4 shadow-sm hover:border-[#c7fff4] hover:shadow-md transition-all duration-200"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1a1d23] truncate group-hover:text-[#05c8ae] transition-colors">
                    {p.project.name}
                  </p>
                  <p className="text-xs text-[#868e96] mt-1">
                    {p.assignedWorkers} {t('project.workers')} · {p.completionPercentage}% {t('project.done')}
                  </p>
                </div>
                <svg className="h-4 w-4 text-[#adb5bd] group-hover:text-[#05c8ae] shrink-0 ml-2 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            ))}
          </div>
        </DashboardSection>
      )}

      {/* Charts row: completion + status distribution */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <DashboardSection title={t('chart.projectCompletion')}>
          <ProjectCompletionChart data={completionChartData} />
        </DashboardSection>
        <DashboardSection title={t('chart.statusDistribution')}>
          <StatusDistributionChart data={statusChartData} />
        </DashboardSection>
      </div>

      {/* Progress over time (full width) */}
      <DashboardSection title={t('chart.progressOverTime')}>
        <ProgressOverTimeChart data={report.progressTrend} />
      </DashboardSection>

      {/* Timeline + Activity feed */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <DashboardSection title={t('chart.projectTimelines')}>
          <ProgressTimeline data={timelineData} />
        </DashboardSection>
        <DashboardSection title={t('chart.recentActivity')}>
          <ActivityFeed items={report.recentActivity} />
        </DashboardSection>
      </div>
    </div>
  );
}
