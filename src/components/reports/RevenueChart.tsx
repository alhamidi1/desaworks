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

export interface RevenueTrendDatum {
  month: string;
  amount: number;
}

export interface RevenueChartProps {
  data: RevenueTrendDatum[];
  title?: string;
  subtitle?: string;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

function ChartEmptyState({ title, subtitle }: Pick<RevenueChartProps, 'title' | 'subtitle'>) {
  return (
    <div className="flex min-h-[280px] flex-col justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-slate-500">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">{title ?? 'Revenue trend'}</p>
      <p className="mt-3 max-w-sm text-sm leading-6">{subtitle ?? 'No revenue trend data is available yet.'}</p>
    </div>
  );
}

export function RevenueChart({ data, title = 'Revenue trend', subtitle = 'Monitor revenue by month and compare how projects contribute over time.' }: RevenueChartProps) {
  if (data.length === 0) {
    return <ChartEmptyState title={title} subtitle={subtitle} />;
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
      <div className="mb-5 flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-700">Revenue</p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
        <p className="max-w-2xl text-sm leading-6 text-slate-500">{subtitle}</p>
      </div>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <defs>
              <linearGradient id="revenueTrendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#be123c" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#be123c" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="#64748b" minTickGap={20} />
            <YAxis tickLine={false} axisLine={false} stroke="#64748b" tickFormatter={formatCurrency} width={84} />
            <Tooltip
              contentStyle={{
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                boxShadow: '0 16px 40px rgba(15, 23, 42, 0.14)',
              }}
              formatter={(value: any) => [formatCurrency(Number(value ?? 0)), 'Revenue']}
            />
            <Area type="monotone" dataKey="amount" stroke="#be123c" strokeWidth={3} fill="url(#revenueTrendFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
