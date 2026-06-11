'use server';

import { createClient } from '@/lib/supabase/server';
import {
  confirmAssignmentsSchema,
  createProjectSchema,
  isValidStatusTransition,
  listProjectsFilterSchema,
  updateProjectSchema,
  updateProjectStatusSchema,
  voidAssignmentSchema,
} from '@/lib/validations/project';
import {
  detectSchedulingConflicts,
  type SchedulingConflict,
} from '@/lib/queries/recommendations';
import type {
  Assignment,
  Project,
  ProjectSkillRequirement,
  ProjectStatus,
  ProjectWithRequirements,
  Skill,
} from '@/lib/types/database';

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

type ManagerContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
};

async function requireManager(): Promise<
  ActionResult<ManagerContext>
> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return { success: false, error: 'Profile not found' };
  }

  if (profile.role !== 'manager' && profile.role !== 'admin') {
    return { success: false, error: 'Forbidden: manager access required' };
  }

  return { success: true, data: { supabase, userId: profile.id } };
}

type ProjectRowWithRelations = Project & {
  skill_requirements: (ProjectSkillRequirement & { skill: Skill })[];
  creator: ProjectWithRequirements['creator'];
};

async function fetchProjectWithRequirements(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string
): Promise<ActionResult<ProjectWithRequirements>> {
  const { data, error } = await supabase
    .from('projects')
    .select(
      `
      *,
      skill_requirements:project_skill_requirements (
        *,
        skill:skills (*)
      ),
      creator:profiles!projects_created_by_fkey (*)
    `
    )
    .eq('id', projectId)
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? 'Project not found' };
  }

  const project = data as ProjectRowWithRelations;

  return {
    success: true,
    data: {
      ...project,
      skill_requirements: project.skill_requirements ?? [],
      creator: project.creator,
    },
  };
}

export async function createProject(
  input: unknown
): Promise<ActionResult<Project>> {
  const parsed = createProjectSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid input',
    };
  }

  const auth = await requireManager();
  if (!auth.success) return auth;

  const { supabase, userId } = auth.data;
  const data = parsed.data;

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      name: data.name,
      description: data.description ?? null,
      created_by: userId,
      status: 'draft',
      start_date: data.start_date ?? null,
      end_date: data.end_date ?? null,
      budget: data.budget ?? 0,
      workers_needed: data.workers_needed ?? 1,
    })
    .select()
    .single();

  if (projectError || !project) {
    return {
      success: false,
      error: projectError?.message ?? 'Failed to create project',
    };
  }

  const requirements = data.skill_requirements.map((req) => ({
    project_id: project.id,
    skill_id: req.skill_id,
    min_proficiency: req.min_proficiency,
    workers_needed: req.workers_needed,
  }));

  const { error: reqError } = await supabase
    .from('project_skill_requirements')
    .insert(requirements);

  if (reqError) {
    await supabase.from('projects').delete().eq('id', project.id);
    return { success: false, error: reqError.message };
  }

  return { success: true, data: project as Project };
}

export async function updateProject(
  projectId: string,
  input: unknown
): Promise<ActionResult<ProjectWithRequirements>> {
  const idParsed = updateProjectStatusSchema
    .pick({ project_id: true })
    .safeParse({ project_id: projectId });
  if (!idParsed.success) {
    return { success: false, error: 'Invalid project ID' };
  }

  const parsed = updateProjectSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid input',
    };
  }

  const auth = await requireManager();
  if (!auth.success) return auth;

  const { supabase } = auth.data;
  const data = parsed.data;

  const updates: Record<string, unknown> = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.description !== undefined) updates.description = data.description;
  if (data.start_date !== undefined) updates.start_date = data.start_date;
  if (data.end_date !== undefined) updates.end_date = data.end_date;
  if (data.budget !== undefined) updates.budget = data.budget;
  if (data.workers_needed !== undefined) {
    updates.workers_needed = data.workers_needed;
  }

  if (Object.keys(updates).length > 0) {
    const { error: updateError } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }
  }

  if (data.skill_requirements) {
    const { error: deleteError } = await supabase
      .from('project_skill_requirements')
      .delete()
      .eq('project_id', projectId);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    const requirements = data.skill_requirements.map((req) => ({
      project_id: projectId,
      skill_id: req.skill_id,
      min_proficiency: req.min_proficiency,
      workers_needed: req.workers_needed,
    }));

    const { error: insertError } = await supabase
      .from('project_skill_requirements')
      .insert(requirements);

    if (insertError) {
      return { success: false, error: insertError.message };
    }
  }

  return fetchProjectWithRequirements(supabase, projectId);
}

