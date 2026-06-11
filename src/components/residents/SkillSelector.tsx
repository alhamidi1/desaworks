"use client";

import React, { useMemo, useState } from 'react';
import type { Skill } from '@/lib/types/database';

type SelectedSkill = {
  skill_id: string;
  name: string;
  experience_years?: number;
  proficiency_level?: 'beginner' | 'intermediate' | 'advanced' | null;
  notes?: string | null;
};

export default function SkillSelector({
  availableSkills,
  value,
  onChange,
}: {
  availableSkills: Skill[];
  value: SelectedSkill[];
  onChange: (v: SelectedSkill[]) => void;
}) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return availableSkills;
    return availableSkills.filter((s) => s.name.toLowerCase().includes(q) || (s.category || '').toLowerCase().includes(q));
  }, [availableSkills, query]);

  function addSkill(s: Skill) {
    if (value.find((v) => v.skill_id === s.id)) return;
    onChange([...value, { skill_id: s.id, name: s.name, experience_years: 0, proficiency_level: null, notes: null }]);
  }

  function removeSkill(id: string) {
    onChange(value.filter((v) => v.skill_id !== id));
  }

  function updateSkill(id: string, patch: Partial<SelectedSkill>) {
    onChange(value.map((v) => (v.skill_id === id ? { ...v, ...patch } : v)));
  }

  return (
    <div className="space-y-3">
      <div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search skills..."
          className="w-full border rounded px-2 py-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto border rounded p-2">
        {filtered.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => addSkill(s)}
            className="text-left p-2 hover:bg-gray-100 rounded"
          >
            <div className="font-medium">{s.name}</div>
            <div className="text-sm text-gray-500">{s.category}</div>
          </button>
        ))}
      </div>

      <div>
        {value.map((sel) => (
          <div key={sel.skill_id} className="border rounded p-2 mb-2">
            <div className="flex justify-between items-center">
              <div className="font-medium">{sel.name}</div>
              <button type="button" onClick={() => removeSkill(sel.skill_id)} className="text-red-600">
                Remove
              </button>
            </div>

            <div className="mt-2 grid grid-cols-3 gap-2">
              <input
                type="number"
                min={0}
                value={sel.experience_years ?? 0}
                onChange={(e) => updateSkill(sel.skill_id, { experience_years: Number(e.target.value) })}
                className="border rounded px-2 py-1"
                placeholder="Years"
              />

              <select
                value={sel.proficiency_level ?? ''}
                onChange={(e) => updateSkill(sel.skill_id, { proficiency_level: (e.target.value as any) || null })}
                className="border rounded px-2 py-1"
              >
                <option value="">Proficiency</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>

              <input
                value={sel.notes ?? ''}
                onChange={(e) => updateSkill(sel.skill_id, { notes: e.target.value })}
                placeholder="Notes"
                className="border rounded px-2 py-1"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
