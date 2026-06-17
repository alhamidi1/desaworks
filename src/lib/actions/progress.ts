"use server";

import { createClient } from '@/lib/supabase/server';
import type { Assignment, ProgressUpdate, Profile } from '@/lib/types/database';
import {
  parseValidationError,
  progressUpdateSchema,
  type ProgressUpdateInput,
} from '@/lib/validations/monitoring';

type ProgressActionErrorCode =
  | 'UNAUTHENTICATED'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'BACKWARD_PROGRESS'
  | 'DUPLICATE_SUBMISSION'
  | 'DATABASE_ERROR';

export interface ProgressDuplicateWarning {
  existingUpdate: ProgressUpdate;
  submittedPercentage: number;
  sameDay: boolean;
}

export interface ProgressSuccessResult {
  ok: true;
  duplicateDetected: boolean;
  update: ProgressUpdate;
}

export interface ProgressFailureResult {
  ok: false;
  code: ProgressActionErrorCode;
  message: string;
  validationErrors?: Record<string, string[] | undefined>;
  duplicateWarning?: ProgressDuplicateWarning;
}

export type ProgressActionResult = ProgressSuccessResult | ProgressFailureResult;

export interface SubmitProgressOptions {
  forceDuplicate?: boolean;
}

const progressUpdateSelect = 'id, assignment_id, reported_by, progress_percentage, status, description, hours_worked, created_at';

function toUtcDayBounds(date: Date) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

function isSameUtcDay(firstValue: string, secondValue: Date) {
  return firstValue.slice(0, 10) === secondValue.toISOString().slice(0, 10);
}

async function getCurrentUserProfile(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data, error } = await supabase.from('profiles').select('id, role, full_name, email').eq('id', userId).single();

  if (error) {
    return { profile: null as Profile | null, error };
  }

  return { profile: data as Pick<Profile, 'id' | 'role' | 'full_name' | 'email'>, error: null };
}

async function getAssignmentById(
  supabase: Awaited<ReturnType<typeof createClient>>,
  assignmentId: string
) {
  const { data, error } = await supabase
    .from('assignments')
    .select('id, project_id, resident_id, assigned_by, status, assigned_at, confirmed_at, completed_at, notes')
    .eq('id', assignmentId)
    .single();

  if (error) {
    return { assignment: null as Assignment | null, error };
  }

  return { assignment: data as Assignment, error: null };
}

async function getLatestProgressForAssignment(
  supabase: Awaited<ReturnType<typeof createClient>>,
  assignmentId: string
) {
  const { data, error } = await supabase
    .from('progress_updates')
    .select(progressUpdateSelect)
    .eq('assignment_id', assignmentId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return { update: null as ProgressUpdate | null, error };
  }

  return { update: data as ProgressUpdate | null, error: null };
}

async function getDuplicateProgressForDay(
  supabase: Awaited<ReturnType<typeof createClient>>,
  assignmentId: string,
  progressPercentage: number,
  now: Date
) {
  const { start, end } = toUtcDayBounds(now);

  const { data, error } = await supabase
    .from('progress_updates')
    .select(progressUpdateSelect)
    .eq('assignment_id', assignmentId)
    .eq('progress_percentage', progressPercentage)
    .gte('created_at', start.toISOString())
    .lt('created_at', end.toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return { update: null as ProgressUpdate | null, error };
  }

  return { update: data as ProgressUpdate | null, error: null };
}

export async function submitProgressUpdate(
  rawInput: ProgressUpdateInput,
  options: SubmitProgressOptions = {}
): Promise<ProgressActionResult> {
  const parsedInput = progressUpdateSchema.safeParse(rawInput);

  if (!parsedInput.success) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      message: 'Silakan perbaiki kolom yang salah dan coba lagi.',
      validationErrors: parseValidationError(parsedInput.error),
    };
  }

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return {
      ok: false,
      code: 'UNAUTHENTICATED',
      message: 'Anda harus masuk/login untuk melaporkan kemajuan kerja.',
    };
  }

  const { profile, error: profileError } = await getCurrentUserProfile(supabase, authData.user.id);

  if (profileError || !profile) {
    return {
      ok: false,
      code: 'FORBIDDEN',
      message: 'Profil Anda tidak dapat dimuat.',
    };
  }

  const { assignment, error: assignmentError } = await getAssignmentById(supabase, parsedInput.data.assignmentId);

  if (assignmentError || !assignment) {
    return {
      ok: false,
      code: 'NOT_FOUND',
      message: 'Tugas pekerjaan tidak ditemukan.',
    };
  }

  const canManageProgress = profile.role === 'manager' || profile.role === 'admin';

  if (!canManageProgress && assignment.resident_id !== authData.user.id) {
    return {
      ok: false,
      code: 'FORBIDDEN',
      message: 'Anda hanya dapat melaporkan kemajuan untuk tugas pekerjaan Anda sendiri.',
    };
  }

  const { update: latestProgress, error: latestError } = await getLatestProgressForAssignment(
    supabase,
    assignment.id
  );

  if (latestError) {
    return {
      ok: false,
      code: 'DATABASE_ERROR',
      message: 'Gagal membaca riwayat kemajuan terakhir.',
    };
  }

  if (latestProgress && parsedInput.data.progressPercentage < latestProgress.progress_percentage) {
    return {
      ok: false,
      code: 'BACKWARD_PROGRESS',
      message: 'Kemajuan kerja tidak boleh berkurang dari sebelumnya.',
    };
  }

  const now = new Date();
  const { update: duplicateProgress, error: duplicateError } = await getDuplicateProgressForDay(
    supabase,
    assignment.id,
    parsedInput.data.progressPercentage,
    now
  );

  if (duplicateError) {
    return {
      ok: false,
      code: 'DATABASE_ERROR',
      message: 'Gagal memeriksa duplikasi laporan.',
    };
  }

  if (duplicateProgress && !options.forceDuplicate) {
    return {
      ok: false,
      code: 'DUPLICATE_SUBMISSION',
      message: 'Laporan kemajuan yang sama sudah dikirimkan hari ini.',
      duplicateWarning: {
        existingUpdate: duplicateProgress,
        submittedPercentage: parsedInput.data.progressPercentage,
        sameDay: isSameUtcDay(duplicateProgress.created_at, now),
      },
    };
  }

  const { data: insertedUpdate, error: insertError } = await supabase
    .from('progress_updates')
    .insert({
      assignment_id: assignment.id,
      reported_by: authData.user.id,
      progress_percentage: parsedInput.data.progressPercentage,
      status: parsedInput.data.status,
      description: parsedInput.data.description,
      hours_worked: parsedInput.data.hoursWorked,
    })
    .select(progressUpdateSelect)
    .single();

  if (insertError || !insertedUpdate) {
    return {
      ok: false,
      code: 'DATABASE_ERROR',
      message: 'Kemajuan kerja gagal disimpan.',
    };
  }

  return {
    ok: true,
    duplicateDetected: Boolean(duplicateProgress),
    update: insertedUpdate as ProgressUpdate,
  };
}
