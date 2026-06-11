"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface ProgressTrendDatum {
  date: string;
  averageProgress: number;
}

export interface ProgressOverTimeChartProps {
  data: ProgressTrendDatum[];
  title?: string;
  subtitle?: string;
}

function formatPercent(value: number) {
  return `${Math.max(0, Math.min(100, value)).toFixed(0)}%`;
}

function ChartEmptyState({ title, subtitle }: Pick<ProgressOverTimeChartProps, 'title' | 'subtitle'>) {
  return (
    <div className="flex min-h-[280px] flex-col justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-slate-500">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">{title ?? 'Progress over time'}</p>
      <p className="mt-3 max-w-sm text-sm leading-6">{subtitle ?? 'No progress trend data is available yet.'}</p>
    </div>
  );
}

export function ProgressOverTimeChart({ data, title = 'Progress over time', subtitle = 'Track how average completion changes across the project timeline.' }: ProgressOverTimeChartProps) {
  if (data.length === 0) {
    return <ChartEmptyState title={title} subtitle={subtitle} />;
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
      <div className="mb-5 flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">Trend</p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
        <p className="max-w-2xl text-sm leading-6 text-slate-500">{subtitle}</p>
      </div>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <defs>
              <linearGradient id="progressTrendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} stroke="#64748b" minTickGap={24} />
            <YAxis tickLine={false} axisLine={false} stroke="#64748b" tickFormatter={formatPercent} />
            <Tooltip
              contentStyle={{
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                boxShadow: '0 16px 40px rgba(15, 23, 42, 0.14)',
              }}
              formatter={(value: any) => [formatPercent(Number(value ?? 0)), 'Average progress']}
            />
            <Area type="monotone" dataKey="averageProgress" stroke="#0284c7" strokeWidth={3} fill="url(#progressTrendFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
