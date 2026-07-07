import { getManagerDashboardReport } from '@/lib/queries/reports';
import { ReportsPageClient } from './client-wrapper';

export const metadata = {
  title: 'Laporan — DesaWorks',
  description: 'Lihat laporan kinerja, pendapatan, dan analitik proyek.',
};

export default async function ReportsPage() {
  const dashboard = await getManagerDashboardReport();

  const totalProjects = dashboard.projects.length;
  const activeProjects = dashboard.projects.filter(
    (m) => m.project.status === 'in_progress' || m.project.status === 'open'
  ).length;

  const projectNames = dashboard.projects.slice(0, 5).map((m) => ({
    id: m.project.id,
    name: m.project.name,
  }));

  return (
    <ReportsPageClient
      totalProjects={totalProjects}
      activeProjects={activeProjects}
      projectNames={projectNames}
    />
  );
}
