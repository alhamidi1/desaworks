import { z } from 'zod';

export const proficiencyEnum = z.enum(['beginner', 'intermediate', 'advanced']);

export const residentSkillSchema = z.object({
  skill_id: z.string().min(1),
  experience_years: z.number().min(0).max(100).optional().default(0),
  proficiency_level: proficiencyEnum.optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const residentProfileSchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  date_of_birth: z.string().nullable().optional(),
  role: z.enum(['resident', 'manager', 'admin']).optional().default('resident'),
  bio: z.string().nullable().optional(),
  agreed_to_tos: z.boolean(),
  agreed_to_privacy: z.boolean(),
  skills: z.array(residentSkillSchema).optional(),
});

// Manager-invite: create a resident account. Email is optional (a synthetic login
// is derived from the phone when absent); consent must be explicitly true.
export const residentInviteSchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email().or(z.literal('')).nullable().optional(),
  phone: z.string().min(3).nullable().optional(),
  address: z.string().nullable().optional(),
  date_of_birth: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  agreed_to_tos: z.boolean(),
  agreed_to_privacy: z.boolean(),
  skills: z.array(residentSkillSchema).optional(),
});

// Public "request to join" — captures consent up front; a manager approves it later.
export const joinRequestSchema = z.object({
  full_name: z.string().min(1),
  phone: z.string().min(3).nullable().optional(),
  email: z.string().email().or(z.literal('')).nullable().optional(),
  message: z.string().max(500).nullable().optional(),
  agreed_to_tos: z.boolean(),
  agreed_to_privacy: z.boolean(),
});

export type ResidentProfileInput = z.infer<typeof residentProfileSchema>;
export type ResidentSkillInput = z.infer<typeof residentSkillSchema>;
export type ResidentInviteInput = z.infer<typeof residentInviteSchema>;
export type JoinRequestInput = z.infer<typeof joinRequestSchema>;
