'use client';

import type { ProficiencyLevel, Skill } from '@/lib/types/database';
import type { RecommendationFilters } from '@/lib/validations/project';

interface AssignmentFiltersProps {
  skills: Skill[];
  filters: RecommendationFilters;
  onChange: (filters: RecommendationFilters) => void;
}

const PROFICIENCY_OPTIONS: ProficiencyLevel[] = [
  'beginner',
  'intermediate',
  'advanced',
];

function groupSkillsByCategory(skills: Skill[]): Record<string, Skill[]> {
  return skills.reduce<Record<string, Skill[]>>((groups, skill) => {
    const category = skill.category;
    if (!groups[category]) groups[category] = [];
    groups[category].push(skill);
    return groups;
  }, {});
}

export function AssignmentFilters({
  skills,
  filters,
  onChange,
}: AssignmentFiltersProps) {
  const groupedSkills = groupSkillsByCategory(skills);
  const selectedSkillIds = filters.skill_ids ?? [];

  function toggleSkill(skillId: string) {
    const next = selectedSkillIds.includes(skillId)
      ? selectedSkillIds.filter((id) => id !== skillId)
      : [...selectedSkillIds, skillId];

    onChange({
      ...filters,
      skill_ids: next.length > 0 ? next : undefined,
    });
  }

  return (
    <div className="space-y-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <h3 className="text-sm font-semibold text-zinc-900">Filter workers</h3>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label
            htmlFor="filter-availability"
            className="mb-1 block text-xs font-medium text-zinc-600"
          >
            Availability
          </label>
          <select
            id="filter-availability"
            value={filters.availability}
            onChange={(e) =>
              onChange({
                ...filters,
                availability: e.target.value as RecommendationFilters['availability'],
              })
            }
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
          >
            <option value="available">Available only</option>
            <option value="unavailable">Unavailable only</option>
            <option value="all">All</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="filter-proficiency"
            className="mb-1 block text-xs font-medium text-zinc-600"
          >
            Min. proficiency
          </label>
          <select
            id="filter-proficiency"
            value={filters.min_proficiency ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                min_proficiency: e.target.value
                  ? (e.target.value as ProficiencyLevel)
                  : undefined,
              })
            }
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Any</option>
            {PROFICIENCY_OPTIONS.map((level) => (
              <option key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="filter-experience"
            className="mb-1 block text-xs font-medium text-zinc-600"
          >
            Min. experience (years)
          </label>
          <input
            id="filter-experience"
            type="number"
            min={0}
            value={filters.min_experience_years ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                min_experience_years: e.target.value
                  ? Math.max(0, Number(e.target.value))
                  : undefined,
              })
            }
            placeholder="Any"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={() =>
              onChange({
                availability: 'available',
              })
            }
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
          >
            Reset filters
          </button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-zinc-600">Skills</p>
        <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto">
          {Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <div key={category} className="w-full">
              <p className="mb-1 text-xs text-zinc-500">{category}</p>
              <div className="flex flex-wrap gap-2">
                {categorySkills.map((skill) => {
                  const selected = selectedSkillIds.includes(skill.id);
                  return (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => toggleSkill(skill.id)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        selected
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      {skill.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
