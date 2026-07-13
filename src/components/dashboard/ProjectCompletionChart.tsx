'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { chartPalette, chartTooltipStyle } from '@/lib/charts/palette';
import { ChartBox } from '@/components/charts/ChartBox';

const GRID = chartPalette.grid;
const AXIS = chartPalette.axis;
const tooltipStyle = chartTooltipStyle;

export interface ProjectCompletionDatum {
  projectName: string;
  completionPercentage: number;
  assignedWorkers?: number;
}

function AxisTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  const name = String(payload?.value ?? '');
  const short = name.length > 12 ? `${name.slice(0, 12)}…` : name;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={8}
        dx={-4}
        transform="rotate(-35)"
        textAnchor="end"
        fill={AXIS}
        fontSize={10}
        className="font-medium"
      >
        <title>{name}</title>
        {short}
      </text>
    </g>
  );
}

export function ProjectCompletionChart({ data }: { data: ProjectCompletionDatum[] }) {
  const { t } = useLanguage();
  if (typeof window !== 'undefined') console.log('PCCHART_DATA', JSON.stringify(data));

  if (!data.length) {
    return <div className="nm-raised grid min-h-[240px] place-items-center p-6 text-sm text-ink-soft">{t('chart.noData')}</div>;
  }

  return (
    <div className="nm-raised p-4 sm:p-5 h-full flex flex-col justify-center overflow-hidden">
      <div className="w-full overflow-x-auto scrollbar-none pb-2">
        <div className="min-w-[480px] lg:min-w-0">
          <ChartBox height={300}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="pcFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartPalette.primary} stopOpacity={0.95} />
                  <stop offset="100%" stopColor={chartPalette.primaryLight} stopOpacity={0.75} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke={GRID} vertical={false} />
              <XAxis dataKey="projectName" tickLine={false} axisLine={false} interval={0} height={50} tick={<AxisTick />} />
              <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickLine={false} axisLine={false} stroke={AXIS} fontSize={11} width={42} tickFormatter={(v) => `${v}%`} />
              <ReferenceLine y={100} stroke={chartPalette.ref} strokeDasharray="3 3" />
              <Tooltip cursor={{ fill: 'rgba(15,23,42,0.04)' }} contentStyle={tooltipStyle} formatter={(v: unknown) => [`${Math.round(Number(v))}%`, t('chart.completion')]} />
              <Bar dataKey="completionPercentage" fill="url(#pcFill)" radius={[8, 8, 2, 2]} maxBarSize={48} />
            </BarChart>
          </ChartBox>
        </div>
      </div>
    </div>
  );
}
