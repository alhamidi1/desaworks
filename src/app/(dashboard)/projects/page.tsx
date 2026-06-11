import Link from 'next/link';
import { Suspense } from 'react';
import { listProjects } from '@/lib/actions/projects';
import { ProjectCard } from '@/components/projects/ProjectCard';

function ProjectsLoading() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-40 animate-pulse rounded-lg border border-zinc-200 bg-zinc-100"
        />
      ))}
      <p className="text-sm text-zinc-500">Loading projects...</p>
    </div>
  );
}

function ProjectsError({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <p className="font-medium text-red-800">Failed to load projects</p>
      <p className="mt-1 text-sm text-red-600">{message}</p>
    </div>
  );
}

function ProjectsEmpty() {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 p-10 text-center">
      <p className="font-medium text-zinc-800">No projects yet</p>
      <p className="mt-1 text-sm text-zinc-500">
        Create your first village project to start assigning workers.
      </p>
      <Link
        href="/projects/create"
        className="mt-4 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Create project
      </Link>
    </div>
  );
}

async function ProjectsList() {
  const result = await listProjects();

  if (!result.success) {
    return <ProjectsError message={result.error} />;
  }

  if (result.data.length === 0) {
    return <ProjectsEmpty />;
  }

  return (
    <div className="grid gap-4">
      {result.data.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          href={`/projects/${project.id}`}
        />
      ))}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Projects</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Manage village projects and workforce assignments
          </p>
        </div>
        <Link
          href="/projects/create"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Create project
        </Link>
      </header>

      <Suspense fallback={<ProjectsLoading />}>
        <ProjectsList />
      </Suspense>
    </main>
  );
}
