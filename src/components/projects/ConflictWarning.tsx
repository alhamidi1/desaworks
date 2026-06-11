import type { SchedulingConflict } from '@/lib/queries/recommendations';

interface ConflictWarningProps {
  conflicts: SchedulingConflict[];
  className?: string;
}

function formatDateRange(
  start: string | null,
  end: string | null
): string {
  if (!start && !end) return 'dates not set';
  if (start && end) return `${start} – ${end}`;
  return start ?? end ?? 'dates not set';
}

export function ConflictWarning({ conflicts, className = '' }: ConflictWarningProps) {
  if (conflicts.length === 0) return null;

  return (
    <div
      className={`rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 ${className}`}
      role="alert"
    >
      <p className="flex items-center gap-1.5 font-medium">
        <span aria-hidden="true">⚠️</span>
        Scheduling conflict
      </p>
      <ul className="mt-2 list-inside list-disc space-y-1 text-amber-800">
        {conflicts.map((conflict) => (
          <li key={conflict.assignment_id}>
            Already assigned to &quot;{conflict.project_name}&quot; (
            {formatDateRange(conflict.start_date, conflict.end_date)})
          </li>
        ))}
      </ul>
    </div>
  );
}
