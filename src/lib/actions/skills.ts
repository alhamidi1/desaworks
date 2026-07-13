'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const skillSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional().nullable(),
});

type SkillActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function requireManager() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Unauthorized' };
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
    
  if (!profile || (profile.role !== 'manager' && profile.role !== 'admin')) {
    return { ok: false, error: 'Forbidden: manager access required' };
  }
  return { ok: true, supabase };
}

export async function createSkill(input: unknown): Promise<SkillActionResult<any>> {
  const auth = await requireManager();
  if (!auth.ok) return { ok: false, error: auth.error! };
  
  const parsed = skillSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }
  
  const { data, error } = await auth.supabase!
    .from('skills')
    .insert(parsed.data)
    .select()
    .single();
    
  if (error) {
    if (error.code === '23505') {
      return { ok: false, error: 'A skill with this name already exists.' };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true, data };
}

export async function updateSkill(id: string, input: unknown): Promise<SkillActionResult<any>> {
  const auth = await requireManager();
  if (!auth.ok) return { ok: false, error: auth.error! };
  
  const parsed = skillSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }
  
  const { data, error } = await auth.supabase!
    .from('skills')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    if (error.code === '23505') {
      return { ok: false, error: 'A skill with this name already exists.' };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true, data };
}

export async function deleteSkill(id: string): Promise<SkillActionResult<void>> {
  const auth = await requireManager();
  if (!auth.ok) return { ok: false, error: auth.error! };
  
  // First, check if this skill is referenced in resident_skills
  const { count: resCount, error: resErr } = await auth.supabase!
    .from('resident_skills')
    .select('*', { count: 'exact', head: true })
    .eq('skill_id', id);
    
  if (resErr) return { ok: false, error: resErr.message };
  if (resCount && resCount > 0) {
    return { ok: false, error: 'Cannot delete: This skill is currently associated with residents.' };
  }
  
  // Next, check if this skill is referenced in project_skill_requirements
  const { count: reqCount, error: reqErr } = await auth.supabase!
    .from('project_skill_requirements')
    .select('*', { count: 'exact', head: true })
    .eq('skill_id', id);
    
  if (reqErr) return { ok: false, error: reqErr.message };
  if (reqCount && reqCount > 0) {
    return { ok: false, error: 'Cannot delete: This skill is currently required by projects.' };
  }
  
  const { error } = await auth.supabase!
    .from('skills')
    .delete()
    .eq('id', id);
    
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: undefined };
}
