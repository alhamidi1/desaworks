import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AssignmentCard from "@/components/monitoring/AssignmentCard";
import { MyAssignmentsClientWrapper } from "./client-wrapper";

interface ProjectJoin {
  name: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
}

interface AssignmentRaw {
  id: string;
  status: string;
  assigned_at: string;
  notes: string | null;
  projects: ProjectJoin | ProjectJoin[] | null;
}

interface ProgressRow {
  assignment_id: string;
  progress_percentage: number;
  hours_worked: number;
  description: string | null;
}

export default async function MyAssignmentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'resident' && profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  const { data: assignments, error: assignmentsError } = await supabase
    .from("assignments")
    .select(`
      id,
      status,
      assigned_at,
      notes,
      projects ( name, start_date, end_date, status )
    `)
    .eq("resident_id", user.id)
    .order("assigned_at", { ascending: false });

  if (assignmentsError) {
    return (
      <MyAssignmentsClientWrapper error={assignmentsError.message} cardData={[]} />
    );
  }

  const typedAssignments = (assignments ?? []) as unknown as AssignmentRaw[];
  const assignmentIds = typedAssignments.map((a) => a.id);

  function extractProject(raw: ProjectJoin | ProjectJoin[] | null): ProjectJoin | null {
    if (!raw) return null;
    if (Array.isArray(raw)) return raw[0] ?? null;
    return raw;
  }

  let progressMap: Record<
    string,
    { progress_percentage: number; hours_worked: number; description: string | null }
  > = {};

  if (assignmentIds.length > 0) {
    const { data: progressRows } = await supabase
      .from("progress_updates")
      .select("assignment_id, progress_percentage, hours_worked, description, created_at")
      .in("assignment_id", assignmentIds)
      .order("created_at", { ascending: false });

    if (progressRows) {
      const seen = new Set<string>();
      for (const row of progressRows as (ProgressRow & { created_at: string })[]) {
        if (!seen.has(row.assignment_id)) {
          seen.add(row.assignment_id);
          progressMap[row.assignment_id] = {
            progress_percentage: row.progress_percentage,
            hours_worked: row.hours_worked,
            description: row.description,
          };
        }
      }
    }

    const { data: hoursRows } = await supabase
      .from("progress_updates")
      .select("assignment_id, hours_worked")
      .in("assignment_id", assignmentIds);

    if (hoursRows) {
      const hoursTotals: Record<string, number> = {};
      for (const row of hoursRows as { assignment_id: string; hours_worked: number }[]) {
        hoursTotals[row.assignment_id] = (hoursTotals[row.assignment_id] ?? 0) + row.hours_worked;
      }
      for (const [aid, total] of Object.entries(hoursTotals)) {
        if (progressMap[aid]) {
          progressMap[aid].hours_worked = total;
        } else {
          progressMap[aid] = {
            progress_percentage: 0,
            hours_worked: total,
            description: null,
          };
        }
      }
    }
  }

  const cardData = typedAssignments.map((a) => {
    const progress = progressMap[a.id];
    const proj = extractProject(a.projects);
    return {
      id: a.id,
      status: a.status,
      assigned_at: a.assigned_at,
      notes: a.notes,
      project_name: proj?.name ?? "Unknown Project",
      project_start_date: proj?.start_date ?? null,
      project_end_date: proj?.end_date ?? null,
      project_status: proj?.status ?? "draft",
      current_progress: progress?.progress_percentage ?? 0,
      total_hours_worked: progress?.hours_worked ?? 0,
      latest_description: progress?.description ?? null,
    };
  });

  return <MyAssignmentsClientWrapper cardData={cardData} />;
}