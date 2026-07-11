'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const GRID = '#dbe0e6';
const AXIS = '#59626f';

const tooltipStyle = {
  borderRadius: '12px',
  border: '1px solid #dee2e6',
  background: '#ffffff',
  boxShadow: '0 12px 32px rgba(15,23,42,0.12)',
  fontSize: '12px',
} as const;

export interface ProjectCompletionDatum {
  projectName: string;
  completionPercentage: number;
  assignedWorkers?: number;
}

function AxisTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  const name = String(payload?.value ?? '');
  const short = name.length > 14 ? `${name.slice(0, 14)}…` : name;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={14} textAnchor="middle" fill={AXIS} fontSize={11}>
        <title>{name}</title>
        {short}
      </text>
    </g>
  );
}

export function ProjectCompletionChart({ data }: { data: ProjectCompletionDatum[] }) {
  const { t } = useLanguage();

  if (!data.length) {
    return <div className="nm-raised grid min-h-[240px] place-items-center p-6 text-sm text-ink-soft">{t('chart.noData')}</div>;
  }

  return (
    <div className="nm-raised p-4 sm:p-5">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -14, bottom: 4 }}>
            <defs>
              <linearGradient id="pcFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00a18f" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#51f7db" stopOpacity={0.75} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke={GRID} vertical={false} />
            <XAxis dataKey="projectName" tickLine={false} axisLine={false} interval={0} height={42} tick={<AxisTick />} />
            <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickLine={false} axisLine={false} stroke={AXIS} fontSize={11} width={42} tickFormatter={(v) => `${v}%`} />
            <ReferenceLine y={100} stroke="#adb5bd" strokeDasharray="3 3" />
            <Tooltip cursor={{ fill: 'rgba(15,23,42,0.04)' }} contentStyle={tooltipStyle} formatter={(v: unknown) => [`${Math.round(Number(v))}%`, t('chart.completion')]} />
            <Bar dataKey="completionPercentage" fill="url(#pcFill)" radius={[8, 8, 2, 2]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
