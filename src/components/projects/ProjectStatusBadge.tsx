import type { ProjectStatus } from '@/lib/types/database';

const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: 'Draft',
  open: 'Open',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_STYLES: Record<ProjectStatus, string> = {
  draft: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  open: 'bg-blue-50 text-blue-700 border-blue-200',
  in_progress: 'bg-amber-50 text-amber-800 border-amber-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

export function ProjectStatusBadge({ status, className = '' }: ProjectStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]} ${className}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
