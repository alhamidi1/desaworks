"use client";

import React, { useEffect, useState } from 'react';
import SkillSelector from './SkillSelector';
import type { Skill as DBSkill } from '@/lib/types/database';

type SelectedSkill = {
  skill_id: string;
  name: string;
  experience_years?: number;
  proficiency_level?: 'beginner' | 'intermediate' | 'advanced' | null;
  notes?: string | null;
};

export default function RegistrationForm({ residentId }: { residentId?: string | null }) {
  const [skills, setSkills] = useState<DBSkill[]>([]);
  const [selected, setSelected] = useState<SelectedSkill[]>([]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/skills')
      .then((r) => r.json())
      .then((data) => setSkills(data || []));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        full_name: fullName,
        email,
        phone,
        address,
        agreed_to_tos: true,
        agreed_to_privacy: true,
        skills: selected.map((s) => ({ skill_id: s.skill_id, experience_years: s.experience_years, proficiency_level: s.proficiency_level, notes: s.notes })),
      };

      const url = residentId ? `/api/residents/${residentId}/update` : '/api/residents/register';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        alert('Error: ' + err);
        return;
      }

      alert('Profile saved');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Full name</label>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border rounded px-2 py-1" />
      </div>

      <div>
        <label className="block text-sm font-medium">Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded px-2 py-1" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium">Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm font-medium">Address</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border rounded px-2 py-1" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Skills</label>
        <SkillSelector availableSkills={skills} value={selected} onChange={setSelected} />
      </div>

      <div>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
}
