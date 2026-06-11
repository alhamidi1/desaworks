interface PerformanceRow {
  projectName: string;
  completionPercentage: number;
  assignedWorkers: number;
  activeAssignments: number;
  status: string;
}

interface PerformanceTableProps {
  data: PerformanceRow[];
}

function getStatusBadgeClasses(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-700';
    case 'in_progress':
      return 'bg-blue-100 text-blue-700';
    case 'open':
      return 'bg-teal-100 text-teal-700';
    case 'cancelled':
      return 'bg-red-100 text-red-700';
    case 'draft':
    default:
      return 'bg-slate-100 text-slate-600';
  }
}

function formatStatusLabel(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function getProgressBarColor(percentage: number) {
  if (percentage >= 80) return 'bg-green-500';
  if (percentage >= 50) return 'bg-blue-500';
  if (percentage >= 25) return 'bg-amber-500';
  return 'bg-slate-400';
}

export function PerformanceTable({ data }: PerformanceTableProps) {
  if (data.length === 0) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
        <svg
          className="h-10 w-10 text-slate-300"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
          />
        </svg>
        <p className="mt-3 text-sm font-medium text-slate-500">
          No performance data available
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Performance metrics will appear here once projects have progress data.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="px-4 py-3 text-left font-semibold text-slate-700">
              Project
            </th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">
              Completion
            </th>
            <th className="px-4 py-3 text-center font-semibold text-slate-700">
              Workers
            </th>
            <th className="px-4 py-3 text-center font-semibold text-slate-700">
              Active
            </th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={row.projectName}
              className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                index % 2 === 1 ? 'bg-slate-50/50' : ''
              }`}
            >
              <td className="px-4 py-3 font-medium text-slate-900">
                {row.projectName}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full transition-all ${getProgressBarColor(row.completionPercentage)}`}
                      style={{
                        width: `${Math.min(100, Math.max(0, row.completionPercentage))}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-600">
                    {row.completionPercentage.toFixed(1)}%
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-center text-slate-600">
                {row.assignedWorkers}
              </td>
              <td className="px-4 py-3 text-center text-slate-600">
                {row.activeAssignments}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClasses(row.status)}`}
                >
                  {formatStatusLabel(row.status)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
