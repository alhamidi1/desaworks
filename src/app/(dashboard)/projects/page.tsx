import { Suspense } from 'react';
import { listProjects } from '@/lib/actions/projects';
import { ProjectsPageClient } from './client-wrapper';

async function ProjectsList() {
  const result = await listProjects();

  if (!result.success) {
    return <ProjectsPageClient projects={[]} error={result.error} />;
  }

  return <ProjectsPageClient projects={result.data} />;
}

function ProjectsLoading() {
  return (
    <div className="space-y-4 animate-fade-in">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-40 rounded-2xl border border-[#e9ecef] animate-shimmer"
        />
      ))}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<ProjectsLoading />}>
      <ProjectsList />
    </Suspense>
  );
}
