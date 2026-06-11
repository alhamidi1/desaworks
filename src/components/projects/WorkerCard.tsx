'use client';

import type { RecommendedWorker } from '@/lib/queries/recommendations';
import { ConflictWarning } from './ConflictWarning';

interface WorkerCardProps {
  worker: RecommendedWorker;
  selected: boolean;
  onSelect: (residentId: string, selected: boolean) => void;
  totalRequirements?: number;
  disabled?: boolean;
}

function formatProficiency(level: string | null): string {
  if (!level) return 'Not set';
  return level.charAt(0).toUpperCase() + level.slice(1);
}

export function WorkerCard({
  worker,
  selected,
  onSelect,
  totalRequirements,
  disabled = false,
}: WorkerCardProps) {
  const { profile, matched_skills, match_score, total_experience_years } =
    worker;

  const matchLabel =
    totalRequirements !== undefined
      ? `${match_score}/${totalRequirements} skills`
      : `${match_score} skills matched`;

  return (
    <article
      className={`rounded-lg border p-4 transition-colors ${
        selected
          ? 'border-blue-500 bg-blue-50/50'
          : 'border-zinc-200 bg-white hover:border-zinc-300'
      } ${worker.has_scheduling_conflict ? 'ring-1 ring-amber-300' : ''}`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          disabled={disabled}
          onChange={(e) => onSelect(profile.id, e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-zinc-300"
          aria-label={`Select ${profile.full_name}`}
        />

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-zinc-900">{profile.full_name}</h4>
              <p className="text-sm text-zinc-600">{profile.email}</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-medium text-blue-700">{matchLabel}</p>
              <p className="text-zinc-500">
                {total_experience_years} yrs experience
              </p>
              <span
                className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                  profile.availability === 'available'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-zinc-100 text-zinc-600'
                }`}
              >
                {profile.availability}
              </span>
            </div>
          </div>

          {matched_skills.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium text-zinc-600">
                Matching skills
              </p>
              <ul className="flex flex-wrap gap-2">
                {matched_skills.map((rs) => (
                  <li
                    key={rs.id}
                    className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-700"
                  >
                    {rs.skill.name} ({formatProficiency(rs.proficiency_level)},{' '}
                    {rs.experience_years} yrs)
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ConflictWarning conflicts={worker.scheduling_conflicts} />
        </div>
      </div>
    </article>
  );
}
