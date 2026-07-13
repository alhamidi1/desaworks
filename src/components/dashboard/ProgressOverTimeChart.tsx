'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { formatDateShort } from '@/lib/i18n';
import { chartPalette, chartTooltipStyle } from '@/lib/charts/palette';

const GRID = chartPalette.grid;
const AXIS = chartPalette.axis;
const tooltipStyle = chartTooltipStyle;

export interface ProgressTrendDatum {
  date: string;
  averageProgress: number;
}

export function ProgressOverTimeChart({ data }: { data: ProgressTrendDatum[] }) {
  const { t, locale } = useLanguage();

  if (!data.length) {
    return <div className="nm-raised grid min-h-[240px] place-items-center p-6 text-sm text-ink-soft">{t('chart.noData')}</div>;
  }

  return (
    <div className="nm-raised p-4 sm:p-5">
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -14, bottom: 4 }}>
            <defs>
              <linearGradient id="ptFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartPalette.primary} stopOpacity={0.4} />
                <stop offset="100%" stopColor={chartPalette.primary} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke={GRID} vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} stroke={AXIS} fontSize={11} minTickGap={28} tickFormatter={(d: unknown) => formatDateShort(String(d), locale)} />
            <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickLine={false} axisLine={false} stroke={AXIS} fontSize={11} width={42} tickFormatter={(v) => `${v}%`} />
            <Tooltip contentStyle={tooltipStyle} labelFormatter={(label: unknown) => formatDateShort(String(label), locale)} formatter={(v: unknown) => [`${Math.round(Number(v))}%`, t('chart.avgProgress')]} />
            <Area type="monotone" dataKey="averageProgress" stroke={chartPalette.primary} strokeWidth={3} fill="url(#ptFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