export async function updateProjectStatus(
  input: unknown
): Promise<ActionResult<Project>> {
  const parsed = updateProjectStatusSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid input',
    };
  }

  const auth = await requireManager();
  if (!auth.success) return auth;

  const { supabase } = auth.data;
  const { project_id, status } = parsed.data;

  const { data: existing, error: fetchError } = await supabase
    .from('projects')
    .select('status')
    .eq('id', project_id)
    .single();

  if (fetchError || !existing) {
    return { success: false, error: fetchError?.message ?? 'Project not found' };
  }

  const currentStatus = existing.status as ProjectStatus;

  if (!isValidStatusTransition(currentStatus, status)) {
    return {
      success: false,
      error: `Cannot transition project status from '${currentStatus}' to '${status}'`,
    };
  }

  const { data: project, error: updateError } = await supabase
    .from('projects')
    .update({ status })
    .eq('id', project_id)
    .select()
    .single();

  if (updateError || !project) {
    return {
      success: false,
      error: updateError?.message ?? 'Failed to update project status',
    };
  }

  return { success: true, data: project as Project };
}

export async function getProject(
  projectId: string
): Promise<ActionResult<ProjectWithRequirements>> {
  const idParsed = updateProjectStatusSchema
    .pick({ project_id: true })
    .safeParse({ project_id: projectId });
  if (!idParsed.success) {
    return { success: false, error: 'Invalid project ID' };
  }

  const auth = await requireManager();
  if (!auth.success) return auth;

  return fetchProjectWithRequirements(auth.data.supabase, projectId);
}

export async function listProjects(
  filtersInput?: unknown
): Promise<ActionResult<Project[]>> {
  const parsed = listProjectsFilterSchema.safeParse(filtersInput ?? {});
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid filters',
    };
  }

  const auth = await requireManager();
  if (!auth.success) return auth;

  const { supabase } = auth.data;

  let query = supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (parsed.data.status) {
    query = query.eq('status', parsed.data.status);
  }

  const { data, error } = await query;

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: (data ?? []) as Project[] };
}

export async function confirmAssignments(
  input: unknown
): Promise<
  ActionResult<{
    assignments: Assignment[];
    conflicts_skipped: SchedulingConflict[];
  }>
