'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { confirmAssignments } from '@/lib/actions/projects';
import type { RecommendedWorker } from '@/lib/queries/recommendations';
import type { Skill } from '@/lib/types/database';
import { WorkerRecommendationList } from './WorkerRecommendationList';

interface AssignWorkersPanelProps {
  projectId: string;
  projectName: string;
  workersNeeded: number;
  totalRequirements: number;
  workers: RecommendedWorker[];
  skills: Skill[];
}

export function AssignWorkersPanel({
  projectId,
  projectName,
  workersNeeded,
  totalRequirements,
  workers,
  skills,
}: AssignWorkersPanelProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [overrideConflicts, setOverrideConflicts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedWithConflicts = workers.filter(
    (w) =>
      selectedIds.includes(w.profile.id) && w.has_scheduling_conflict
  );

  async function handleConfirm() {
    if (selectedIds.length === 0) {
      setError('Select at least one worker to assign.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const result = await confirmAssignments({
      project_id: projectId,
      resident_ids: selectedIds,
      override_conflicts: overrideConflicts,
    });

    if (result.success) {
      setSuccess(
        `Assigned ${result.data.assignments.length} worker(s) to "${projectName}".`
      );
      setTimeout(() => router.push(`/projects/${projectId}`), 1500);
      return;
    }

    setError(result.error);
    setIsSubmitting(false);
  }

  if (workers.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
        No matching workers found for this project&apos;s requirements. Try
        adjusting skill requirements or check resident registrations.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {success}
        </p>
      )}

      <WorkerRecommendationList
        workers={workers}
        skills={skills}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        totalRequirements={totalRequirements}
        maxSelectable={workersNeeded}
      />

      {selectedWithConflicts.length > 0 && (
        <label className="flex items-center gap-2 text-sm text-amber-800">
          <input
            type="checkbox"
            checked={overrideConflicts}
            onChange={(e) => setOverrideConflicts(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300"
          />
          Override scheduling conflicts for {selectedWithConflicts.length}{' '}
          selected worker(s)
        </label>
      )}

      <button
        type="button"
        onClick={handleConfirm}
        disabled={isSubmitting || selectedIds.length === 0}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? 'Confirming...' : 'Confirm assignments'}
      </button>
    </div>
  );
}
