'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { formatDateShort } from '@/lib/i18n';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { usePaginatedSearch } from '@/lib/hooks/usePaginatedSearch';
import { waLink } from '@/lib/utils/whatsapp';
import type { ResidentListItem } from '@/lib/actions/residents';

interface Props {
  residents: ResidentListItem[];
}

export function ResidentsDirectory({ residents }: Props) {
  const { t, locale } = useLanguage();

  const { query, setQuery, pageItems, page, setPage, totalPages, total, from, to } = usePaginatedSearch(residents, {
    pageSize: 10,
    searchFields: (r) => [r.full_name, r.phone, r.email, r.address],
  });

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary-600">{t('appName')}</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-ink sm:text-2xl">{t('residents.title')}</h1>
          <p className="mt-1 text-sm text-ink-soft">{t('residents.subtitle')}</p>
        </div>
        <Link
          href="/dashboard/residents/register"
          className="nm-pressable inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-primary-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t('residents.addResident')}
        </Link>
      </div>

      {residents.length === 0 ? (
        <div className="nm-raised rounded-2xl px-6 py-14 text-center">
          <p className="font-bold text-ink">{t('residents.empty')}</p>
          <p className="mt-1 text-sm text-ink-soft">{t('residents.emptyDesc')}</p>
        </div>
      ) : (
        <div className="nm-raised rounded-2xl p-4 sm:p-5">
          {/* Search + count */}
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <SearchInput value={query} onChange={setQuery} placeholder={t('residents.searchPlaceholder')} className="sm:max-w-xs sm:flex-1" />
            <span className="text-xs text-ink-soft">{t('residents.total', { count: residents.length })}</span>
          </div>

          {total === 0 ? (
            <p className="py-10 text-center text-sm text-ink-soft">{t('residents.noResults')}</p>
          ) : (
            <ul className="divide-y divide-neutral-200/70">
              {pageItems.map((r) => {
                const wa = waLink(r.phone);
                return (
                  <li key={r.id} className="flex items-center gap-3 py-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                      {r.full_name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{r.full_name}</p>
                      <p className="truncate text-xs text-ink-soft">
                        {r.phone || r.email || t('residents.noContact')}
                        {r.created_at ? ` · ${t('residents.joined', { date: formatDateShort(r.created_at, locale) })}` : ''}
                      </p>
                    </div>
                    <div className="hidden shrink-0 sm:block">
                      <span className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
                        {r.skillCount > 0 ? t('residents.skillsCount', { count: r.skillCount }) : t('residents.noSkills')}
                      </span>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        r.availability === 'available'
                          ? 'bg-success-soft text-success'
                          : 'bg-neutral-200 text-neutral-500'
                      }`}
                    >
                      {r.availability === 'available' ? t('availability.available') : t('availability.unavailable')}
                    </span>
                    {wa && (
                      <a
                        href={wa}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={t('residents.messageWa')}
                        title={t('residents.messageWa')}
                        className="nm-pressable grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#25D366] text-white transition hover:bg-[#1ebe5d]"
                      >
                        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-white">
                          <path d="M16 2C8.268 2 2 8.268 2 16c0 2.387.622 4.63 1.71 6.578L2 30l7.632-1.694A13.926 13.926 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5c-2.165 0-4.195-.583-5.937-1.6l-.424-.25-4.526 1.004 1.022-4.41-.278-.453A11.482 11.482 0 0 1 4.5 16C4.5 9.596 9.596 4.5 16 4.5S27.5 9.596 27.5 16 22.404 27.5 16 27.5zm6.302-8.638c-.344-.172-2.037-1.005-2.353-1.12-.317-.115-.547-.172-.778.172-.23.344-.893 1.12-1.094 1.35-.2.23-.403.26-.748.086-.344-.172-1.456-.537-2.773-1.71-1.025-.912-1.717-2.038-1.918-2.382-.2-.344-.021-.53.15-.7.154-.154.344-.403.516-.605.172-.2.23-.344.344-.573.115-.23.057-.43-.029-.605-.086-.172-.778-1.876-1.064-2.566-.28-.675-.566-.583-.778-.594l-.663-.013c-.23 0-.604.086-.92.43-.317.344-1.208 1.178-1.208 2.872s1.237 3.333 1.41 3.563c.172.23 2.434 3.718 5.9 5.214.824.356 1.468.568 1.97.728.826.264 1.579.226 2.174.137.663-.1 2.037-.832 2.324-1.636.287-.805.287-1.494.2-1.637-.086-.144-.316-.23-.66-.402z" />
                        </svg>
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <Pagination page={page} totalPages={totalPages} total={total} from={from} to={to} onPage={setPage} />
        </div>
      )}
    </div>
  );
}
