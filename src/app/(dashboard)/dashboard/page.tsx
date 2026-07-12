import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getManagerDashboardReport, getImpactReport, type RangeKey } from '@/lib/queries/reports';
import { ManagerDashboard } from '@/components/dashboard/ManagerDashboard';
import ResidentDashboard, { ResidentAssignment } from '@/components/dashboard/ResidentDashboard';

export const metadata = {
  title: 'Beranda — DesaWorks',
  description: 'Sistem Pengelolaan Sumber Daya Masyarakat Desa',
};

const VALID_RANGES: RangeKey[] = ['7d', '30d', '90d', '365d', 'all'];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Get user profile role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name, role, availability')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    redirect('/login');
  }

  // Render Manager Dashboard
  if (profile.role === 'manager' || profile.role === 'admin') {
    const sp = await searchParams;
    const range = VALID_RANGES.includes(sp?.range as RangeKey) ? (sp!.range as RangeKey) : undefined;
    const [report, impact] = await Promise.all([
      getManagerDashboardReport(range ? { range } : {}),
      getImpactReport(),
    ]);
    return <ManagerDashboard report={report} impact={impact} />;
  }

  // Render Resident Dashboard
  const { data: assignmentsRaw, error: assignmentsError } = await supabase
    .from('assignments')
    .select(`
      id,
      status,
      assigned_at,
      projects (
        name,
        start_date,
        end_date,
        status
      )
    `)
    .eq('resident_id', user.id);

  const { data: notificationsRaw } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  const notifications = (notificationsRaw ?? []).map((n: any) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    read: n.read,
    created_at: n.created_at,
  }));

  const typedAssignmentsRaw = assignmentsRaw ?? [];
  const assignmentIds = typedAssignmentsRaw.map((a: any) => a.id);

  let progressUpdates: any[] = [];
  if (assignmentIds.length > 0) {
    const { data } = await supabase
      .from('progress_updates')
      .select('assignment_id, progress_percentage, hours_worked, description, created_at')
      .in('assignment_id', assignmentIds)
      .order('created_at', { ascending: false });
    progressUpdates = data ?? [];
  }

  const latestProgressMap = new Map<string, any>();
  const hoursWorkedMap = new Map<string, number>();

  for (const update of progressUpdates) {
    if (!latestProgressMap.has(update.assignment_id)) {
      latestProgressMap.set(update.assignment_id, update);
    }
    const currentHours = hoursWorkedMap.get(update.assignment_id) ?? 0;
    hoursWorkedMap.set(update.assignment_id, currentHours + Number(update.hours_worked || 0));
  }

  function extractProject(raw: any) {
    if (!raw) return null;
    if (Array.isArray(raw)) return raw[0] ?? null;
    return raw;
  }

  const activeAssignments: ResidentAssignment[] = [];
  let completedAssignmentsCount = 0;
  let totalHoursWorked = 0;

  for (const a of typedAssignmentsRaw) {
    const proj = extractProject(a.projects);
    const latestProgress = latestProgressMap.get(a.id);
    const assignmentHours = hoursWorkedMap.get(a.id) ?? 0;
    // Don't count hours from voided assignments toward lifetime totals.
    if (a.status !== 'void') {
      totalHoursWorked += assignmentHours;
    }

    if (a.status === 'completed') {
      completedAssignmentsCount++;
    }

    if (a.status === 'confirmed' || a.status === 'active' || a.status === 'pending') {
      activeAssignments.push({
        id: a.id,
        status: a.status,
        assigned_at: a.assigned_at,
        project_name: proj?.name ?? 'Unknown Project',
        project_start_date: proj?.start_date ?? null,
        project_end_date: proj?.end_date ?? null,
        project_status: proj?.status ?? 'draft',
        current_progress: latestProgress?.progress_percentage ?? 0,
        total_hours_worked: assignmentHours,
        latest_description: latestProgress?.description ?? null,
      });
    }
  }

  return (
    <ResidentDashboard
      userName={profile.full_name}
      residentId={user.id}
      availability={(profile.availability as 'available' | 'unavailable') ?? 'available'}
      activeAssignments={activeAssignments}
      completedAssignmentsCount={completedAssignmentsCount}
      totalHoursWorked={Math.round(totalHoursWorked * 10) / 10}
      notifications={notifications}
    />
  );
}
