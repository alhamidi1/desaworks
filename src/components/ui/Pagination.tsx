'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  from: number;
  to: number;
  onPage: (p: number) => void;
  className?: string;
}

/**
 * App-wide pagination control: "Showing X–Y of N" + Prev / Page / Next.
 * Renders nothing when there are no items; shows just the count summary for a single page.
 */
export function Pagination({ page, totalPages, total, from, to, onPage, className = '' }: PaginationProps) {
  const { t } = useLanguage();

  if (total === 0) return null;

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 pt-4 ${className}`}>
      <span className="text-xs text-ink-soft">{t('pagination.showing', { from, to, total })}</span>

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPage(page - 1)}
            disabled={page <= 1}
            className="nm-pressable inline-flex min-h-[40px] items-center rounded-lg border border-border bg-card px-3.5 text-xs font-semibold text-ink-soft transition hover:border-border-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t('pagination.prev')}
          </button>
          <span className="px-1 text-xs font-semibold tabular-nums text-ink">
            {t('pagination.page', { page, totalPages })}
          </span>
          <button
            type="button"
            onClick={() => onPage(page + 1)}
            disabled={page >= totalPages}
            className="nm-pressable inline-flex min-h-[40px] items-center rounded-lg border border-border bg-card px-3.5 text-xs font-semibold text-primary-700 transition hover:border-border-strong hover:text-primary-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t('pagination.next')}
          </button>
        </div>
      )}
    </div>
  );
}
