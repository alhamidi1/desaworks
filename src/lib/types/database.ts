// DesaWorks — Shared TypeScript Types
// Mirrors the Supabase database schema

// ============================================
// ENUM TYPES
// ============================================

export type UserRole = 'resident' | 'manager' | 'admin';
export type AvailabilityStatus = 'available' | 'unavailable';
export type ProjectStatus = 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';
export type AssignmentStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'void';
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';
export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced';

// ============================================
// DATABASE ROW TYPES
// ============================================

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  date_of_birth: string | null;
  role: UserRole;
  availability: AvailabilityStatus;
  bio: string | null;
  agreed_to_tos: boolean;
  agreed_to_privacy: boolean;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string | null;
  created_at: string;
}

export interface ResidentSkill {
  id: string;
  resident_id: string;
  skill_id: string;
  experience_years: number;
  proficiency_level: ProficiencyLevel | null;
  notes: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  status: ProjectStatus;
  start_date: string | null;
  end_date: string | null;
  budget: number;
  actual_revenue: number;
  workers_needed: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectSkillRequirement {
  id: string;
  project_id: string;
  skill_id: string;
  min_proficiency: ProficiencyLevel;
  workers_needed: number;
  created_at: string;
}

export interface Assignment {
  id: string;
  project_id: string;
  resident_id: string;
  assigned_by: string;
  status: AssignmentStatus;
  assigned_at: string;
  confirmed_at: string | null;
  completed_at: string | null;
  notes: string | null;
}

export interface ProgressUpdate {
  id: string;
  assignment_id: string;
  reported_by: string;
  progress_percentage: number;
  status: ProgressStatus;
  description: string | null;
  hours_worked: number;
  created_at: string;
}

export interface RevenueRecord {
  id: string;
  project_id: string;
  recorded_by: string;
  amount: number;
  description: string | null;
  record_date: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  created_at: string;
}

// ============================================
// JOIN / VIEW TYPES (for common queries)
// ============================================

export interface ResidentWithSkills extends Profile {
  skills: (ResidentSkill & { skill: Skill })[];
}

export interface ProjectWithRequirements extends Project {
  skill_requirements: (ProjectSkillRequirement & { skill: Skill })[];
  creator: Profile;
}

export interface AssignmentWithDetails extends Assignment {
  project: Project;
  resident: Profile;
  progress_updates: ProgressUpdate[];
}

export interface ProjectDashboard extends Project {
  assignments: (Assignment & { resident: Profile })[];
  revenue_records: RevenueRecord[];
  total_progress: number;
  total_revenue: number;
}

// ============================================
// FORM INPUT TYPES (for creating/updating)
// ============================================

export interface CreateProfileInput {
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  role?: UserRole;
  bio?: string;
  agreed_to_tos: boolean;
  agreed_to_privacy: boolean;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  workers_needed?: number;
  skill_requirements: {
    skill_id: string;
    min_proficiency?: ProficiencyLevel;
    workers_needed?: number;
  }[];
}

export interface CreateProgressUpdateInput {
  assignment_id: string;
  progress_percentage: number;
  status?: ProgressStatus;
  description?: string;
  hours_worked?: number;
}

export interface CreateRevenueRecordInput {
  project_id: string;
  amount: number;
  description?: string;
  record_date?: string;
}
