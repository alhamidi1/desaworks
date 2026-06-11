'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProject } from '@/lib/actions/projects';
import type { Skill } from '@/lib/types/database';
import type {
  CreateProjectFormData,
  UpdateProjectFormData,
} from '@/lib/validations/project';
import { ProjectForm } from './ProjectForm';

interface CreateProjectPanelProps {
  skills: Skill[];
}

export function CreateProjectPanel({ skills }: CreateProjectPanelProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(
    data: CreateProjectFormData | UpdateProjectFormData
  ) {
    setIsSubmitting(true);
    setError(null);

    const result = await createProject(data as CreateProjectFormData);

    if (result.success) {
      router.push(`/projects/${result.data.id}`);
      return;
    }

    setError(result.error);
    setIsSubmitting(false);
  }

  if (skills.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
        No skills available. Seed the database with skill categories before
        creating a project.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <ProjectForm
        skills={skills}
        mode="create"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
