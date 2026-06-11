import Link from 'next/link';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { CreateProjectPanel } from '@/components/projects/CreateProjectPanel';
import type { Skill } from '@/lib/types/database';

function CreateProjectLoading() {
  return (
    <div className="space-y-4">
      <div className="h-64 animate-pulse rounded-lg border border-zinc-200 bg-zinc-100" />
      <p className="text-sm text-zinc-500">Loading form...</p>
    </div>
  );
}

function CreateProjectError({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <p className="font-medium text-red-800">Failed to load create form</p>
      <p className="mt-1 text-sm text-red-600">{message}</p>
    </div>
  );
}

async function fetchSkills(): Promise<
  { skills: Skill[] } | { error: string }
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('category')
    .order('name');

  if (error) {
    return { error: error.message };
  }

  return { skills: (data ?? []) as Skill[] };
}

async function CreateProjectContent() {
  const result = await fetchSkills();

  if ('error' in result) {
    return <CreateProjectError message={result.error} />;
  }

  return <CreateProjectPanel skills={result.skills} />;
}

export default function CreateProjectPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <header className="mb-6">
        <Link
          href="/projects"
          className="text-sm text-zinc-600 hover:text-zinc-900"
        >
          ← Back to projects
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
          Create project
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Define project details and required skills
        </p>
      </header>

      <Suspense fallback={<CreateProjectLoading />}>
        <CreateProjectContent />
      </Suspense>
    </main>
  );
}
