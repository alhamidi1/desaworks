'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { chartPalette, chartTooltipStyle, statusColors, statusFallback } from '@/lib/charts/palette';

export interface StatusDistributionDatum {
  status: string;
  count: number;
}

const tooltipStyle = chartTooltipStyle;

export function StatusDistributionChart({ data }: { data: StatusDistributionDatum[] }) {
  const { t } = useLanguage();

  if (!data.length) {
    return <div className="nm-raised grid min-h-[240px] place-items-center p-6 text-sm text-ink-soft">{t('chart.noData')}</div>;
  }

  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  const colored = data.map((d) => ({ ...d, label: t(`status.${d.status}`), color: statusColors[d.status] ?? statusFallback }));

  return (
    <div className="nm-raised p-4 sm:p-5 h-full flex flex-col justify-center">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,220px)_1fr] sm:items-center">
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown, _n: unknown, item: unknown) => [`${v} ${t('chart.projectsUnit')}`, (item as { payload?: { label?: string } })?.payload?.label ?? '']} />
              <Pie data={colored} dataKey="count" nameKey="label" innerRadius={58} outerRadius={92} paddingAngle={3} stroke={chartPalette.pieStroke} strokeWidth={3}>
                {colored.map((entry) => (
                  <Cell key={entry.status} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="grid gap-2">
          {colored.map((item) => (
            <li key={item.status} className="flex items-center justify-between gap-3 rounded-xl bg-surface px-3 py-2">
              <span className="flex items-center gap-2 text-sm font-medium text-ink">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} aria-hidden />
                {item.label}
              </span>
              <span className="text-sm text-ink-soft">
                {item.count} · {Math.round((item.count / total) * 100)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
