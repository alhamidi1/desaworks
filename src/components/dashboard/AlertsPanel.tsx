'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { DashboardAlert } from '@/lib/queries/reports';

const kindBar: Record<string, string> = {
  delayed: 'bg-danger',
  understaffed: 'bg-warning',
  stale: 'bg-info',
  over_budget: 'bg-warning',
};

export function AlertsPanel({ alerts, hideHeader = false }: { alerts: DashboardAlert[]; hideHeader?: boolean }) {
  const { t } = useLanguage();

  return (
    <div className="nm-raised p-4 sm:p-5 flex flex-col justify-start gap-3">
      {!hideHeader && (
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-warning-soft text-warning" aria-hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </span>
          <h2 className="text-base font-bold text-ink">{t('alert.title')}</h2>
          {alerts.length > 0 ? (
            <span className="ml-auto rounded-full bg-danger-soft px-2 py-0.5 text-xs font-bold text-danger">{alerts.length}</span>
          ) : null}
        </div>
      )}

      {alerts.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-soft flex-1 flex items-center justify-center">{t('alert.none')}</p>
      ) : (
        <ul className="max-h-[340px] flex-1 space-y-2 overflow-y-auto pr-1">
          {alerts.slice(0, 24).map((a, i) => (
            <li key={`${a.projectId}-${a.kind}-${i}`} className="flex items-center gap-3 rounded-xl bg-surface px-3 py-2.5">
              <span className={`h-9 w-1 shrink-0 rounded-full ${kindBar[a.kind] ?? 'bg-info'}`} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{a.projectName}</p>
                <p className="text-xs text-ink-soft">{t(a.messageKey, a.params)}</p>
              </div>
              <Link
                href={`/projects/${a.projectId}`}
                className="nm-raised-sm nm-pressable touch-target grid shrink-0 place-items-center rounded-lg bg-card px-3 text-xs font-semibold text-primary-700"
              >
                {t('alert.view')}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
