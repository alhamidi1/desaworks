import Link from 'next/link';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProject } from '@/lib/actions/projects';
import { getWorkerRecommendations } from '@/lib/queries/recommendations';
import { createClient } from '@/lib/supabase/server';
import { AssignWorkersPanel } from '@/components/projects/AssignWorkersPanel';
import type { Skill } from '@/lib/types/database';

interface AssignWorkersPageProps {
  params: Promise<{ id: string }>;
}

function AssignLoading() {
  return (
    <div className="space-y-4">
      <div className="h-32 animate-pulse rounded-lg border border-zinc-200 bg-zinc-100" />
      <div className="h-64 animate-pulse rounded-lg border border-zinc-200 bg-zinc-100" />
      <p className="text-sm text-zinc-500">Loading recommendations...</p>
    </div>
  );
}

function AssignError({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <p className="font-medium text-red-800">Failed to load assignment page</p>
      <p className="mt-1 text-sm text-red-600">{message}</p>
    </div>
  );
}

async function fetchSkills(): Promise<Skill[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('skills')
    .select('*')
    .order('category')
    .order('name');
  return (data ?? []) as Skill[];
}

async function AssignWorkersContent({ id }: { id: string }) {
  const [projectResult, recommendationsResult, skills] = await Promise.all([
    getProject(id),
    getWorkerRecommendations(id, { availability: 'all' }),
    fetchSkills(),
  ]);

  if (!projectResult.success) {
    if (projectResult.error.toLowerCase().includes('not found')) {
      notFound();
    }
    return <AssignError message={projectResult.error} />;
  }

  if (!recommendationsResult.success) {
    return <AssignError message={recommendationsResult.error} />;
  }

  const project = projectResult.data;

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
        <p>
          <span className="font-medium text-zinc-800">{project.name}</span> ·
          needs {project.workers_needed} worker(s) ·{' '}
          {project.skill_requirements.length} skill requirement(s)
        </p>
      </section>

      <AssignWorkersPanel
        projectId={project.id}
        projectName={project.name}
        workersNeeded={project.workers_needed}
        totalRequirements={project.skill_requirements.length}
        workers={recommendationsResult.data}
        skills={skills}
      />
    </div>
  );
}

export default async function AssignWorkersPage({
  params,
}: AssignWorkersPageProps) {
  const { id } = await params;

  return (
    <main className="mx-auto max-w-4xl p-6">
      <header className="mb-6">
        <Link
          href={`/projects/${id}`}
          className="text-sm text-zinc-600 hover:text-zinc-900"
        >
          ← Back to project
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
          Assign workers
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Review recommendations and confirm worker assignments
        </p>
      </header>

      <Suspense fallback={<AssignLoading />}>
        <AssignWorkersContent id={id} />
      </Suspense>
    </main>
  );
}
