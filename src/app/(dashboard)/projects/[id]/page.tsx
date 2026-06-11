import Link from 'next/link';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProject } from '@/lib/actions/projects';
import { createClient } from '@/lib/supabase/server';
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge';
import type { Assignment, Profile } from '@/lib/types/database';

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

function ProjectDetailLoading() {
  return (
    <div className="space-y-4">
      <div className="h-48 animate-pulse rounded-lg border border-zinc-200 bg-zinc-100" />
      <p className="text-sm text-zinc-500">Loading project...</p>
    </div>
  );
}

function ProjectDetailError({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <p className="font-medium text-red-800">Failed to load project</p>
      <p className="mt-1 text-sm text-red-600">{message}</p>
      <Link
        href="/projects"
        className="mt-4 inline-block text-sm text-red-700 underline"
      >
        Back to projects
      </Link>
    </div>
  );
}

type AssignmentWithResident = Assignment & { resident: Profile };

async function fetchAssignments(
  projectId: string
): Promise<AssignmentWithResident[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('assignments')
    .select('*, resident:profiles(*)')
    .eq('project_id', projectId)
    .neq('status', 'void')
    .order('assigned_at', { ascending: false });

  if (error || !data) return [];
  return data as AssignmentWithResident[];
}

async function ProjectDetailContent({ id }: { id: string }) {
  const [projectResult, assignments] = await Promise.all([
    getProject(id),
    fetchAssignments(id),
  ]);

  if (!projectResult.success) {
    if (projectResult.error.toLowerCase().includes('not found')) {
      notFound();
    }
    return <ProjectDetailError message={projectResult.error} />;
  }

  const project = projectResult.data;

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-zinc-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">
              {project.name}
            </h1>
            {project.description && (
              <p className="mt-2 text-sm text-zinc-600">{project.description}</p>
            )}
          </div>
          <ProjectStatusBadge status={project.status} />
        </div>

        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-zinc-500">Timeline</dt>
            <dd className="font-medium text-zinc-800">
              {project.start_date ?? '—'} → {project.end_date ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Workers needed</dt>
            <dd className="font-medium text-zinc-800">
              {project.workers_needed}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Budget</dt>
            <dd className="font-medium text-zinc-800">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0,
              }).format(project.budget)}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Created by</dt>
            <dd className="font-medium text-zinc-800">
              {project.creator?.full_name ?? '—'}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-zinc-900">
          Skill requirements
        </h2>
        {project.skill_requirements.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">
            No skill requirements defined.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {project.skill_requirements.map((req) => (
              <li
                key={req.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-zinc-50 px-3 py-2 text-sm"
              >
                <span className="font-medium text-zinc-800">
                  {req.skill.name}
                </span>
                <span className="text-zinc-600">
                  Min. {req.min_proficiency} · {req.workers_needed} worker(s)
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">
            Assigned workers
          </h2>
          <Link
            href={`/projects/${project.id}/assign`}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Assign workers
          </Link>
        </div>

        {assignments.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">
            No workers assigned yet. Use &quot;Assign workers&quot; to match
            residents to this project.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {assignments.map((assignment) => (
              <li
                key={assignment.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-zinc-100 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-zinc-800">
                    {assignment.resident.full_name}
                  </p>
                  <p className="text-zinc-500">{assignment.resident.email}</p>
                </div>
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
                  {assignment.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { id } = await params;

  return (
    <main className="mx-auto max-w-4xl p-6">
      <header className="mb-6">
        <Link
          href="/projects"
          className="text-sm text-zinc-600 hover:text-zinc-900"
        >
          ← Back to projects
        </Link>
      </header>

      <Suspense fallback={<ProjectDetailLoading />}>
        <ProjectDetailContent id={id} />
      </Suspense>
    </main>
  );
}
