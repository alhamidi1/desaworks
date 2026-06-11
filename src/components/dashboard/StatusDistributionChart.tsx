"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

export interface StatusDistributionDatum {
  status: string;
  count: number;
}

export interface StatusDistributionChartProps {
  data: StatusDistributionDatum[];
  title?: string;
  subtitle?: string;
}

const STATUS_COLORS = ['#0f766e', '#0891b2', '#f59e0b', '#10b981', '#dc2626'];

function ChartEmptyState({ title, subtitle }: Pick<StatusDistributionChartProps, 'title' | 'subtitle'>) {
  return (
    <div className="flex min-h-[280px] flex-col justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-slate-500">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">{title ?? 'Status distribution'}</p>
      <p className="mt-3 max-w-sm text-sm leading-6">{subtitle ?? 'No project status breakdown is available yet.'}</p>
    </div>
  );
}

export function StatusDistributionChart({ data, title = 'Project status distribution', subtitle = 'See how the portfolio is split across each project lifecycle state.' }: StatusDistributionChartProps) {
  if (data.length === 0) {
    return <ChartEmptyState title={title} subtitle={subtitle} />;
  }

  const totalCount = data.reduce((sum, item) => sum + item.count, 0) || 1;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
      <div className="mb-5 flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Breakdown</p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
        <p className="max-w-2xl text-sm leading-6 text-slate-500">{subtitle}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-center">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  boxShadow: '0 16px 40px rgba(15, 23, 42, 0.14)',
                }}
                  formatter={(value: any, name: any) => [value, name]}
              />
              <Pie
                data={data}
                dataKey="count"
                nameKey="status"
                innerRadius={72}
                outerRadius={110}
                paddingAngle={4}
                stroke="#ffffff"
                strokeWidth={3}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid gap-3">
          {data.map((item, index) => {
            const percent = Math.round((item.count / totalCount) * 1000) / 10;

            return (
              <div key={item.status} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[index % STATUS_COLORS.length] }}
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-950">{item.status}</p>
                    <p className="text-xs text-slate-500">{item.count} projects</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-700">{percent}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
