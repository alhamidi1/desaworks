'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { ProficiencyLevel, Skill } from '@/lib/types/database';

export interface SkillRequirementValue {
  skill_id: string;
  min_proficiency: ProficiencyLevel;
  workers_needed: number;
}

interface SkillRequirementInputProps {
  skills: Skill[];
  value: SkillRequirementValue[];
  onChange: (value: SkillRequirementValue[]) => void;
  disabled?: boolean;
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

export function SkillRequirementInput({
  skills,
  value,
  onChange,
  disabled = false,
}: SkillRequirementInputProps) {
  const { t } = useLanguage();
  const groupedSkills = groupSkillsByCategory(skills);
  const usedSkillIds = new Set(value.map((req) => req.skill_id));

  function addRequirement() {
    const available = skills.find((skill) => !usedSkillIds.has(skill.id));
    if (!available) return;

    onChange([
      ...value,
      {
        skill_id: available.id,
        min_proficiency: 'beginner',
        workers_needed: 1,
      },
    ]);
  }

  function updateRequirement(
    index: number,
    updates: Partial<SkillRequirementValue>
  ) {
    onChange(
      value.map((req, i) => (i === index ? { ...req, ...updates } : req))
    );
  }

  function removeRequirement(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-zinc-800">
          {t('project.requiredSkillsTitle')}
        </label>
        <button
          type="button"
          onClick={addRequirement}
          disabled={disabled || value.length >= skills.length}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t('project.addSkillBtn')}
        </button>
      </div>

      {value.length === 0 && (
        <p className="rounded-md border border-dashed border-zinc-300 p-4 text-sm text-zinc-500">
          {t('project.noRequirementsDesc')}
        </p>
      )}

      {value.map((requirement, index) => {
        const selectableSkills = skills.filter(
          (skill) =>
            skill.id === requirement.skill_id || !usedSkillIds.has(skill.id)
        );

        return (
          <div
            key={`${requirement.skill_id}-${index}`}
            className="grid gap-3 rounded-md border border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-[1fr_auto_auto_auto]"
          >
            <div>
              <label className="mb-1 block text-xs font-semibold text-zinc-600">
                {t('project.skillLabel')}
              </label>
              <select
                value={requirement.skill_id}
                disabled={disabled}
                onChange={(e) =>
                  updateRequirement(index, { skill_id: e.target.value })
                }
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
              >
                {Object.entries(groupedSkills).map(([category, categorySkills]) => (
                  <optgroup key={category} label={category}>
                    {categorySkills
                      .filter((skill) =>
                        selectableSkills.some((s) => s.id === skill.id)
                      )
                      .map((skill) => (
                        <option key={skill.id} value={skill.id}>
                          {skill.name}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-zinc-600">
                {t('project.minProficiencyLabel')}
              </label>
              <select
                value={requirement.min_proficiency}
                disabled={disabled}
                onChange={(e) =>
                  updateRequirement(index, {
                    min_proficiency: e.target.value as ProficiencyLevel,
                  })
                }
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
              >
                {PROFICIENCY_OPTIONS.map((level) => (
                  <option key={level} value={level}>
                    {t('proficiency.' + level)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-zinc-600">
                {t('project.workersCountLabel')}
              </label>
              <input
                type="number"
                min={1}
                value={requirement.workers_needed}
                disabled={disabled}
                onChange={(e) =>
                  updateRequirement(index, {
                    workers_needed: Math.max(1, Number(e.target.value) || 1),
                  })
                }
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => removeRequirement(index)}
                disabled={disabled}
                className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
