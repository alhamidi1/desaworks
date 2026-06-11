import { getProjectAnalyticsReport, getRevenueReport } from "@/lib/queries/reports";
import { ProgressOverTimeChart } from "@/components/dashboard/ProgressOverTimeChart";
import { WorkerContributionTable } from "@/components/reports/WorkerContributionTable";
import { ExportButton } from "@/components/reports/ExportButton";
import { ActivityFeed } from "@/components/monitoring/ActivityFeed";
import Link from "next/link";

interface ProjectAnalyticsPageProps {
  params: Promise<{ id: string }>;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    open: "bg-blue-100 text-blue-700",
    in_progress: "bg-amber-100 text-amber-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors[status] ?? "bg-gray-100 text-gray-700"}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function formatIDR(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function ProjectAnalyticsPage({
  params,
}: ProjectAnalyticsPageProps) {
  const { id } = await params;
  const report = await getProjectAnalyticsReport(id);

  if (!report.project) {
    return (
      <div className="p-8">
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            Project Not Found
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            The project you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { project, workers, progressHistory, activityFeed } = report;

  // Fetch revenue data for this specific project
  const revenueReport = await getRevenueReport();
  const projectRevenue = revenueReport.projects.find(
    (p) => p.project.id === id
  );

  // Calculate stats
  const totalWorkers = workers.length;
  const activeWorkers = workers.filter(
    (w) => w.assignment.status === "active" || w.assignment.status === "confirmed"
  ).length;
  const totalHours = workers.reduce((sum, w) => sum + w.totalHoursWorked, 0);
  const totalUpdates = workers.reduce((sum, w) => sum + w.taskCount, 0);

  // Overall completion: average of latest progress across all workers
  const latestProgresses = workers
    .map((w) => w.latestProgress?.progress_percentage ?? 0)
    .filter((p) => p > 0);
  const overallCompletion =
    latestProgresses.length > 0
      ? Math.round(
          (latestProgresses.reduce((sum, p) => sum + p, 0) /
            latestProgresses.length) *
            10
        ) / 10
      : 0;

  // Worker contribution data for export
  const workerExportData = workers.map((w) => ({
    Worker: w.worker.full_name,
    Email: w.worker.email,
    Status: w.assignment.status,
    "Latest Progress (%)": w.latestProgress?.progress_percentage ?? 0,
    "Hours Worked": w.totalHoursWorked,
    "Updates Submitted": w.taskCount,
    "Assigned At": w.assignment.assigned_at,
  }));

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb & Header */}
      <div>
        <nav className="flex items-center gap-1 text-sm text-gray-500 mb-3">
          <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{project.name}</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {project.name}
              </h1>
              <StatusBadge status={project.status} />
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
              <span>
                📅 {formatDate(project.start_date)} → {formatDate(project.end_date)}
              </span>
              {project.budget && (
                <span>💰 Budget: {formatIDR(Number(project.budget))}</span>
              )}
              {project.workers_needed && (
                <span>👥 Need: {project.workers_needed} workers</span>
              )}
            </div>
          </div>
          <Link
            href="/dashboard"
            className="shrink-0 inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            ← Back
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            label: "Overall Completion",
            value: `${overallCompletion}%`,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Assigned Workers",
            value: totalWorkers,
            sub: `${activeWorkers} active`,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
          },
          {
            label: "Total Hours",
            value: totalHours.toFixed(1),
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Progress Updates",
            value: totalUpdates,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
          {
            label: "Revenue",
            value: projectRevenue
              ? formatIDR(projectRevenue.totalRevenue)
              : "—",
            sub: projectRevenue
              ? `${projectRevenue.budgetUtilization}% of budget`
              : undefined,
            color: "text-teal-600",
            bg: "bg-teal-50",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl ${stat.bg} border border-gray-100 p-4 shadow-sm`}
          >
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {stat.label}
            </p>
            <p className={`mt-1 text-xl font-bold ${stat.color}`}>
              {stat.value}
            </p>
            {stat.sub && (
              <p className="text-xs text-gray-500 mt-0.5">{stat.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* Completion Bar */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">
            Project Completion
          </h3>
          <span className="text-sm font-bold text-blue-600">
            {overallCompletion}%
          </span>
        </div>
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              overallCompletion >= 100
                ? "bg-green-500"
                : overallCompletion >= 75
                  ? "bg-blue-500"
                  : overallCompletion >= 50
                    ? "bg-amber-500"
                    : "bg-red-400"
            }`}
            style={{ width: `${Math.min(overallCompletion, 100)}%` }}
          />
        </div>
      </div>

      {/* Revenue Warning */}
      {projectRevenue?.warning && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-amber-600 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
            <p className="text-sm font-medium text-amber-800">
              ⚠️ Budget Warning: {projectRevenue.warning}
            </p>
          </div>
        </div>
      )}

      {/* Charts & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Over Time Chart */}
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            📈 Progress Over Time
          </h3>
          <ProgressOverTimeChart data={progressHistory} />
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            🕒 Recent Activity
          </h3>
          <ActivityFeed items={activityFeed.slice(0, 10)} />
        </div>
      </div>

      {/* Worker Contribution Table */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">
            👥 Worker Contributions
          </h3>
          <ExportButton
            data={workerExportData}
            filename={`${project.name.replace(/\s+/g, "_")}_workers`}
          />
        </div>
        <WorkerContributionTable
          data={workers.map((w) => ({
            workerName: w.worker.full_name,
            email: w.worker.email,
            totalHoursWorked: w.totalHoursWorked,
            taskCount: w.taskCount,
            latestProgress: w.latestProgress?.progress_percentage ?? null,
            assignmentStatus: w.assignment.status,
          }))}
        />
      </div>
    </div>
  );
}
