'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { formatCurrency } from '@/lib/i18n';
import type { ImpactReport } from '@/lib/queries/reports';

export function ImpactDashboard({ impact }: { impact: ImpactReport }) {
  const { t } = useLanguage();

  const tiles: { label: string; value: string; hint?: string; color: string }[] = [
    { label: t('impact.residentsEmployed'), value: String(impact.residentsEmployed), hint: t('impact.ofTotal', { total: impact.totalResidents }), color: 'text-primary-700' },
    { label: t('impact.incomeGenerated'), value: formatCurrency(impact.incomeGenerated), color: 'text-success' },
    { label: t('impact.participation'), value: `${impact.participationRate}%`, color: 'text-info' },
    { label: t('impact.hoursContributed'), value: String(impact.totalHoursContributed), color: 'text-warning' },
  ];

  return (
    <section className="nm-raised p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary-100 text-primary-700" aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.97-3.07-8-6.5-8-10a4 4 0 0 1 7-2.65A4 4 0 0 1 20 11c0 3.5-3.03 6.93-8 10Z" />
          </svg>
        </span>
        <div>
          <h2 className="text-base font-bold text-ink">{t('impact.title')}</h2>
          <p className="text-xs text-ink-soft">{t('impact.subtitle')}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="nm-inset rounded-xl p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">{tile.label}</p>
            <p className={`mt-1 text-lg font-bold tracking-tight ${tile.color}`}>{tile.value}</p>
            {tile.hint ? <p className="mt-0.5 text-[11px] text-ink-soft">{tile.hint}</p> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
