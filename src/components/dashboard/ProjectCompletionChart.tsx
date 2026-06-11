"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface ProjectCompletionDatum {
  projectName: string;
  completionPercentage: number;
  assignedWorkers?: number;
}

export interface ProjectCompletionChartProps {
  data: ProjectCompletionDatum[];
  title?: string;
  subtitle?: string;
}

function formatPercent(value: number) {
  return `${Math.max(0, Math.min(100, value)).toFixed(0)}%`;
}

function ChartEmptyState({ title, subtitle }: Pick<ProjectCompletionChartProps, 'title' | 'subtitle'>) {
  return (
    <div className="flex min-h-[280px] flex-col justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-slate-500">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">{title ?? 'Project completion'}</p>
      <p className="mt-3 max-w-sm text-sm leading-6">{subtitle ?? 'No project completion data is available yet.'}</p>
    </div>
  );
}

export function ProjectCompletionChart({ data, title = 'Project completion', subtitle = 'Compare how far each active project has progressed.' }: ProjectCompletionChartProps) {
  if (data.length === 0) {
    return <ChartEmptyState title={title} subtitle={subtitle} />;
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
      <div className="mb-5 flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">Analytics</p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
        <p className="max-w-2xl text-sm leading-6 text-slate-500">{subtitle}</p>
      </div>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <defs>
              <linearGradient id="projectCompletionFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0f766e" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.55} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="projectName" tickLine={false} axisLine={false} stroke="#64748b" interval={0} height={52} />
            <YAxis tickLine={false} axisLine={false} stroke="#64748b" tickFormatter={formatPercent} />
            <Tooltip
              cursor={{ fill: 'rgba(15, 23, 42, 0.04)' }}
              contentStyle={{
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                boxShadow: '0 16px 40px rgba(15, 23, 42, 0.14)',
              }}
              formatter={(value: any, name: any) => {
                if (name === 'completionPercentage') {
                  return [formatPercent(Number(value ?? 0)), 'Completion'];
                }

                return [value, name];
              }}
            />
            <Bar dataKey="completionPercentage" fill="url(#projectCompletionFill)" radius={[12, 12, 4, 4]} maxBarSize={56} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {data.map((item) => (
          <article key={item.projectName} className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-sm font-medium text-slate-950">{item.projectName}</p>
            <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
              <span>{formatPercent(item.completionPercentage)}</span>
              {typeof item.assignedWorkers === 'number' ? <span>{item.assignedWorkers} workers</span> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
