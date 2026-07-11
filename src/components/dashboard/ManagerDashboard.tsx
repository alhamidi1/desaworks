'use client';

import Link from 'next/link';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { DashboardSection } from '@/components/dashboard/DashboardGrid';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { HealthBadge } from '@/components/dashboard/HealthBadge';
import { TimeframeSelector } from '@/components/dashboard/TimeframeSelector';
import { ProjectCompletionChart } from '@/components/dashboard/ProjectCompletionChart';
import { StatusDistributionChart } from '@/components/dashboard/StatusDistributionChart';
import { ProgressOverTimeChart } from '@/components/dashboard/ProgressOverTimeChart';
import { ImpactDashboard } from '@/components/dashboard/ImpactDashboard';
import { ActivityFeed } from '@/components/monitoring/ActivityFeed';
import { useLanguage } from '@/lib/i18n/LanguageContext';
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

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatsCard title={t('stats.totalProjects')} value={k.totalProjects} accent="primary" hint={t('stats.active', { count: k.activeProjects })} />
        <StatsCard title={t('stats.utilization')} value={`${k.utilizationRate}%`} accent="info" hint={t('stats.ofResidents', { active: k.activeWorkersDistinct, total: k.totalResidents })} />
        <StatsCard title={t('stats.portfolioCompletion')} value={`${Math.round(k.portfolioCompletion)}%`} accent="success" hint={t('stats.weighted')} />
        <StatsCard title={t('stats.delayedProjects')} value={k.delayedCount} accent={k.delayedCount > 0 ? 'danger' : 'neutral'} hint={`${t('stats.understaffed')}: ${k.understaffedCount}`} />
      </div>

      {/* Alerts + status distribution */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AlertsPanel alerts={report.alerts} />
        <DashboardSection title={t('chart.statusDistribution')}>
          <StatusDistributionChart data={report.projectStatusDistribution} />
        </DashboardSection>
      </div>

      {/* Completion (Top-N) */}
      <DashboardSection title={t('chart.projectCompletion')}>
        {report.projects.length > report.topProjects.length ? (
          <p className="-mt-2 text-xs text-ink-soft">{t('chart.showingTop', { shown: report.topProjects.length, total: report.projects.length })}</p>
        ) : null}
        <ProjectCompletionChart data={completionData} />
      </DashboardSection>

      {/* Progress trend */}
      <DashboardSection title={t('chart.progressOverTime')}>
        <ProgressOverTimeChart data={report.progressTrend} />
      </DashboardSection>

      {/* Activity + project health quick links */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DashboardSection title={t('chart.recentActivity')}>
          <ActivityFeed items={report.recentActivity} />
        </DashboardSection>
        <DashboardSection title={t('nav.projects')}>
          <div className="nm-raised divide-y divide-neutral-200/70 p-2">
            {report.topProjects.slice(0, 6).map((p) => (
              <Link key={p.project.id} href={`/projects/${p.project.id}`} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition hover:bg-surface">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink">{p.project.name}</span>
                  <span className="text-xs text-ink-soft">
                    {p.completionPercentage}% · {p.assignedWorkers} {t('project.workers')}
                  </span>
                </span>
                <HealthBadge health={p.health} />
              </Link>
            ))}
          </div>
        </DashboardSection>
      </div>

      {/* Village impact */}
      {impact ? <ImpactDashboard impact={impact} /> : null}
    </div>
  );
}