> {
  const parsed = confirmAssignmentsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid input',
    };
  }

  const auth = await requireManager();
  if (!auth.success) return auth;

  const { supabase, userId } = auth.data;
  const { project_id, resident_ids, override_conflicts } = parsed.data;

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, name, workers_needed, start_date, end_date')
    .eq('id', project_id)
    .single();

  if (projectError || !project) {
    return { success: false, error: projectError?.message ?? 'Project not found' };
  }

  if (resident_ids.length > project.workers_needed) {
    return {
      success: false,
      error: `Cannot assign more than ${project.workers_needed} workers to this project`,
    };
  }

  const uniqueResidentIds = [...new Set(resident_ids)];
  if (uniqueResidentIds.length !== resident_ids.length) {
    return { success: false, error: 'Duplicate resident IDs in assignment list' };
  }

  const conflictMap = new Map<string, SchedulingConflict[]>();
  for (const residentId of uniqueResidentIds) {
    const conflicts = await detectSchedulingConflicts(
      residentId,
      project_id,
      project.start_date,
      project.end_date
    );
    if (conflicts.length > 0) {
      conflictMap.set(residentId, conflicts);
    }
  }

  if (conflictMap.size > 0 && !override_conflicts) {
    const conflictDetails = [...conflictMap.entries()]
      .map(
        ([residentId, conflicts]) =>
          `${residentId}: overlaps with ${conflicts.map((c) => c.project_name).join(', ')}`
      )
      .join('; ');
    return {
      success: false,
      error: `Scheduling conflicts detected. Set override_conflicts to confirm anyway. Details: ${conflictDetails}`,
    };
  }

  const { data: residents, error: residentsError } = await supabase
    .from('profiles')
    .select('id, role')
    .in('id', uniqueResidentIds);

  if (residentsError) {
    return { success: false, error: residentsError.message };
  }

  if (!residents || residents.length !== uniqueResidentIds.length) {
    return { success: false, error: 'One or more residents not found' };
  }

  const invalidResidents = residents.filter((r) => r.role !== 'resident');
  if (invalidResidents.length > 0) {
    return { success: false, error: 'Assignments can only target resident profiles' };
  }

  const { data: existingAssignments, error: existingError } = await supabase
    .from('assignments')
    .select('id, resident_id, status')
    .eq('project_id', project_id)
    .in('resident_id', uniqueResidentIds);

  if (existingError) {
    return { success: false, error: existingError.message };
  }

  const existingByResident = new Map(
    (existingAssignments ?? []).map((a) => [a.resident_id, a])
  );

  const confirmedAt = new Date().toISOString();
  const assignments: Assignment[] = [];
  const conflicts_skipped: SchedulingConflict[] = [];

  for (const residentId of uniqueResidentIds) {
    const residentConflicts = conflictMap.get(residentId) ?? [];
    if (residentConflicts.length > 0) {
      conflicts_skipped.push(...residentConflicts);
    }

    const existing = existingByResident.get(residentId);

    if (existing) {
      if (['confirmed', 'active', 'pending'].includes(existing.status)) {
        return {
          success: false,
          error: `Resident ${residentId} is already assigned to this project`,
        };
      }

      if (existing.status === 'void') {
        const { data: updated, error: updateError } = await supabase
          .from('assignments')
          .update({
            status: 'confirmed',
            confirmed_at: confirmedAt,
            assigned_by: userId,
            assigned_at: confirmedAt,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (updateError || !updated) {
          return {
            success: false,
            error: updateError?.message ?? 'Failed to reactivate assignment',
          };
        }

        assignments.push(updated as Assignment);
        continue;
      }
    }

    const { data: created, error: insertError } = await supabase
      .from('assignments')
      .insert({
        project_id,
        resident_id: residentId,
        assigned_by: userId,
        status: 'confirmed',
        confirmed_at: confirmedAt,
      })
      .select()
      .single();

    if (insertError || !created) {
      return {
        success: false,
        error: insertError?.message ?? 'Failed to create assignment',
      };
    }

    assignments.push(created as Assignment);
  }

  const notifications = assignments.map((assignment) => ({
    user_id: assignment.resident_id,
    title: 'New Project Assignment',
    message: `You have been assigned to project "${project.name}".`,
    link: `/projects/${project_id}`,
  }));

  const { error: notificationError } = await supabase
    .from('notifications')
    .insert(notifications);

  if (notificationError) {
    return { success: false, error: notificationError.message };
  }

  return { success: true, data: { assignments, conflicts_skipped } };
}

export async function voidAssignment(
  input: unknown
): Promise<ActionResult<Assignment>> {
  const parsed = voidAssignmentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid input',
    };
  }

  const auth = await requireManager();
  if (!auth.success) return auth;

  const { supabase } = auth.data;
  const { assignment_id } = parsed.data;

  const { data: existing, error: fetchError } = await supabase
    .from('assignments')
    .select('*')
    .eq('id', assignment_id)
    .single();

  if (fetchError || !existing) {
    return {
      success: false,
      error: fetchError?.message ?? 'Assignment not found',
    };
  }

  if (existing.status === 'void') {
    return { success: true, data: existing as Assignment };
  }

  if (existing.status === 'completed') {
    return {
      success: false,
      error: 'Cannot void a completed assignment',
    };
  }

  const { data: assignment, error: updateError } = await supabase
    .from('assignments')
    .update({ status: 'void' })
    .eq('id', assignment_id)
    .select()
    .single();

  if (updateError || !assignment) {
    return {
      success: false,
      error: updateError?.message ?? 'Failed to void assignment',
    };
  }

  return { success: true, data: assignment as Assignment };
}
