'use client';

import { StatsCard } from '@/components/dashboard/StatsCard';
import { DashboardSection } from '@/components/dashboard/DashboardGrid';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { TimeframeSelector } from '@/components/dashboard/TimeframeSelector';
import { ProjectCompletionChart } from '@/components/dashboard/ProjectCompletionChart';
import { StatusDistributionChart } from '@/components/dashboard/StatusDistributionChart';
import { ProgressOverTimeChart } from '@/components/dashboard/ProgressOverTimeChart';
import { ActivityFeed } from '@/components/monitoring/ActivityFeed';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { formatCurrency } from '@/lib/i18n';
import type { ImpactReport, ManagerDashboardReport } from '@/lib/queries/reports';

interface ManagerDashboardProps {
  report: ManagerDashboardReport;
  impact?: ImpactReport | null;
}

export function ManagerDashboard({ report, impact }: ManagerDashboardProps) {
  const { t } = useLanguage();
  const k = report.kpis;

  const completionData = report.topProjects.map((p) => ({
    projectName: p.project.name,
    completionPercentage: p.completionPercentage,
    assignedWorkers: p.assignedWorkers,
  }));

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header + timeframe */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl lg:text-3xl">{t('dashboard.managerTitle')}</h1>
          <p className="mt-1 text-sm text-ink-soft">{t('dashboard.managerSubtitle')}</p>
        </div>
        <TimeframeSelector current={report.range} />
      </div>

      {/* Row 1: 8 Stats Cards Grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {/* Village Impact Cards */}
        <StatsCard
          title={t('impact.residentsEmployed')}
          value={String(impact?.residentsEmployed ?? 0)}
          accent="primary"
          hint={impact ? t('impact.ofTotal', { total: impact.totalResidents }) : undefined}
          className="hidden sm:block"
        />
        <StatsCard
          title={t('impact.incomeGenerated')}
          value={impact ? formatCurrency(impact.incomeGenerated) : 'Rp 0'}
          accent="success"
        />
        <StatsCard
          title={t('impact.participation')}
          value={impact ? `${impact.participationRate}%` : '0%'}
          accent="info"
          className="hidden sm:block"
        />
        <StatsCard
          title={t('impact.hoursContributed')}
          value={String(impact?.totalHoursContributed ?? 0)}
          accent="warning"
          className="hidden sm:block"
        />

        {/* Dashboard KPI Cards */}
        <StatsCard
          title={t('stats.totalProjects')}
          value={k.totalProjects}
          accent="neutral"
          hint={t('stats.active', { count: k.activeProjects })}
        />
        <StatsCard
          title={t('stats.utilization')}
          value={`${k.utilizationRate}%`}
          accent="info"
          hint={t('stats.ofResidents', { active: k.activeWorkersDistinct, total: k.totalResidents })}
          className="hidden sm:block"
        />
        <StatsCard
          title={t('stats.portfolioCompletion')}
          value={`${Math.round(k.portfolioCompletion)}%`}
          accent="success"
          hint={t('stats.weighted')}
        />
        <StatsCard
          title={t('stats.delayedProjects')}
          value={k.delayedCount}
          accent={k.delayedCount > 0 ? 'danger' : 'neutral'}
          hint={`${t('stats.understaffed')}: ${k.understaffedCount}`}
        />
      </div>

      {/* Row 2: Project Completion + Status Distribution */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DashboardSection
          title={
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
              <span>{t('chart.projectCompletion')}</span>
              {report.projects.length > report.topProjects.length ? (
                <span className="text-xs font-normal text-ink-soft">
                  {t('chart.showingTop', { shown: report.topProjects.length, total: report.projects.length })}
                </span>
              ) : null}
            </div>
          }
        >
          <ProjectCompletionChart data={completionData} />
        </DashboardSection>
        <DashboardSection title={t('chart.statusDistribution')}>
          <StatusDistributionChart data={report.projectStatusDistribution} />
        </DashboardSection>
      </div>

      {/* Row 3: Progress Over Time */}
      <DashboardSection title={t('chart.progressOverTime')}>
        <ProgressOverTimeChart data={report.progressTrend} />
      </DashboardSection>

      {/* Row 4: Recent Activity + Needs Attention */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 items-start">
        <DashboardSection title={t('chart.recentActivity')}>
          <ActivityFeed items={report.recentActivity} />
        </DashboardSection>
        <DashboardSection
          title={
            <div className="flex items-center gap-2">
              <span>{t('alert.title')}</span>
              {report.alerts.length > 0 && (
                <span className="rounded-full bg-danger-soft px-2 py-0.5 text-xs font-bold text-danger">
                  {report.alerts.length}
                </span>
              )}
            </div>
          }
        >
          <AlertsPanel alerts={report.alerts} hideHeader />
        </DashboardSection>
      </div>
    </div>
  );
}
