import Link from 'next/link';
import { getManagerDashboardReport } from '@/lib/queries/reports';

export const metadata = {
  title: 'Reports — DesaWorks',
  description: 'View performance, revenue, and project analytics reports.',
};

export default async function ReportsPage() {
  const dashboard = await getManagerDashboardReport();

  const totalProjects = dashboard.projects.length;
  const activeProjects = dashboard.projects.filter(
    (m) => m.project.status === 'in_progress' || m.project.status === 'open'
  ).length;

  const reportCards = [
    {
      title: 'Performance Report',
      description:
        'Track project completion, worker contributions, and progress trends across all projects.',
      href: '/reports/performance',
      icon: (
        <svg
          className="h-6 w-6 text-teal-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
          />
        </svg>
      ),
    },
    {
      title: 'Revenue Report',
      description:
        'Monitor revenue records, budget utilization, and monthly trends. Record new revenue entries.',
      href: '/reports/revenue',
      icon: (
        <svg
          className="h-6 w-6 text-rose-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      ),
    },
    {
      title: 'Project Analytics',
      description:
        'Dive into individual project metrics — worker assignments, progress history, and activity feed.',
      href: '#',
      icon: (
        <svg
          className="h-6 w-6 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z"
          />
        </svg>
      ),
    },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      {/* Page header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">
          Reports
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          Reports & Analytics
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Access performance, revenue, and project analytics reports to monitor
          BUMDes operations.
        </p>
      </div>

      {/* Quick stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Total Projects
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {totalProjects}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Active Projects
          </p>
          <p className="mt-1 text-2xl font-bold text-teal-600">
            {activeProjects}
          </p>
        </div>
      </div>

      {/* Report cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reportCards.map((card) => {
          const isLink = card.href !== '#';

          const content = (
            <div className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50">
                {card.icon}
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-900 group-hover:text-teal-700">
                {card.title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">
                {card.description}
              </p>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-teal-600">
                {isLink ? 'View report' : 'Select a project to view'}
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </div>
            </div>
          );

          if (isLink) {
            return (
              <Link key={card.title} href={card.href} className="block">
                {content}
              </Link>
            );
          }

          return (
            <div key={card.title}>
              {content}
              {/* Project links for analytics */}
              {dashboard.projects.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {dashboard.projects.slice(0, 5).map((metric) => (
                    <li key={metric.project.id}>
                      <Link
                        href={`/reports/performance`}
                        className="block rounded-lg px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-teal-700"
                      >
                        {metric.project.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
