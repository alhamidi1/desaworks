export interface ProgressTimelineItem {
  projectName: string;
  startDate: string | null;
  endDate: string | null;
  currentProgress: number;
}

export interface ProgressTimelineProps {
  data: ProgressTimelineItem[];
}

function progressColor(percentage: number): string {
  if (percentage >= 75) return 'bg-emerald-500';
  if (percentage >= 50) return 'bg-teal-500';
  if (percentage >= 25) return 'bg-amber-500';
  return 'bg-red-500';
}

function progressTextColor(percentage: number): string {
  if (percentage >= 75) return 'text-emerald-700';
  if (percentage >= 50) return 'text-teal-700';
  if (percentage >= 25) return 'text-amber-700';
  return 'text-red-700';
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function EmptyState() {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mb-3 h-10 w-10 text-slate-300">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
      </svg>
      <p className="text-sm font-medium text-slate-500">No project timelines</p>
      <p className="mt-1 text-xs text-slate-400">Projects will appear here once they have progress data.</p>
    </div>
  );
}

export function ProgressTimeline({ data }: ProgressTimelineProps) {
  if (data.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-0 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.06)]">
      {data.map((item) => {
        const clampedProgress = Math.max(0, Math.min(100, item.currentProgress));

        return (
          <div key={item.projectName} className="px-5 py-4">
            {/* Header row */}
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium text-slate-900 truncate">{item.projectName}</h3>
              <span className={`text-sm font-bold tabular-nums ${progressTextColor(clampedProgress)}`}>
                {clampedProgress.toFixed(0)}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all duration-500 ${progressColor(clampedProgress)}`}
                style={{ width: `${clampedProgress}%` }}
              />
            </div>

            {/* Date range */}
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
              <span>{formatDate(item.startDate)}</span>
              <span>{formatDate(item.endDate)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
