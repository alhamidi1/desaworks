import { z } from 'zod';
import type { ProjectStatus } from '@/lib/types/database';

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
export const uuidSchema = z.string().regex(uuidRegex, 'Invalid UUID');

export const proficiencyLevelSchema = z.enum([
  'beginner',
  'intermediate',
  'advanced',
]);

export const skillRequirementSchema = z.object({
  skill_id: uuidSchema,
  min_proficiency: proficiencyLevelSchema.default('beginner'),
  workers_needed: z.number().int().min(1).default(1),
});

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

function validateDateRange(
  data: { start_date?: string; end_date?: string },
  ctx: z.RefinementCtx
) {
  if (data.start_date && data.end_date) {
    if (new Date(data.end_date) < new Date(data.start_date)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'end_date must be on or after start_date',
        path: ['end_date'],
      });
    }
  }
}

export const createProjectSchema = z
  .object({
    name: z.string().trim().min(1, 'Project name is required').max(200),
    description: z.string().max(2000).optional(),
    start_date: dateStringSchema.optional(),
    end_date: dateStringSchema.optional(),
    budget: z.number().min(0).optional(),
    workers_needed: z.number().int().min(1).optional(),
    skill_requirements: z
      .array(skillRequirementSchema)
      .min(1, 'At least one skill requirement is required'),
  })
  .superRefine(validateDateRange);

export const updateProjectSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    start_date: dateStringSchema.optional(),
    end_date: dateStringSchema.optional(),
    budget: z.number().min(0).optional(),
    workers_needed: z.number().int().min(1).optional(),
    skill_requirements: z.array(skillRequirementSchema).min(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.start_date !== undefined || data.end_date !== undefined) {
      validateDateRange(
        { start_date: data.start_date, end_date: data.end_date },
        ctx
      );
    }
  });

const projectStatusSchema = z.enum([
  'draft',
  'open',
  'in_progress',
  'completed',
  'cancelled',
]);

const ALLOWED_STATUS_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  draft: ['open', 'cancelled'],
  open: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export function isValidStatusTransition(
  from: ProjectStatus,
  to: ProjectStatus
): boolean {
  if (from === to) return true;
  return ALLOWED_STATUS_TRANSITIONS[from].includes(to);
}

export const updateProjectStatusSchema = z.object({
  project_id: uuidSchema,
  status: projectStatusSchema,
});

export const confirmAssignmentsSchema = z.object({
  project_id: uuidSchema,
  resident_ids: z
    .array(uuidSchema)
    .min(1, 'At least one worker must be selected'),
  override_conflicts: z.boolean().optional().default(false),
});

export const voidAssignmentSchema = z.object({
  assignment_id: uuidSchema,
});

export const listProjectsFilterSchema = z.object({
  status: projectStatusSchema.optional(),
});

export const recommendationFiltersSchema = z.object({
  skill_ids: z.array(uuidSchema).optional(),
  availability: z.enum(['available', 'unavailable', 'all']).default('available'),
  min_proficiency: proficiencyLevelSchema.optional(),
  min_experience_years: z.number().int().min(0).optional(),
});

export type CreateProjectFormData = z.infer<typeof createProjectSchema>;
export type UpdateProjectFormData = z.infer<typeof updateProjectSchema>;
export type UpdateProjectStatusInput = z.infer<typeof updateProjectStatusSchema>;
export type ConfirmAssignmentsInput = z.infer<typeof confirmAssignmentsSchema>;
export type VoidAssignmentInput = z.infer<typeof voidAssignmentSchema>;
export type ListProjectsFilter = z.infer<typeof listProjectsFilterSchema>;
export type RecommendationFilters = z.infer<typeof recommendationFiltersSchema>;
