"use server";

import { createClient } from '@/lib/supabase/server';
import type { Project, RevenueRecord } from '@/lib/types/database';
import {
  parseValidationError,
  revenueRecordSchema,
  type RevenueRecordInput,
} from '@/lib/validations/monitoring';

type RevenueActionErrorCode =
  | 'UNAUTHENTICATED'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'DATABASE_ERROR';

export interface RevenueWarning {
  budget: number;
  amount: number;
  projectedTotalRevenue: number;
  threshold: number;
  message: string;
}

export interface RevenueSuccessResult {
  ok: true;
  record: RevenueRecord;
  warning: RevenueWarning | null;
}

export interface RevenueFailureResult {
  ok: false;
  code: RevenueActionErrorCode;
  message: string;
  validationErrors?: Record<string, string[] | undefined>;
}

export type RevenueActionResult = RevenueSuccessResult | RevenueFailureResult;

const revenueRecordSelect = 'id, project_id, recorded_by, amount, description, record_date, created_at';

async function getCurrentUserRole(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).single();

  if (error) {
    return { role: null as 'resident' | 'manager' | 'admin' | null, error };
  }

  return { role: data.role as 'resident' | 'manager' | 'admin', error: null };
}

async function getProjectById(supabase: Awaited<ReturnType<typeof createClient>>, projectId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('id, name, description, created_by, status, start_date, end_date, budget, actual_revenue, workers_needed, created_at, updated_at')
    .eq('id', projectId)
    .single();

  if (error) {
    return { project: null as Project | null, error };
  }

  return { project: data as Project, error: null };
}

async function getProjectRevenueTotal(supabase: Awaited<ReturnType<typeof createClient>>, projectId: string) {
  const { data, error } = await supabase
    .from('revenue_records')
    .select('amount')
    .eq('project_id', projectId);

  if (error) {
    return { totalRevenue: null as number | null, error };
  }

  return {
    totalRevenue: data.reduce((sum, record) => sum + Number(record.amount), 0),
    error: null,
  };
}

function buildRevenueWarning(project: Project, amount: number, projectedTotalRevenue: number): RevenueWarning | null {
  const threshold = Number(project.budget) * 1.5;

  if (Number(project.budget) <= 0 || projectedTotalRevenue <= threshold) {
    return null;
  }

  return {
    budget: Number(project.budget),
    amount,
    projectedTotalRevenue,
    threshold,
    message: 'The projected revenue is more than 150% of the project budget.',
  };
}

export async function submitRevenueRecord(rawInput: RevenueRecordInput): Promise<RevenueActionResult> {
  const parsedInput = revenueRecordSchema.safeParse(rawInput);

  if (!parsedInput.success) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      message: 'Please correct the highlighted fields and try again.',
      validationErrors: parseValidationError(parsedInput.error),
    };
  }

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return {
      ok: false,
      code: 'UNAUTHENTICATED',
      message: 'You must be signed in to record revenue.',
    };
  }

  const { role, error: roleError } = await getCurrentUserRole(supabase, authData.user.id);

  if (roleError || !role) {
    return {
      ok: false,
      code: 'FORBIDDEN',
      message: 'Your profile could not be loaded.',
    };
  }

  if (role !== 'manager' && role !== 'admin') {
    return {
      ok: false,
      code: 'FORBIDDEN',
      message: 'Only managers can record revenue.',
    };
  }

  const { project, error: projectError } = await getProjectById(supabase, parsedInput.data.projectId);

  if (projectError || !project) {
    return {
      ok: false,
      code: 'NOT_FOUND',
      message: 'The selected project was not found.',
    };
  }

  const { totalRevenue, error: totalError } = await getProjectRevenueTotal(supabase, project.id);

  if (totalError || totalRevenue === null) {
    return {
      ok: false,
      code: 'DATABASE_ERROR',
      message: 'Unable to calculate the current project revenue.',
    };
  }

  const projectedTotalRevenue = totalRevenue + parsedInput.data.amount;
  const warning = buildRevenueWarning(project, parsedInput.data.amount, projectedTotalRevenue);

  const recordDate = parsedInput.data.recordDate ?? new Date().toISOString().slice(0, 10);

  // Idempotency guard: an accidental resubmit (e.g. after seeing the >150% warning)
  // must not double-count revenue. Treat an identical record from the last 2 minutes
  // as the same submission and return it instead of inserting a duplicate.
  const recentCutoff = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  const { data: duplicateRecord } = await supabase
    .from('revenue_records')
    .select(revenueRecordSelect)
    .eq('project_id', project.id)
    .eq('recorded_by', authData.user.id)
    .eq('amount', parsedInput.data.amount)
    .eq('record_date', recordDate)
    .gte('created_at', recentCutoff)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (duplicateRecord) {
    return { ok: true, record: duplicateRecord as RevenueRecord, warning };
  }

  const { data: insertedRecord, error: insertError } = await supabase
    .from('revenue_records')
    .insert({
      project_id: project.id,
      recorded_by: authData.user.id,
      amount: parsedInput.data.amount,
      description: parsedInput.data.description,
      record_date: recordDate,
    })
    .select(revenueRecordSelect)
    .single();

  if (insertError || !insertedRecord) {
    return {
      ok: false,
      code: 'DATABASE_ERROR',
      message: 'The revenue record could not be saved.',
    };
  }

  return {
    ok: true,
    record: insertedRecord as RevenueRecord,
    warning,
  };
}
