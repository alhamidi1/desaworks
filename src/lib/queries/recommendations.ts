import { createClient } from '@/lib/supabase/server';
import {
  recommendationFiltersSchema,
  type RecommendationFilters,
} from '@/lib/validations/project';
import { meetsProficiency } from '@/lib/queries/proficiency';
import type {
  Profile,
  Project,
  ProjectSkillRequirement,
  ResidentSkill,
  Skill,
} from '@/lib/types/database';

export { meetsProficiency } from '@/lib/queries/proficiency';

const ACTIVE_ASSIGNMENT_STATUSES = ['pending', 'confirmed', 'active'] as const;

export type QueryResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface SchedulingConflict {
  assignment_id: string;
  project_id: string;
  project_name: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
}

export interface RecommendedWorker {
  profile: Profile;
  skills: (ResidentSkill & { skill: Skill })[];
  match_score: number;
  matched_skills: (ResidentSkill & { skill: Skill })[];
  total_experience_years: number;
  has_scheduling_conflict: boolean;
  scheduling_conflicts: SchedulingConflict[];
}

export function calculateMatchScore(
  residentSkills: (ResidentSkill & { skill: Skill })[],
  requirements: Pick<
    ProjectSkillRequirement,
    'skill_id' | 'min_proficiency'
  >[]
): { score: number; matched_skills: (ResidentSkill & { skill: Skill })[] } {
  const matched_skills: (ResidentSkill & { skill: Skill })[] = [];

  for (const req of requirements) {
    const match = residentSkills.find(
      (rs) =>
        rs.skill_id === req.skill_id &&
        meetsProficiency(rs.proficiency_level, req.min_proficiency)
    );
    if (match) {
      matched_skills.push(match);
    }
  }

  return { score: matched_skills.length, matched_skills };
}

export function datesOverlap(
  startA: string | null,
  endA: string | null,
  startB: string | null,
  endB: string | null
): boolean {
  if (!startA || !endA || !startB || !endB) return false;
  return startA <= endB && startB <= endA;
}

type ProjectDates = Pick<Project, 'id' | 'name' | 'start_date' | 'end_date'>;

function resolveJoinedProject(
  projects: ProjectDates | ProjectDates[] | null
): ProjectDates | null {
  if (!projects) return null;
  return Array.isArray(projects) ? (projects[0] ?? null) : projects;
}

export async function detectSchedulingConflicts(
  residentId: string,
  projectId: string,
  startDate: string | null,
  endDate: string | null
): Promise<SchedulingConflict[]> {
  if (!startDate || !endDate) return [];

  const supabase = await createClient();

  const { data: assignments, error } = await supabase
    .from('assignments')
    .select(
      `
      id,
      status,
      project_id,
      projects (
        id,
        name,
        start_date,
        end_date
      )
    `
    )
    .eq('resident_id', residentId)
    .neq('project_id', projectId)
    .in('status', ACTIVE_ASSIGNMENT_STATUSES);

  if (error || !assignments) return [];

  const conflicts: SchedulingConflict[] = [];

  for (const assignment of assignments) {
    const project = resolveJoinedProject(
      assignment.projects as ProjectDates | ProjectDates[] | null
    );
    if (!project) continue;

    if (
      datesOverlap(startDate, endDate, project.start_date, project.end_date)
    ) {
      conflicts.push({
        assignment_id: assignment.id,
        project_id: project.id,
        project_name: project.name,
        start_date: project.start_date,
        end_date: project.end_date,
        status: assignment.status,
      });
    }
  }

  return conflicts;
}

function passesFilters(
  resident: Profile,
  residentSkills: (ResidentSkill & { skill: Skill })[],
  filters: RecommendationFilters
): boolean {
  if (
    filters.availability !== 'all' &&
    resident.availability !== filters.availability
  ) {
    return false;
  }

  if (filters.skill_ids && filters.skill_ids.length > 0) {
    const hasSkill = residentSkills.some((rs) =>
      filters.skill_ids!.includes(rs.skill_id)
    );
    if (!hasSkill) return false;
  }

  if (filters.min_experience_years !== undefined) {
    const maxExperience = Math.max(
      0,
      ...residentSkills.map((rs) => rs.experience_years)
    );
    if (maxExperience < filters.min_experience_years) return false;
  }

  if (filters.min_proficiency !== undefined) {
    const hasProficiency = residentSkills.some((rs) =>
      meetsProficiency(rs.proficiency_level, filters.min_proficiency!)
    );
    if (!hasProficiency) return false;
  }

  return true;
}

export async function getWorkerRecommendations(
  projectId: string,
  filtersInput?: unknown
): Promise<QueryResult<RecommendedWorker[]>> {
  const filtersParsed = recommendationFiltersSchema.safeParse(
    filtersInput ?? {}
  );
  if (!filtersParsed.success) {
    return {
      success: false,
      error: filtersParsed.error.issues[0]?.message ?? 'Invalid filters',
    };
  }
  const filters = filtersParsed.data;

  const supabase = await createClient();

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select(
      `
      *,
      skill_requirements:project_skill_requirements (
        id,
        project_id,
        skill_id,
        min_proficiency,
        workers_needed,
        created_at
      )
    `
    )
    .eq('id', projectId)
    .single();

  if (projectError || !project) {
    return {
      success: false,
      error: projectError?.message ?? 'Project not found',
    };
  }

  const requirements = (project.skill_requirements ??
    []) as ProjectSkillRequirement[];

  const { data: residents, error: residentsError } = await supabase
    .from('profiles')
    .select(
      `
      *,
      resident_skills (
        *,
        skill:skills (*)
      )
    `
    )
    .eq('role', 'resident');

  if (residentsError) {
    return { success: false, error: residentsError.message };
  }

  const recommendations: RecommendedWorker[] = [];

  for (const resident of residents ?? []) {
    const residentSkills = (resident.resident_skills ?? []).map(
      (rs: ResidentSkill & { skill: Skill }) => ({
        ...rs,
        skill: rs.skill,
      })
    ) as (ResidentSkill & { skill: Skill })[];

    const profile = { ...resident } as Profile & {
      resident_skills?: unknown;
    };
    delete profile.resident_skills;

    if (!passesFilters(profile, residentSkills, filters)) continue;

    const { score, matched_skills } = calculateMatchScore(
      residentSkills,
      requirements
    );

    if (requirements.length > 0 && score === 0) continue;

    const scheduling_conflicts = await detectSchedulingConflicts(
      profile.id,
      projectId,
      project.start_date,
      project.end_date
    );

    const total_experience_years = residentSkills.reduce(
      (sum, rs) => sum + rs.experience_years,
      0
    );

    recommendations.push({
      profile,
      skills: residentSkills,
      match_score: score,
      matched_skills,
      total_experience_years,
      has_scheduling_conflict: scheduling_conflicts.length > 0,
      scheduling_conflicts,
    });
  }

  recommendations.sort((a, b) => {
    if (b.match_score !== a.match_score) {
      return b.match_score - a.match_score;
    }
    return b.total_experience_years - a.total_experience_years;
  });

  return { success: true, data: recommendations };
}
