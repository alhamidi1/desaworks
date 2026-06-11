'use client';

import { useState } from 'react';
import {
  createProjectSchema,
  updateProjectSchema,
  type CreateProjectFormData,
  type UpdateProjectFormData,
} from '@/lib/validations/project';
import type { Skill } from '@/lib/types/database';
import {
  SkillRequirementInput,
  type SkillRequirementValue,
} from './SkillRequirementInput';

interface ProjectFormProps {
  skills: Skill[];
  mode?: 'create' | 'edit';
  initialData?: Partial<CreateProjectFormData>;
  onSubmit: (data: CreateProjectFormData | UpdateProjectFormData) => Promise<void>;
  isSubmitting?: boolean;
}

const defaultFormState = {
  name: '',
  description: '',
  start_date: '',
  end_date: '',
  budget: '',
  workers_needed: '1',
  skill_requirements: [] as SkillRequirementValue[],
};

export function ProjectForm({
  skills,
  mode = 'create',
  initialData,
  onSubmit,
  isSubmitting = false,
}: ProjectFormProps) {
  const [form, setForm] = useState({
    name: initialData?.name ?? defaultFormState.name,
    description: initialData?.description ?? defaultFormState.description,
    start_date: initialData?.start_date ?? defaultFormState.start_date,
    end_date: initialData?.end_date ?? defaultFormState.end_date,
    budget:
      initialData?.budget !== undefined
        ? String(initialData.budget)
        : defaultFormState.budget,
    workers_needed:
      initialData?.workers_needed !== undefined
        ? String(initialData.workers_needed)
        : defaultFormState.workers_needed,
    skill_requirements:
      initialData?.skill_requirements ?? defaultFormState.skill_requirements,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function updateField<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      delete next.form;
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      name: form.name,
      description: form.description || undefined,
      start_date: form.start_date || undefined,
      end_date: form.end_date || undefined,
      budget: form.budget ? Number(form.budget) : undefined,
      workers_needed: form.workers_needed
        ? Number(form.workers_needed)
        : undefined,
      skill_requirements: form.skill_requirements,
    };

    const schema = mode === 'create' ? createProjectSchema : updateProjectSchema;
    const parsed = schema.safeParse(payload);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join('.') || 'form';
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    await onSubmit(parsed.data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4 rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-zinc-900">
          {mode === 'create' ? 'Create project' : 'Edit project'}
        </h2>

        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-zinc-700">
            Project name *
          </label>
          <input
            id="name"
            type="text"
            value={form.name}
            disabled={isSubmitting}
            onChange={(e) => updateField('name', e.target.value)}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
            placeholder="e.g. Village irrigation repair"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-1 block text-sm font-medium text-zinc-700"
          >
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={form.description}
            disabled={isSubmitting}
            onChange={(e) => updateField('description', e.target.value)}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
            placeholder="Describe the project goals and scope"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="start_date"
              className="mb-1 block text-sm font-medium text-zinc-700"
            >
              Start date
            </label>
            <input
              id="start_date"
              type="date"
              value={form.start_date}
              disabled={isSubmitting}
              onChange={(e) => updateField('start_date', e.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
            />
            {errors.start_date && (
              <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="end_date"
              className="mb-1 block text-sm font-medium text-zinc-700"
            >
              End date
            </label>
            <input
              id="end_date"
              type="date"
              value={form.end_date}
              disabled={isSubmitting}
              onChange={(e) => updateField('end_date', e.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
            />
            {errors.end_date && (
              <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="workers_needed"
              className="mb-1 block text-sm font-medium text-zinc-700"
            >
              Total workers needed
            </label>
            <input
              id="workers_needed"
              type="number"
              min={1}
              value={form.workers_needed}
              disabled={isSubmitting}
              onChange={(e) => updateField('workers_needed', e.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
            />
            {errors.workers_needed && (
              <p className="mt-1 text-sm text-red-600">{errors.workers_needed}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="budget"
              className="mb-1 block text-sm font-medium text-zinc-700"
            >
              Budget estimate (IDR)
            </label>
            <input
              id="budget"
              type="number"
              min={0}
              value={form.budget}
              disabled={isSubmitting}
              onChange={(e) => updateField('budget', e.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
            />
            {errors.budget && (
              <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-5">
        <SkillRequirementInput
          skills={skills}
          value={form.skill_requirements}
          onChange={(skill_requirements) =>
            updateField('skill_requirements', skill_requirements)
          }
          disabled={isSubmitting}
        />
        {errors.skill_requirements && (
          <p className="mt-2 text-sm text-red-600">{errors.skill_requirements}</p>
        )}
      </div>

      {errors.form && (
        <p className="text-sm text-red-600">{errors.form}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting
          ? 'Saving...'
          : mode === 'create'
            ? 'Create project'
            : 'Save changes'}
      </button>
    </form>
  );
}
