'use client';

import type { DashboardActivityItem } from '@/lib/queries/reports';
import { Pagination } from '@/components/ui/Pagination';
import { usePaginatedSearch } from '@/lib/hooks/usePaginatedSearch';

export interface ActivityFeedProps {
  items: DashboardActivityItem[];
  /** How many entries to show per page (default 10 — the app-wide "next 10" convention). */
  pageSize?: number;
}

function formatRelativeTime(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;

  if (diffMs < 0) return 'just now';

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;

  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function statusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-emerald-500';
    case 'in_progress':
      return 'bg-blue-500';
    case 'on_hold':
      return 'bg-amber-500';
    case 'cancelled':
      return 'bg-red-500';
    default:
      return 'bg-slate-400';
  }
}

function progressBadgeColor(percentage: number): string {
  if (percentage >= 75) return 'bg-emerald-100 text-emerald-700';
  if (percentage >= 50) return 'bg-teal-100 text-teal-700';
  if (percentage >= 25) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
}

function truncate(text: string | null, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

function EmptyState() {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mb-3 h-10 w-10 text-slate-300">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
      <p className="text-sm font-medium text-slate-500">No recent activity</p>
      <p className="mt-1 text-xs text-slate-400">Progress updates from workers will appear here.</p>
    </div>
  );
}

export function ActivityFeed({ items, pageSize = 10 }: ActivityFeedProps) {
  const { pageItems, page, setPage, totalPages, total, from, to } = usePaginatedSearch(items, { pageSize });

  if (items.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="nm-raised p-4 sm:p-5 flex flex-col justify-start gap-3">
      <div className="space-y-2">
        {pageItems.map((item) => (
          <article key={item.id} className="flex gap-3 rounded-xl bg-surface px-4 py-3.5 transition-colors hover:bg-surface-soft">
            {/* Status dot */}
            <div className="mt-1.5 flex-shrink-0">
              <span className={`block h-2.5 w-2.5 rounded-full ${statusColor(item.status)}`} />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">{item.workerName}</p>
                  <p className="text-xs text-slate-500">{item.projectName}</p>
                </div>
                <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${progressBadgeColor(item.progressPercentage)}`}>
                  {item.progressPercentage}%
                </span>
              </div>
              {item.description && (
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {truncate(item.description, 120)}
                </p>
              )}
              <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                <time dateTime={item.createdAt}>{formatRelativeTime(item.createdAt)}</time>
                {item.hoursWorked > 0 && (
                  <span>• {item.hoursWorked}h worked</span>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-1">
        <Pagination page={page} totalPages={totalPages} total={total} from={from} to={to} onPage={setPage} />
      </div>
    </div>
  );
}
