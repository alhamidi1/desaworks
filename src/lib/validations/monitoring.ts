import { z } from 'zod';

export const progressStatusValues = ['not_started', 'in_progress', 'completed'] as const;
export const revenueDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export const progressStatusSchema = z.enum(progressStatusValues);

const uuidSchema = z.string().regex(
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
  'Must be a valid UUID'
);
const requiredTextSchema = z.string().trim().min(1, 'This field is required');
const percentageSchema = z.number().int('Progress must be a whole number').min(0).max(100);
const hoursWorkedSchema = z.number().min(0, 'Hours worked cannot be negative');
const amountSchema = z.number().positive('Amount must be greater than zero');

export const progressUpdateSchema = z.object({
  assignmentId: uuidSchema,
  progressPercentage: percentageSchema,
  status: progressStatusSchema,
  description: requiredTextSchema,
  hoursWorked: hoursWorkedSchema,
});

export const revenueRecordSchema = z.object({
  projectId: uuidSchema,
  amount: amountSchema,
  description: requiredTextSchema,
  recordDate: z
    .string()
    .regex(revenueDatePattern, 'Record date must use YYYY-MM-DD format')
    .optional(),
});

export type ProgressUpdateInput = z.infer<typeof progressUpdateSchema>;
export type RevenueRecordInput = z.infer<typeof revenueRecordSchema>;

export function parseValidationError(error: z.ZodError) {
  return error.flatten().fieldErrors;
}
