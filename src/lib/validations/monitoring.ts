import { z } from 'zod';

export const progressStatusValues = ['not_started', 'in_progress', 'completed'] as const;
export const revenueDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export const progressStatusSchema = z.enum(progressStatusValues);

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const uuidSchema = z.string().regex(uuidRegex, 'Format ID tidak valid');
const requiredTextSchema = z.string().trim().min(1, 'Kolom ini wajib diisi');
const percentageSchema = z.number().int('Kemajuan harus berupa angka bulat').min(0, 'Minimal kemajuan adalah 0%').max(100, 'Maksimal kemajuan adalah 100%');
const hoursWorkedSchema = z.number().min(0, 'Jumlah jam kerja tidak boleh negatif');
const amountSchema = z.number().positive('Jumlah uang harus lebih besar dari nol');

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
    .regex(revenueDatePattern, 'Format tanggal pencatatan harus YYYY-MM-DD')
    .optional(),
});

export type ProgressUpdateInput = z.infer<typeof progressUpdateSchema>;
export type RevenueRecordInput = z.infer<typeof revenueRecordSchema>;

export function parseValidationError(error: z.ZodError) {
  return error.flatten().fieldErrors;
}
