import { cookies } from "next/headers";
import { getRevenueReport, getManagerDashboardReport } from "@/lib/queries/reports";
import { RevenueChart } from "@/components/reports/RevenueChart";
import { RevenueRecordsTable } from "@/components/reports/RevenueRecordsTable";
import { ExportButton } from "@/components/reports/ExportButton";
import { createT, type Locale } from "@/lib/i18n";

export const metadata = {
  title: "Revenue Report — DesaWorks",
  description: "View revenue records, budget utilization, and monthly trends.",
};

function formatIDR(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function RevenueReportPage() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("desaworks_locale")?.value as Locale) || "id";
  const t = createT(locale);

  const [revenueReport, dashboard] = await Promise.all([
    getRevenueReport(),
    getManagerDashboardReport(),
  ]);

  // Summary stats
  const totalRevenue = revenueReport.records.reduce((sum, r) => sum + Number(r.amount), 0);
  const projectsWithRevenue = revenueReport.projects.filter((p) => p.revenueCount > 0).length;
  // Average only over projects that actually have a budget (exclude budget<=0 to avoid skew).
  const budgetedProjects = revenueReport.projects.filter((p) => p.revenueVsBudgetPct !== null);
  const avgBudgetUtilization =
    budgetedProjects.length > 0
      ? Math.round(
          (budgetedProjects.reduce((sum, p) => sum + (p.revenueVsBudgetPct ?? 0), 0) /
            budgetedProjects.length) *
            10,
        ) / 10
      : 0;


  // CSV export data
  const recordsExportData = revenueReport.records.map((record) => ({
    Project: record.projectName,
    Amount: record.amount,
    Description: record.description ?? "",
    Date: record.record_date,
    "Recorded By": record.recordedByName ?? "Unknown",
  }));

  // Projects over budget — sorted by severity, capped so the page isn't a wall of alerts.
  const overBudgetProjects = revenueReport.projects
    .filter((p) => p.warning !== null)
    .sort((a, b) => (b.revenueVsBudgetPct ?? 0) - (a.revenueVsBudgetPct ?? 0));
  const shownWarnings = overBudgetProjects.slice(0, 5);
  const extraWarningCount = overBudgetProjects.length - shownWarnings.length;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      {/* Page header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-700">
          {t("nav.reports")}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">
          {t("revenueReport.title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
          {t("revenueReport.subtitle")}
        </p>
      </div>

      {/* Summary stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="nm-raised p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-mute">
            {t("revenueReport.totalRevenue")}
          </p>
          <p className="mt-1 text-2xl font-bold text-ink">{formatIDR(totalRevenue)}</p>
        </div>
        <div className="nm-raised p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-mute">
            {t("revenueReport.projectsWithRevenue")}
          </p>
          <p className="mt-1 text-2xl font-bold text-primary-600">{projectsWithRevenue}</p>
        </div>
        <div className="nm-raised p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-mute">
            {t("revenueReport.avgBudgetUtilization")}
          </p>
          <p className="mt-1 text-2xl font-bold text-info">{avgBudgetUtilization}%</p>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="mb-8 space-y-3">
        <h2 className="text-lg font-bold text-ink">{t("chart.revenueTrend")}</h2>
        <RevenueChart data={revenueReport.monthlyTotals} />
      </div>


      {/* Budget warnings — top offenders only */}
      {shownWarnings.length > 0 && (
        <div className="mb-8 space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-ink">{t("revenueReport.overBudgetTitle")}</h2>
            <span className="rounded-full bg-warning-soft px-2 py-0.5 text-xs font-bold text-warning">
              {overBudgetProjects.length}
            </span>
          </div>
          {shownWarnings.map((proj) => (
            <div
              key={proj.project.id}
              className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning-soft px-4 py-3"
            >
              <svg
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-warning"
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
              <div className="text-sm text-warning">
                <p className="font-medium">{proj.project.name}</p>
                <p className="mt-0.5">
                  {t("alert.overBudget", { pct: proj.revenueVsBudgetPct ?? 0 })}
                </p>
                <p className="mt-0.5 text-xs text-warning/80">
                  {t("project.revenue")}: {formatIDR(proj.totalRevenue)} · {t("project.budget")}:{" "}
                  {formatIDR(Number(proj.project.budget))} ({proj.budgetUtilization}%)
                </p>
              </div>
            </div>
          ))}
          {extraWarningCount > 0 && (
            <p className="px-1 text-xs font-medium text-ink-soft">
              {t("revenueReport.moreOverBudget", { count: extraWarningCount })}
            </p>
          )}
        </div>
      )}

      {/* Revenue records table */}
      <section className="mb-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-ink">{t("revenueReport.revenueRecords")}</h2>
            <p className="mt-1 text-sm text-ink-soft">{t("revenueReport.revenueRecordsDesc")}</p>
          </div>
          <ExportButton
            data={recordsExportData}
            filename="revenue-records"
            label={t("revenueReport.exportRevenue")}
          />
        </div>

        <RevenueRecordsTable data={revenueReport.records} />
      </section>
    </main>
  );
}
