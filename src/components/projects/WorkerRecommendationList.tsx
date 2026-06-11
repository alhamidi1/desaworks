'use client';

import { useMemo, useState } from 'react';
import { meetsProficiency } from '@/lib/queries/proficiency';
import type { RecommendedWorker } from '@/lib/queries/recommendations';
import type { Skill } from '@/lib/types/database';
import type { RecommendationFilters } from '@/lib/validations/project';
import { AssignmentFilters } from './AssignmentFilters';
import { WorkerCard } from './WorkerCard';

interface WorkerRecommendationListProps {
  workers: RecommendedWorker[];
  skills: Skill[];
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  totalRequirements?: number;
  maxSelectable?: number;
}

function applyClientFilters(
  workers: RecommendedWorker[],
  filters: RecommendationFilters
): RecommendedWorker[] {
  return workers.filter((worker) => {
    if (
      filters.availability !== 'all' &&
      worker.profile.availability !== filters.availability
    ) {
      return false;
    }

    if (filters.skill_ids && filters.skill_ids.length > 0) {
      const hasSkill = worker.skills.some((rs) =>
        filters.skill_ids!.includes(rs.skill_id)
      );
      if (!hasSkill) return false;
    }

    if (filters.min_experience_years !== undefined) {
      if (worker.total_experience_years < filters.min_experience_years) {
        return false;
      }
    }

    if (filters.min_proficiency !== undefined) {
      const hasProficiency = worker.skills.some((rs) =>
        meetsProficiency(rs.proficiency_level, filters.min_proficiency!)
      );
      if (!hasProficiency) return false;
    }

    return true;
  });
}

export function WorkerRecommendationList({
  workers,
  skills,
  selectedIds,
  onSelectionChange,
  totalRequirements,
  maxSelectable,
}: WorkerRecommendationListProps) {
  const [filters, setFilters] = useState<RecommendationFilters>({
    availability: 'available',
  });

  const filteredWorkers = useMemo(
    () => applyClientFilters(workers, filters),
    [workers, filters]
  );

  function handleSelect(residentId: string, selected: boolean) {
    if (selected) {
      if (maxSelectable !== undefined && selectedIds.length >= maxSelectable) {
        return;
      }
      onSelectionChange([...selectedIds, residentId]);
      return;
    }

    onSelectionChange(selectedIds.filter((id) => id !== residentId));
  }

  return (
    <div className="space-y-4">
      <AssignmentFilters
        skills={skills}
        filters={filters}
        onChange={setFilters}
      />

      <div className="flex items-center justify-between text-sm text-zinc-600">
        <p>
          Showing {filteredWorkers.length} of {workers.length} recommended
          workers
        </p>
        {maxSelectable !== undefined && (
          <p>
            Selected {selectedIds.length}/{maxSelectable}
          </p>
        )}
      </div>

      {filteredWorkers.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
          No workers match the current filters.
        </p>
      ) : (
        <ul className="space-y-3">
          {filteredWorkers.map((worker) => (
            <li key={worker.profile.id}>
              <WorkerCard
                worker={worker}
                selected={selectedIds.includes(worker.profile.id)}
                onSelect={handleSelect}
                totalRequirements={totalRequirements}
                disabled={
                  maxSelectable !== undefined &&
                  !selectedIds.includes(worker.profile.id) &&
                  selectedIds.length >= maxSelectable
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
