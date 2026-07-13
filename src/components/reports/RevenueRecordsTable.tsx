'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { usePaginatedSearch } from '@/lib/hooks/usePaginatedSearch';

interface RevenueRecord {
  id: string;
  projectName: string;
  amount: number | string;
  description: string | null;
  record_date: string;
  recordedByName: string | null;
}

function formatIDR(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function RevenueRecordsTable({ data }: { data: RevenueRecord[] }) {
  const { t } = useLanguage();
  const { query, setQuery, pageItems, page, setPage, totalPages, total, from, to } = usePaginatedSearch(data, {
    pageSize: 10,
    searchFields: (r) => [r.projectName, r.description ?? ''],
  });

  if (!data.length) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-10 text-center">
        <svg
          className="h-10 w-10 text-neutral-300"
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
        <p className="mt-3 text-sm font-medium text-ink-soft">
          {t('revenueReport.noRecords')}
        </p>
        <p className="mt-1 text-xs text-ink-mute">
          {t('revenueReport.noRecordsDesc')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="nm-raised overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {data.length > 10 && (
          <div className="border-b border-neutral-100 bg-surface px-4 py-3">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder={t('project.searchPlaceholder')}
              className="max-w-xs"
            />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="px-4 py-3 text-left font-semibold text-ink-soft">
                  {t('revenueReport.projectHeader')}
                </th>
                <th className="px-4 py-3 text-right font-semibold text-ink-soft">
                  {t('revenueReport.amountHeader')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-ink-soft">
                  {t('revenueReport.descriptionHeader')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-ink-soft">
                  {t('revenueReport.dateHeader')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-ink-soft">
                  {t('revenueReport.recordedByHeader')}
                </th>
              </tr>
            </thead>
            <tbody>
              {total === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-ink-soft">
                    {t('common.noResults')}
                  </td>
                </tr>
              ) : (
                pageItems.map((record, index) => (
                  <tr
                    key={record.id}
                    className={`border-b border-neutral-100 transition-colors hover:bg-surface ${
                      index % 2 === 1 ? 'bg-surface/50' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-ink">
                      {record.projectName}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-ink-soft">
                      {formatIDR(Number(record.amount))}
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-ink-soft">
                      {record.description ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {record.record_date}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {record.recordedByName ?? 'Unknown'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        from={from}
        to={to}
        onPage={setPage}
      />
    </div>
  );
}
