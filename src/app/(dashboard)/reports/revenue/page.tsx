import { cookies } from 'next/headers';
import {
  getRevenueReport,
  getManagerDashboardReport,
} from '@/lib/queries/reports';
import { RevenueChart } from '@/components/reports/RevenueChart';
import { RevenueForm } from '@/components/reports/RevenueForm';
import { ExportButton } from '@/components/reports/ExportButton';
import { createT, type Locale } from '@/lib/i18n';

export const metadata = {
  title: 'Revenue Report — DesaWorks',
  description: 'View revenue records, budget utilization, and monthly trends.',
};

function formatIDR(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function RevenueReportPage() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('desaworks_locale')?.value as Locale) || 'id';
  const t = createT(locale);

  const [revenueReport, dashboard] = await Promise.all([
    getRevenueReport(),
    getManagerDashboardReport(),
  ]);

  // Summary stats
  const totalRevenue = revenueReport.records.reduce(
    (sum, r) => sum + Number(r.amount),
    0
  );
  const projectsWithRevenue = revenueReport.projects.filter(
    (p) => p.revenueCount > 0
  ).length;
  // Average only over projects that actually have a budget (exclude budget<=0 to avoid skew).
  const budgetedProjects = revenueReport.projects.filter((p) => p.revenueVsBudgetPct !== null);
  const avgBudgetUtilization =
    budgetedProjects.length > 0
      ? Math.round(
          (budgetedProjects.reduce((sum, p) => sum + (p.revenueVsBudgetPct ?? 0), 0) /
            budgetedProjects.length) *
            10
        ) / 10
      : 0;

  // Project list for the form
  const projectsForForm = dashboard.projects.map((m) => ({
    id: m.project.id,
    name: m.project.name,
  }));

  // CSV export data
  const recordsExportData = revenueReport.records.map((record) => ({
    Project: record.projectName,
    Amount: record.amount,
    Description: record.description ?? '',
    Date: record.record_date,
    'Recorded By': record.recordedByName ?? 'Unknown',
  }));

  // Projects with budget warnings
  const projectsWithWarnings = revenueReport.projects.filter(
    (p) => p.warning !== null
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      {/* Page header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-700">
          {t('nav.reports')}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          {t('revenueReport.title')}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          {t('revenueReport.subtitle')}
        </p>
      </div>

      {/* Summary stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="nm-raised p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {t('revenueReport.totalRevenue')}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {formatIDR(totalRevenue)}
          </p>
        </div>
        <div className="nm-raised p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {t('revenueReport.projectsWithRevenue')}
          </p>
          <p className="mt-1 text-2xl font-bold text-teal-600">
            {projectsWithRevenue}
          </p>
        </div>
        <div className="nm-raised p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {t('revenueReport.avgBudgetUtilization')}
          </p>
          <p className="mt-1 text-2xl font-bold text-blue-600">
            {avgBudgetUtilization}%
          </p>
        </div>
      </div>

      {/* Budget warnings */}
      {projectsWithWarnings.length > 0 && (
        <div className="mb-8 space-y-3">
          {projectsWithWarnings.map((proj) => (
            <div
              key={proj.project.id}
              className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3"
            >
              <svg
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
              <div className="text-sm text-amber-800">
                <p className="font-medium">{proj.project.name}</p>
                <p className="mt-0.5">{t('alert.overBudget', { pct: proj.revenueVsBudgetPct ?? 0 })}</p>
                <p className="mt-0.5 text-xs text-amber-600">
                  {t('project.revenue')}: {formatIDR(proj.totalRevenue)} · {t('project.budget')}:{' '}
                  {formatIDR(Number(proj.project.budget))} ({proj.budgetUtilization}%)
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Revenue chart */}
      <div className="mb-8 space-y-3">
        <h2 className="text-lg font-bold text-ink">{t('chart.revenueTrend')}</h2>
        <RevenueChart data={revenueReport.monthlyTotals} />
      </div>

      {/* Revenue records table */}
      <section className="mb-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {t('revenueReport.revenueRecords')}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {t('revenueReport.revenueRecordsDesc')}
            </p>
          </div>
          <ExportButton
            data={recordsExportData}
            filename="revenue-records"
            label={t('revenueReport.exportRevenue')}
          />
        </div>

        {revenueReport.records.length === 0 ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
            <svg
              className="h-10 w-10 text-slate-300"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
              />
            </svg>
            <p className="mt-3 text-sm font-medium text-slate-500">
              {t('revenueReport.noRecords')}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {t('revenueReport.noRecordsDesc')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">
                    {t('revenueReport.projectHeader')}
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">
                    {t('revenueReport.amountHeader')}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">
                    {t('revenueReport.descriptionHeader')}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">
                    {t('revenueReport.dateHeader')}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">
                    {t('revenueReport.recordedByHeader')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {revenueReport.records.map((record, index) => (
                  <tr
                    key={record.id}
                    className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                      index % 2 === 1 ? 'bg-slate-50/50' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {record.projectName}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-slate-700">
                      {formatIDR(Number(record.amount))}
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-slate-600">
                      {record.description ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {record.record_date}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {record.recordedByName ?? 'Unknown'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Revenue form */}
      <section>
        <RevenueForm projects={projectsForForm} />
      </section>
    </main>
  );
}
