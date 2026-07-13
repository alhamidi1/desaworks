'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { usePaginatedSearch } from '@/lib/hooks/usePaginatedSearch';

interface PerformanceRow {
  projectName: string;
  completionPercentage: number;
  assignedWorkers: number;
  activeAssignments: number;
  status: string;
}

const statusClasses: Record<string, string> = {
  completed: 'bg-success-soft text-success',
  in_progress: 'bg-warning-soft text-warning',
  open: 'bg-info-soft text-info',
  cancelled: 'bg-danger-soft text-danger',
  draft: 'bg-neutral-200 text-neutral-600',
};

function progressColor(p: number) {
  if (p >= 80) return 'bg-success';
  if (p >= 50) return 'bg-info';
  if (p >= 25) return 'bg-warning';
  return 'bg-neutral-400';
}

export function PerformanceTable({ data }: { data: PerformanceRow[] }) {
  const { t } = useLanguage();
  const { query, setQuery, pageItems, page, setPage, totalPages, total, from, to } = usePaginatedSearch(data, {
    pageSize: 10,
    searchFields: (r) => [r.projectName],
  });

  if (!data.length) {
    return <div className="nm-raised grid min-h-[160px] place-items-center p-6 text-sm text-ink-soft">{t('table.noData')}</div>;
  }

  return (
    <div className="space-y-3">
      <div className="nm-raised overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {data.length > 10 && (
          <div className="border-b border-neutral-100 bg-surface px-4 py-3">
            <SearchInput value={query} onChange={setQuery} placeholder={t('project.searchPlaceholder')} className="max-w-xs" />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-ink-soft">
                <th className="px-4 py-3 text-left font-semibold">{t('table.project')}</th>
                <th className="px-4 py-3 text-left font-semibold">{t('table.completion')}</th>
                <th className="px-4 py-3 text-center font-semibold">{t('table.workers')}</th>
                <th className="px-4 py-3 text-center font-semibold">{t('table.active')}</th>
                <th className="px-4 py-3 text-left font-semibold">{t('table.status')}</th>
              </tr>
            </thead>
            <tbody>
              {total === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-ink-soft">{t('common.noResults')}</td>
                </tr>
              ) : pageItems.map((row) => (
                <tr key={row.projectName} className="border-b border-neutral-100 transition-colors hover:bg-surface">
                  <td className="px-4 py-3 font-medium text-ink">{row.projectName}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-neutral-200">
                        <div className={`h-full rounded-full ${progressColor(row.completionPercentage)}`} style={{ width: `${Math.min(100, Math.max(0, row.completionPercentage))}%` }} />
                      </div>
                      <span className="text-xs font-medium text-ink-soft">{row.completionPercentage.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-ink-soft">{row.assignedWorkers}</td>
                  <td className="px-4 py-3 text-center text-ink-soft">{row.activeAssignments}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClasses[row.status] ?? 'bg-neutral-200 text-neutral-600'}`}>
                      {t(`status.${row.status}`)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination page={page} totalPages={totalPages} total={total} from={from} to={to} onPage={setPage} />
    </div>
  );
}
