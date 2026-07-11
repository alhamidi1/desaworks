'use server';

import { z } from 'zod';
import { randomBytes } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ResidentSkill } from '@/lib/types/database';
import {
  residentProfileSchema,
  residentSkillSchema,
  residentInviteSchema,
  joinRequestSchema,
} from '@/lib/validations/resident';

export type ResidentActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

type ManagerCtx =
  | { ok: true; supabase: Awaited<ReturnType<typeof createClient>>; userId: string }
  | { ok: false; error: string };

async function requireManagerCtx(): Promise<ManagerCtx> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Unauthorized' };
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || (profile.role !== 'manager' && profile.role !== 'admin')) {
    return { ok: false, error: 'Forbidden: manager access required' };
  }
  return { ok: true, supabase, userId: user.id };
}

function generateTempPassword() {
  // URL-safe ~16 chars; satisfies the default Supabase password policy.
  return randomBytes(12).toString('base64url');
}

export interface InviteResidentResult {
  residentId: string;
  loginEmail: string;
  tempPassword: string;
}

/**
 * Manager-invite onboarding: create a real resident login account.
 * Email is optional — when absent a synthetic login is derived from the phone.
 * Returns the login + a one-time temp password for the manager to relay (e.g. via WhatsApp).
 */
export async function inviteResident(input: unknown): Promise<ResidentActionResult<InviteResidentResult>> {
  const auth = await requireManagerCtx();
  if (!auth.ok) return auth;

  const parsed = residentInviteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  const d = parsed.data;

  if (!d.agreed_to_tos || !d.agreed_to_privacy) {
    return { ok: false, error: 'The resident must agree to the Terms of Service and Privacy Policy.' };
  }

  const digits = (d.phone ?? '').replace(/\D/g, '');
  const loginEmail =
    d.email && d.email.trim() ? d.email.trim().toLowerCase() : digits ? `r${digits}@desaworks.local` : null;
  if (!loginEmail) {
    return { ok: false, error: 'Provide an email address or phone number for the resident login.' };
  }

  const tempPassword = generateTempPassword();
  const admin = createAdminClient();

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: loginEmail,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      full_name: d.full_name,
      phone: d.phone ?? null,
      agreed_to_tos: true,
      agreed_to_privacy: true,
    },
  });

  if (createErr || !created.user) {
    return { ok: false, error: createErr?.message ?? 'Could not create the resident account.' };
  }
  const residentId = created.user.id;

  // The handle_new_user trigger creates the profile row; fill the remaining fields.
  await admin
    .from('profiles')
    .update({ address: d.address ?? null, date_of_birth: d.date_of_birth ?? null, bio: d.bio ?? null })
    .eq('id', residentId);

  if (d.skills && d.skills.length) {
    await admin.from('resident_skills').insert(
      d.skills.map((s) => ({
        resident_id: residentId,
        skill_id: s.skill_id,
        experience_years: s.experience_years ?? 0,
        proficiency_level: s.proficiency_level ?? null,
        notes: s.notes ?? null,
      }))
    );
  }

  return { ok: true, data: { residentId, loginEmail, tempPassword } };
}

/** Public "request to join" — no account is created until a manager approves. */
export async function createJoinRequest(input: unknown): Promise<ResidentActionResult<{ id: string }>> {
  const parsed = joinRequestSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  const d = parsed.data;
  if (!d.agreed_to_tos || !d.agreed_to_privacy) {
    return { ok: false, error: 'You must agree to the Terms of Service and Privacy Policy.' };
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('join_requests')
    .insert({
      full_name: d.full_name,
      phone: d.phone ?? null,
      email: d.email || null,
      message: d.message ?? null,
      agreed_to_tos: true,
      agreed_to_privacy: true,
    })
    .select('id')
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: data.id } };
}

export async function listJoinRequests(): Promise<ResidentActionResult<Record<string, unknown>[]>> {
  const auth = await requireManagerCtx();
  if (!auth.ok) return auth;
  const { data, error } = await auth.supabase
    .from('join_requests')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: (data ?? []) as Record<string, unknown>[] };
}

export async function approveJoinRequest(requestId: string): Promise<ResidentActionResult<InviteResidentResult>> {
  const auth = await requireManagerCtx();
  if (!auth.ok) return auth;

  const { data: req, error: reqErr } = await auth.supabase
    .from('join_requests')
    .select('*')
    .eq('id', requestId)
    .single();
  if (reqErr || !req) return { ok: false, error: reqErr?.message ?? 'Request not found' };

  const invite = await inviteResident({
    full_name: req.full_name,
    email: req.email,
    phone: req.phone,
    agreed_to_tos: req.agreed_to_tos,
    agreed_to_privacy: req.agreed_to_privacy,
  });
  if (!invite.ok) return invite;

  await auth.supabase
    .from('join_requests')
    .update({ status: 'approved', reviewed_by: auth.userId, reviewed_at: new Date().toISOString() })
    .eq('id', requestId);

  return invite;
}

export async function rejectJoinRequest(requestId: string): Promise<ResidentActionResult<{ id: string }>> {
  const auth = await requireManagerCtx();
  if (!auth.ok) return auth;
  const { error } = await auth.supabase
    .from('join_requests')
    .update({ status: 'rejected', reviewed_by: auth.userId, reviewed_at: new Date().toISOString() })
    .eq('id', requestId);
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: requestId } };
}

// ============================================================================
// Profile self-service (a resident edits their OWN record; RLS enforces ownership)
// ============================================================================
export async function addSkillsToResident(residentId: string, skills: z.infer<typeof residentSkillSchema>[]) {
  const supabase = await createClient();
  const parsed = z.array(residentSkillSchema).parse(skills);
  const skillIds = parsed.map((s) => s.skill_id);

  const { data: existing, error: e1 } = await supabase
    .from('resident_skills')
    .select('id,skill_id')
    .eq('resident_id', residentId)
    .in('skill_id', skillIds);

  if (e1) throw e1;

  const existingSkillIds = new Set((existing || []).map((r: { skill_id: string }) => r.skill_id));

  const toInsert = parsed
    .filter((s) => !existingSkillIds.has(s.skill_id))
    .map((s) => ({
      resident_id: residentId,
      skill_id: s.skill_id,
      experience_years: s.experience_years ?? 0,
      proficiency_level: s.proficiency_level ?? null,
      notes: s.notes ?? null,
    }));

  let inserted: ResidentSkill[] = [];
  if (toInsert.length) {
    const { data: d2, error: e2 } = await supabase.from('resident_skills').insert(toInsert).select();
    if (e2) throw e2;
    inserted = (d2 || []) as ResidentSkill[];
  }

  return inserted;
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

  const { data: updatedProfile, error: e1 } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', residentId)
    .select()
    .single();

  if (e1) throw e1;

  if (skills && skills.length) {
    const skillIds = skills.map((s) => s.skill_id);

    const { data: existing, error: e2 } = await supabase
      .from('resident_skills')
      .select('id,skill_id')
      .eq('resident_id', residentId)
      .in('skill_id', skillIds);

    if (e2) throw e2;

    const existingMap = new Map((existing || []).map((r: { skill_id: string; id: string }) => [r.skill_id, r.id]));

    const toInsert: Array<Record<string, unknown>> = [];
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
