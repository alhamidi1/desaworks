'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export interface StatusDistributionDatum {
  status: string;
  count: number;
}

const STATUS_COLOR: Record<string, string> = {
  draft: '#adb5bd',
  open: '#2563eb',
  in_progress: '#00a18f',
  completed: '#0f9d76',
  cancelled: '#d11d43',
};

const tooltipStyle = {
  borderRadius: '12px',
  border: '1px solid #dee2e6',
  background: '#ffffff',
  boxShadow: '0 12px 32px rgba(15,23,42,0.12)',
  fontSize: '12px',
} as const;

export function StatusDistributionChart({ data }: { data: StatusDistributionDatum[] }) {
  const { t } = useLanguage();

  if (!data.length) {
    return <div className="nm-raised grid min-h-[240px] place-items-center p-6 text-sm text-ink-soft">{t('chart.noData')}</div>;
  }

  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  const colored = data.map((d) => ({ ...d, label: t(`status.${d.status}`), color: STATUS_COLOR[d.status] ?? '#868e96' }));

  return (
    <div className="nm-raised p-4 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,220px)_1fr] sm:items-center">
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown, _n: unknown, item: unknown) => [`${v} ${t('chart.projectsUnit')}`, (item as { payload?: { label?: string } })?.payload?.label ?? '']} />
              <Pie data={colored} dataKey="count" nameKey="label" innerRadius={58} outerRadius={92} paddingAngle={3} stroke="#f3f6f9" strokeWidth={3}>
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
