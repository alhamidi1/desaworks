interface WorkerContributionRow {
  workerName: string;
  email: string;
  totalHoursWorked: number;
  taskCount: number;
  latestProgress: number | null;
  assignmentStatus: string;
}

interface WorkerContributionTableProps {
  data: WorkerContributionRow[];
}

function getStatusBadgeClasses(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-700';
    case 'active':
      return 'bg-blue-100 text-blue-700';
    case 'confirmed':
      return 'bg-teal-100 text-teal-700';
    case 'pending':
      return 'bg-amber-100 text-amber-700';
    case 'void':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}

function formatStatusLabel(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function SortIcon() {
  return (
    <svg
      className="ml-1 inline-block h-3 w-3 text-slate-400"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
    </svg>
  );
}

export function WorkerContributionTable({ data }: WorkerContributionTableProps) {
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
            d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
          />
        </svg>
        <p className="mt-3 text-sm font-medium text-slate-500">
          No worker contribution data available
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Worker metrics will appear here once assignments have progress updates.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[700px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="px-4 py-3 text-left font-semibold text-slate-700">
              Worker
            </th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">
              Hours <SortIcon />
            </th>
            <th className="px-4 py-3 text-center font-semibold text-slate-700">
              Tasks <SortIcon />
            </th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">
              Latest Progress
            </th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={`${row.workerName}-${row.email}-${index}`}
              className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                index % 2 === 1 ? 'bg-slate-50/50' : ''
              }`}
            >
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium text-slate-900">{row.workerName}</p>
                  <p className="text-xs text-slate-400">{row.email}</p>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-600">
                {row.totalHoursWorked.toFixed(1)}h
              </td>
              <td className="px-4 py-3 text-center text-slate-600">
                {row.taskCount}
              </td>
              <td className="px-4 py-3">
                {row.latestProgress !== null ? (
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full transition-all ${
                          row.latestProgress >= 80
                            ? 'bg-green-500'
                            : row.latestProgress >= 50
                              ? 'bg-blue-500'
                              : row.latestProgress >= 25
                                ? 'bg-amber-500'
                                : 'bg-slate-400'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.max(0, row.latestProgress))}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-600">
                      {row.latestProgress}%
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">No data</span>
                )}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClasses(row.assignmentStatus)}`}
                >
                  {formatStatusLabel(row.assignmentStatus)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
