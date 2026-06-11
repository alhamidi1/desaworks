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

export type ResidentProfileInput = z.infer<typeof residentProfileSchema>;
export type ResidentSkillInput = z.infer<typeof residentSkillSchema>;
