"use client";

import React, { useMemo, useState } from 'react';
import type { Skill } from '@/lib/types/database';

type SelectedSkill = {
  skill_id: string;
  name: string;
  category?: string;
  experience_years?: number;
  proficiency_level?: 'beginner' | 'intermediate' | 'advanced' | null;
  notes?: string | null;
};

const PROFICIENCY_LABELS = {
  beginner: 'Pemula',
  intermediate: 'Menengah',
  advanced: 'Mahir',
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
  const [isOpen, setIsOpen] = useState(false);

  const selectedIds = new Set(value.map((v) => v.skill_id));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return availableSkills;
    return availableSkills.filter(
      (s) => s.name.toLowerCase().includes(q) || (s.category || '').toLowerCase().includes(q)
    );
  }, [availableSkills, query]);

  const unselectedFiltered = filtered.filter((s) => !selectedIds.has(s.id));

  function addSkill(s: Skill) {
    if (selectedIds.has(s.id)) return;
    onChange([...value, { skill_id: s.id, name: s.name, category: s.category ?? '', experience_years: 0, proficiency_level: null, notes: null }]);
    setQuery('');
    setIsOpen(false);
  }

  function removeSkill(id: string) {
    onChange(value.filter((v) => v.skill_id !== id));
  }

  function updateSkill(id: string, patch: Partial<SelectedSkill>) {
    onChange(value.map((v) => (v.skill_id === id ? { ...v, ...patch } : v)));
  }

  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 text-[#adb5bd]">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          placeholder="Cari keahlian (mis: pertanian, kayu...)"
          className="w-full rounded-xl border border-[#e9ecef] bg-white pl-9 pr-4 py-3 text-sm text-[#1a1d23] placeholder:text-[#adb5bd] focus:border-[#05c8ae] focus:outline-none focus:ring-2 focus:ring-[#05c8ae]/20 transition-colors"
        />
        {isOpen && unselectedFiltered.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-52 overflow-y-auto rounded-xl border border-[#e9ecef] bg-white shadow-lg">
            {unselectedFiltered.map((s) => (
              <button
                key={s.id}
                type="button"
                onMouseDown={() => addSkill(s)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#effefb] transition-colors"
              >
                <span className="h-7 w-7 rounded-lg bg-[#05c8ae]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-[#05c8ae]">{s.name.charAt(0)}</span>
                </span>
                <div>
                  <p className="text-sm font-medium text-[#1a1d23]">{s.name}</p>
                  <p className="text-xs text-[#adb5bd]">{s.category}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected skills */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((sel) => (
            <div key={sel.skill_id} className="rounded-xl border border-[#e9ecef] bg-[#f8f9fa] p-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="h-7 w-7 rounded-lg bg-[#05c8ae]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-[#05c8ae]">{sel.name.charAt(0)}</span>
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#1a1d23]">{sel.name}</p>
                    {sel.category && <p className="text-xs text-[#adb5bd]">{sel.category}</p>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeSkill(sel.skill_id)}
                  className="rounded-lg p-1.5 text-[#adb5bd] hover:bg-red-50 hover:text-red-500 transition-colors"
                  aria-label="Hapus keahlian"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#adb5bd] mb-1">Tahun Pengalaman</label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={sel.experience_years ?? 0}
                    onChange={(e) => updateSkill(sel.skill_id, { experience_years: Number(e.target.value) })}
                    className="w-full rounded-lg border border-[#e9ecef] bg-white px-3 py-2 text-sm text-[#1a1d23] focus:border-[#05c8ae] focus:outline-none focus:ring-2 focus:ring-[#05c8ae]/20 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#adb5bd] mb-1">Tingkat</label>
                  <select
                    value={sel.proficiency_level ?? ''}
                    onChange={(e) => updateSkill(sel.skill_id, { proficiency_level: (e.target.value as any) || null })}
                    className="w-full rounded-lg border border-[#e9ecef] bg-white px-3 py-2 text-sm text-[#1a1d23] focus:border-[#05c8ae] focus:outline-none focus:ring-2 focus:ring-[#05c8ae]/20 transition-colors"
                  >
                    <option value="">Pilih tingkat</option>
                    {Object.entries(PROFICIENCY_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {value.length === 0 && (
        <p className="text-xs text-[#adb5bd] text-center py-2">Belum ada keahlian dipilih. Cari dan tambahkan di atas.</p>
      )}
    </div>
  );
}
