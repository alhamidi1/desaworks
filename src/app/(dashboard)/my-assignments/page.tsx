import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AssignmentCard from "@/components/monitoring/AssignmentCard";

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

  // BYPASS AUTH FOR LOCAL TESTING
  // Since Abdullah's /login page is not yet merged, redirecting to /login causes a 404 error.
  // We mock a dummy user so the page can still render.
  const mockUser = user || { id: "00000000-0000-0000-0000-000000000000" };


  const { data: assignments, error: assignmentsError } = await supabase
    .from("assignments")
    .select(
      `
      id,
      status,
      assigned_at,
      notes,
      projects ( name, start_date, end_date, status )
    `
    )
    .eq("resident_id", mockUser.id)
    .order("assigned_at", { ascending: false });

  if (assignmentsError) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">My Assignments</h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <p className="font-medium">Failed to load assignments</p>
          <p className="text-sm mt-1">{assignmentsError.message}</p>
        </div>
      </div>
    );
  }

  const typedAssignments = (assignments ?? []) as unknown as AssignmentRaw[];
  const assignmentIds = typedAssignments.map((a) => a.id);

  // Supabase may return the joined project as an object or a single-element array
  function extractProject(raw: ProjectJoin | ProjectJoin[] | null): ProjectJoin | null {
    if (!raw) return null;
    if (Array.isArray(raw)) return raw[0] ?? null;
    return raw;
  }

  // Fetch latest progress update per assignment using a single query
  // We get all progress updates for these assignments, then pick the latest per assignment in JS
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
      // Group by assignment_id and pick first (latest) for each
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

    // Also compute total hours worked per assignment
    const { data: hoursRows } = await supabase
      .from("progress_updates")
      .select("assignment_id, hours_worked")
      .in("assignment_id", assignmentIds);

    if (hoursRows) {
      const hoursTotals: Record<string, number> = {};
      for (const row of hoursRows as { assignment_id: string; hours_worked: number }[]) {
        hoursTotals[row.assignment_id] = (hoursTotals[row.assignment_id] ?? 0) + row.hours_worked;
      }
      // Merge totals into progressMap
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

  // Build card data
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

  const activeCount = cardData.filter(
    (c) => c.status === "active" || c.status === "confirmed"
  ).length;
  const completedCount = cardData.filter((c) => c.status === "completed").length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
      <p className="text-gray-500 mt-1 mb-6">
        Track your project assignments and submit progress updates.
      </p>

      {/* Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{cardData.length}</p>
          <p className="text-xs text-blue-600 mt-1">Total</p>
        </div>
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{activeCount}</p>
          <p className="text-xs text-green-600 mt-1">Active</p>
        </div>
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-700">{completedCount}</p>
          <p className="text-xs text-gray-500 mt-1">Completed</p>
        </div>
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">
            {cardData.filter((c) => c.status === "pending").length}
          </p>
          <p className="text-xs text-amber-600 mt-1">Pending</p>
        </div>
      </div>

      {/* Assignment Cards */}
      {cardData.length === 0 ? (
        <div className="text-center py-16 px-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
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
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.251 2.251 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No assignments yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            You haven&apos;t been assigned to any projects. Check back later or contact your
            manager.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {cardData.map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))}
        </div>
      )}
    </div>
  );
}