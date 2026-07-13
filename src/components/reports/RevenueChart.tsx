'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { formatCurrency } from '@/lib/i18n';
import { chartPalette, chartTooltipStyle } from '@/lib/charts/palette';

const GRID = chartPalette.grid;
const AXIS = chartPalette.axis;
const tooltipStyle = chartTooltipStyle;

export interface RevenueTrendDatum {
  month: string;
  amount: number;
}

// Compact Rupiah for axis ticks: rb (ribu/thousand), jt (juta/million), M (miliar/billion).
function compactIDR(v: number) {
  if (v >= 1e9) return `Rp${(v / 1e9).toFixed(1)}M`;
  if (v >= 1e6) return `Rp${Math.round(v / 1e6)}jt`;
  if (v >= 1e3) return `Rp${Math.round(v / 1e3)}rb`;
  return `Rp${v}`;
}

export function RevenueChart({ data }: { data: RevenueTrendDatum[] }) {
  const { t, locale } = useLanguage();

  if (!data.length) {
    return <div className="nm-raised grid min-h-[240px] place-items-center p-6 text-sm text-ink-soft">{t('chart.noData')}</div>;
  }

  const monthLabel = (m: string) => {
    try {
      return new Date(`${m}-01T00:00:00`).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { month: 'short', year: 'numeric' });
    } catch {
      return m;
    }
  };

  return (
    <div className="nm-raised p-4 sm:p-5">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 6, bottom: 4 }}>
            <defs>
              <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartPalette.primary} stopOpacity={0.4} />
                <stop offset="100%" stopColor={chartPalette.primary} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke={GRID} vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} stroke={AXIS} fontSize={11} minTickGap={20} tickFormatter={(m: unknown) => monthLabel(String(m))} />
            <YAxis tickLine={false} axisLine={false} stroke={AXIS} fontSize={11} width={64} tickFormatter={(v: unknown) => compactIDR(Number(v))} />
            <Tooltip contentStyle={tooltipStyle} labelFormatter={(m: unknown) => monthLabel(String(m))} formatter={(v: unknown) => [formatCurrency(Number(v)), t('project.revenue')]} />
            <Area type="monotone" dataKey="amount" stroke={chartPalette.primary} strokeWidth={3} fill="url(#revFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
