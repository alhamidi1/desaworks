export interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

const trendConfig = {
  up: {
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path fillRule="evenodd" d="M12.577 4.878a.75.75 0 0 1 .919-.53l4.78 1.281a.75.75 0 0 1 .531.919l-1.281 4.78a.75.75 0 0 1-1.449-.387l.81-3.022a19.407 19.407 0 0 1-5.594 5.203c-2.127 1.384-4.573 2.1-6.83 2.1a.75.75 0 0 1 0-1.5c1.98 0 4.13-.632 6.017-1.86a17.907 17.907 0 0 0 5.122-4.78l-2.874.77a.75.75 0 0 1-.388-1.45l.237-.064Z" clipRule="evenodd" />
      </svg>
    ),
  },
  down: {
    color: 'text-red-600',
    bg: 'bg-red-50',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path fillRule="evenodd" d="M1.22 5.222a.75.75 0 0 1 1.06 0L7 9.942l3.768-3.769a.75.75 0 0 1 1.113.058 20.908 20.908 0 0 1 3.813 7.254l1.574-2.727a.75.75 0 0 1 1.3.75l-2.475 4.286a.75.75 0 0 1-1.025.275l-4.287-2.475a.75.75 0 0 1 .75-1.3l2.71 1.565a19.422 19.422 0 0 0-3.013-5.983L7.53 11.533a.75.75 0 0 1-1.06 0l-5.25-5.25a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
      </svg>
    ),
  },
  neutral: {
    color: 'text-slate-500',
    bg: 'bg-slate-100',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path fillRule="evenodd" d="M2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Z" clipRule="evenodd" />
      </svg>
    ),
  },
} as const;

export function StatsCard({ title, value, description, trend, trendValue }: StatsCardProps) {
  const trendInfo = trend ? trendConfig[trend] : null;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_24px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-[0_8px_32px_rgba(15,23,42,0.1)]">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="text-3xl font-bold tracking-tight text-slate-950">{value}</p>
        {trendInfo && trendValue && (
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${trendInfo.bg} ${trendInfo.color}`}>
            {trendInfo.icon}
            {trendValue}
          </span>
        )}
      </div>
      {description && (
        <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
      )}
    </article>
  );
}
