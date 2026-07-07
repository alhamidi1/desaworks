'use client';

export interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

const trendConfig = {
  up: {
    color: 'text-[#10b981]',
    bg: 'bg-[#10b981]/10',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
        <path fillRule="evenodd" d="M12.577 4.878a.75.75 0 0 1 .919-.53l4.78 1.281a.75.75 0 0 1 .531.919l-1.281 4.78a.75.75 0 0 1-1.449-.387l.81-3.022a19.407 19.407 0 0 1-5.594 5.203c-2.127 1.384-4.573 2.1-6.83 2.1a.75.75 0 0 1 0-1.5c1.98 0 4.13-.632 6.017-1.86a17.907 17.907 0 0 0 5.122-4.78l-2.874.77a.75.75 0 0 1-.388-1.45l.237-.064Z" clipRule="evenodd" />
      </svg>
    ),
  },
  down: {
    color: 'text-[#f43f5e]',
    bg: 'bg-[#f43f5e]/10',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
        <path fillRule="evenodd" d="M1.22 5.222a.75.75 0 0 1 1.06 0L7 9.942l3.768-3.769a.75.75 0 0 1 1.113.058 20.908 20.908 0 0 1 3.813 7.254l1.574-2.727a.75.75 0 0 1 1.3.75l-2.475 4.286a.75.75 0 0 1-1.025.275l-4.287-2.475a.75.75 0 0 1 .75-1.3l2.71 1.565a19.422 19.422 0 0 0-3.013-5.983L7.53 11.533a.75.75 0 0 1-1.06 0l-5.25-5.25a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
      </svg>
    ),
  },
  neutral: {
    color: 'text-[#868e96]',
    bg: 'bg-[#f1f3f5]',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
        <path fillRule="evenodd" d="M2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Z" clipRule="evenodd" />
      </svg>
    ),
  },
} as const;

export function StatsCard({ title, value, description, trend, trendValue }: StatsCardProps) {
  const trendInfo = trend ? trendConfig[trend] : null;

  return (
    <article className="group rounded-2xl border border-[#e9ecef] bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-[#c7fff4] hover:-translate-y-0.5">
      <p className="text-xs font-semibold text-[#868e96] uppercase tracking-wider">{title}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-3xl font-bold tracking-tight text-[#1a1d23]">{value}</p>
        {trendInfo && trendValue && (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${trendInfo.bg} ${trendInfo.color}`}>
            {trendInfo.icon}
            {trendValue}
          </span>
        )}
      </div>
      {description && (
        <p className="mt-2 text-xs leading-relaxed text-[#adb5bd]">{description}</p>
      )}
    </article>
  );
}
