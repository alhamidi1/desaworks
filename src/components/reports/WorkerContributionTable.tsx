'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';

interface WorkerContributionRow {
  workerName: string;
  email: string;
  totalHoursWorked: number;
  taskCount: number;
  latestProgress: number | null;
  assignmentStatus: string;
}

const statusClasses: Record<string, string> = {
  completed: 'bg-success-soft text-success',
  active: 'bg-warning-soft text-warning',
  confirmed: 'bg-info-soft text-info',
  pending: 'bg-neutral-200 text-neutral-600',
  void: 'bg-danger-soft text-danger',
};

function progressColor(p: number) {
  if (p >= 80) return 'bg-success';
  if (p >= 50) return 'bg-info';
  if (p >= 25) return 'bg-warning';
  return 'bg-neutral-400';
}

export function WorkerContributionTable({ data }: { data: WorkerContributionRow[] }) {
  const { t } = useLanguage();

  if (!data.length) {
    return <div className="nm-raised grid min-h-[160px] place-items-center p-6 text-sm text-ink-soft">{t('table.noData')}</div>;
  }

  return (
    <div className="nm-raised overflow-x-auto">
      <table className="w-full min-w-[700px] text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-ink-soft">
            <th className="px-4 py-3 text-left font-semibold">{t('table.worker')}</th>
            <th className="px-4 py-3 text-left font-semibold">{t('table.hours')}</th>
            <th className="px-4 py-3 text-center font-semibold">{t('table.tasks')}</th>
            <th className="px-4 py-3 text-left font-semibold">{t('table.latestProgress')}</th>
            <th className="px-4 py-3 text-left font-semibold">{t('table.status')}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={`${row.workerName}-${row.email}-${index}`} className="border-b border-neutral-100">
              <td className="px-4 py-3">
                <p className="font-medium text-ink">{row.workerName}</p>
                <p className="text-xs text-neutral-400">{row.email}</p>
              </td>
              <td className="px-4 py-3 text-ink-soft">{row.totalHoursWorked.toFixed(1)}h</td>
              <td className="px-4 py-3 text-center text-ink-soft">{row.taskCount}</td>
              <td className="px-4 py-3">
                {row.latestProgress !== null ? (
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-neutral-200">
                      <div className={`h-full rounded-full ${progressColor(row.latestProgress)}`} style={{ width: `${Math.min(100, Math.max(0, row.latestProgress))}%` }} />
                    </div>
                    <span className="text-xs font-medium text-ink-soft">{row.latestProgress}%</span>
                  </div>
                ) : (
                  <span className="text-xs text-neutral-400">{t('table.noData')}</span>
                )}
              </td>
              <td className="px-4 py-3">
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClasses[row.assignmentStatus] ?? 'bg-neutral-200 text-neutral-600'}`}>
                  {t(`status.${row.assignmentStatus}`)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
