'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { RangeKey } from '@/lib/queries/reports';

const RANGES: RangeKey[] = ['7d', '30d', '90d', '365d', 'all'];

export function TimeframeSelector({ current }: { current: RangeKey }) {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="nm-inset inline-flex gap-1 rounded-full p-1" role="group" aria-label={t('timeframe.label')}>
      {RANGES.map((r) => {
        const activeState = current === r;
        return (
          <button
            key={r}
            type="button"
            onClick={() => router.push(`${pathname}?range=${r}`)}
            aria-pressed={activeState}
            className={`min-h-[36px] rounded-full px-3 text-xs font-semibold transition ${
              activeState ? 'nm-raised-sm nm-pressable bg-card text-primary-700' : 'text-ink-soft hover:text-ink'
            }`}
          >
            {t(`timeframe.${r}`)}
          </button>
        );
      })}
    </div>
  );
}
