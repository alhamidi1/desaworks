import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import type { ResidentSkill } from '@/lib/types/database';
import { residentProfileSchema, residentSkillSchema } from '@/lib/validations/resident';

export async function createProfile(input: z.infer<typeof residentProfileSchema>) {
  const supabase = await createClient();
  const parsed = residentProfileSchema.parse(input);

  const { skills, ...profileData } = parsed;

  const { data, error } = await supabase.from('profiles').insert([profileData]).select().single();
  if (error) throw error;

  const residentId: string = data.id;

  if (skills && skills.length) {
    const skillRows = skills.map((s) => ({
      resident_id: residentId,
      skill_id: s.skill_id,
      experience_years: s.experience_years ?? 0,
      proficiency_level: s.proficiency_level ?? null,
      notes: s.notes ?? null,
    }));

    const { error: e2 } = await supabase.from('resident_skills').insert(skillRows);
    if (e2) throw e2;
  }

  return data;
}

export async function addSkillsToResident(residentId: string, skills: z.infer<typeof residentSkillSchema>[]) {
  const supabase = await createClient();
  const parsed = z.array(residentSkillSchema).parse(skills);
  // Prevent inserting duplicate skills for the same resident.
  const skillIds = parsed.map((s) => s.skill_id);

  const { data: existing, error: e1 } = await supabase
    .from('resident_skills')
    .select('id,skill_id')
    .eq('resident_id', residentId)
    .in('skill_id', skillIds);

  if (e1) throw e1;

  const existingSkillIds = new Set((existing || []).map((r: any) => r.skill_id));

  const toInsert = parsed
    .filter((s) => !existingSkillIds.has(s.skill_id))
    .map((s) => ({
      resident_id: residentId,
      skill_id: s.skill_id,
      experience_years: s.experience_years ?? 0,
      proficiency_level: s.proficiency_level ?? null,
      notes: s.notes ?? null,
    }));

  let inserted: any[] = [];
  if (toInsert.length) {
    const { data: d2, error: e2 } = await supabase.from('resident_skills').insert(toInsert).select();
    if (e2) throw e2;
    inserted = d2 || [];
  }

  // Return newly inserted rows (existing ones are not re-inserted)
  return inserted as ResidentSkill[];
}

export async function toggleAvailability(residentId: string, availability: 'available' | 'unavailable') {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .update({ availability })
    .eq('id', residentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getResidentWithSkills(residentId: string) {
  const supabase = await createClient();

  // Select profile with nested resident_skills and skill details
  const { data, error } = await supabase
    .from('profiles')
    .select(
      `*, resident_skills(id,resident_id,skill_id,experience_years,proficiency_level,notes,created_at, skill:skills(id,name,category,description,created_at))`
    )
    .eq('id', residentId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(residentId: string, input: z.infer<typeof residentProfileSchema>) {
  const supabase = await createClient();
  const parsed = residentProfileSchema.parse(input);

  const { skills, ...profileData } = parsed;

  // Update profile fields
  const { data: updatedProfile, error: e1 } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', residentId)
    .select()
    .single();

  if (e1) throw e1;

  // If skills provided, upsert behavior: update existing rows, insert new ones, skip duplicates
  if (skills && skills.length) {
    const skillIds = skills.map((s) => s.skill_id);

    const { data: existing, error: e2 } = await supabase
      .from('resident_skills')
      .select('id,skill_id')
      .eq('resident_id', residentId)
      .in('skill_id', skillIds);

    if (e2) throw e2;

    const existingMap = new Map((existing || []).map((r: any) => [r.skill_id, r.id]));

    const toInsert = [] as any[];
    for (const s of skills) {
      const existingId = existingMap.get(s.skill_id);
      if (existingId) {
        const { error: ue } = await supabase
          .from('resident_skills')
          .update({
            experience_years: s.experience_years ?? 0,
            proficiency_level: s.proficiency_level ?? null,
            notes: s.notes ?? null,
          })
          .eq('id', existingId);
        if (ue) throw ue;
      } else {
        toInsert.push({
          resident_id: residentId,
          skill_id: s.skill_id,
          experience_years: s.experience_years ?? 0,
          proficiency_level: s.proficiency_level ?? null,
          notes: s.notes ?? null,
        });
      }
    }

    if (toInsert.length) {
      const { error: e3 } = await supabase.from('resident_skills').insert(toInsert);
      if (e3) throw e3;
    }
  }

  return updatedProfile;
}
