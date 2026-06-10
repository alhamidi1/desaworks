-- DesaWorks Initial Schema
-- Supabase/PostgreSQL Migration
-- Creates all tables for the Community Resource Management System

-- ============================================
-- ENUM TYPES
-- ============================================

CREATE TYPE user_role AS ENUM ('resident', 'manager', 'admin');
CREATE TYPE availability_status AS ENUM ('available', 'unavailable');
CREATE TYPE project_status AS ENUM ('draft', 'open', 'in_progress', 'completed', 'cancelled');
CREATE TYPE assignment_status AS ENUM ('pending', 'confirmed', 'active', 'completed', 'void');
CREATE TYPE progress_status AS ENUM ('not_started', 'in_progress', 'completed');

-- ============================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  date_of_birth DATE,
  role user_role NOT NULL DEFAULT 'resident',
  availability availability_status NOT NULL DEFAULT 'available',
  bio TEXT,
  agreed_to_tos BOOLEAN NOT NULL DEFAULT FALSE,
  agreed_to_privacy BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- SKILLS TABLE (predefined categories)
-- ============================================

CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- RESIDENT_SKILLS (many-to-many: profiles <-> skills)
-- ============================================

CREATE TABLE resident_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  experience_years INTEGER DEFAULT 0,
  proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(resident_id, skill_id)
);

-- ============================================
-- PROJECTS TABLE
-- ============================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  status project_status NOT NULL DEFAULT 'draft',
  start_date DATE,
  end_date DATE,
  budget NUMERIC(15, 2) DEFAULT 0,
  actual_revenue NUMERIC(15, 2) DEFAULT 0,
  workers_needed INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- PROJECT_SKILL_REQUIREMENTS (skills needed for a project)
-- ============================================

CREATE TABLE project_skill_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  min_proficiency TEXT CHECK (min_proficiency IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  workers_needed INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, skill_id)
);

-- ============================================
-- ASSIGNMENTS (worker <-> project)
-- ============================================

CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  resident_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES profiles(id),
  status assignment_status NOT NULL DEFAULT 'pending',
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(project_id, resident_id)
);

-- ============================================
-- PROGRESS_UPDATES (worker reports on task progress)
-- ============================================

CREATE TABLE progress_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES profiles(id),
  progress_percentage INTEGER NOT NULL CHECK (progress_percentage BETWEEN 0 AND 100),
  status progress_status NOT NULL DEFAULT 'in_progress',
  description TEXT,
  hours_worked NUMERIC(5, 1) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- REVENUE_RECORDS (financial tracking per project)
-- ============================================

CREATE TABLE revenue_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  recorded_by UUID NOT NULL REFERENCES profiles(id),
  amount NUMERIC(15, 2) NOT NULL,
  description TEXT,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_availability ON profiles(availability);
CREATE INDEX idx_resident_skills_resident ON resident_skills(resident_id);
CREATE INDEX idx_resident_skills_skill ON resident_skills(skill_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_assignments_project ON assignments(project_id);
CREATE INDEX idx_assignments_resident ON assignments(resident_id);
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_progress_assignment ON progress_updates(assignment_id);
CREATE INDEX idx_revenue_project ON revenue_records(project_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE read = FALSE;
CREATE INDEX idx_skills_category ON skills(category);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE resident_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_skill_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all profiles, update only their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Skills: readable by everyone, writable by managers
CREATE POLICY "Skills are viewable by everyone" ON skills FOR SELECT USING (true);
CREATE POLICY "Managers can manage skills" ON skills FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('manager', 'admin'))
);

-- Resident Skills: readable by everyone, writable by owner
CREATE POLICY "Resident skills viewable by everyone" ON resident_skills FOR SELECT USING (true);
CREATE POLICY "Residents manage own skills" ON resident_skills FOR ALL USING (auth.uid() = resident_id);

-- Projects: readable by everyone, writable by managers
CREATE POLICY "Projects viewable by everyone" ON projects FOR SELECT USING (true);
CREATE POLICY "Managers can manage projects" ON projects FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('manager', 'admin'))
);

-- Project Skill Requirements: readable by everyone, writable by managers
CREATE POLICY "Project requirements viewable by everyone" ON project_skill_requirements FOR SELECT USING (true);
CREATE POLICY "Managers can manage project requirements" ON project_skill_requirements FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('manager', 'admin'))
);

-- Assignments: readable by involved parties, writable by managers
CREATE POLICY "Assignments viewable by involved users" ON assignments FOR SELECT USING (
  auth.uid() = resident_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('manager', 'admin'))
);
CREATE POLICY "Managers can manage assignments" ON assignments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('manager', 'admin'))
);

-- Progress Updates: readable by involved parties, writable by assigned workers
CREATE POLICY "Progress viewable by involved users" ON progress_updates FOR SELECT USING (
  auth.uid() = reported_by OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('manager', 'admin'))
);
CREATE POLICY "Workers can report progress" ON progress_updates FOR INSERT WITH CHECK (auth.uid() = reported_by);

-- Revenue Records: readable by managers, writable by managers
CREATE POLICY "Revenue viewable by managers" ON revenue_records FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('manager', 'admin'))
);
CREATE POLICY "Managers can record revenue" ON revenue_records FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('manager', 'admin'))
);

-- Notifications: users can only see their own
CREATE POLICY "Users see own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- SEED DATA: Predefined Skill Categories
-- ============================================

INSERT INTO skills (name, category, description) VALUES
  ('Agriculture', 'Farming', 'General farming and crop cultivation skills'),
  ('Animal Husbandry', 'Farming', 'Livestock and poultry management'),
  ('Fisheries', 'Farming', 'Fish farming and aquaculture'),
  ('Basic Accounting', 'Finance', 'Bookkeeping and basic financial record-keeping'),
  ('Financial Reporting', 'Finance', 'Creating financial statements and reports'),
  ('Carpentry', 'Construction', 'Woodworking and building structures'),
  ('Masonry', 'Construction', 'Brick and stone construction'),
  ('Electrical Work', 'Construction', 'Basic electrical installation and repair'),
  ('Plumbing', 'Construction', 'Water and drainage system installation'),
  ('Cooking', 'Food & Beverage', 'Food preparation and cooking'),
  ('Food Processing', 'Food & Beverage', 'Food preservation and processing techniques'),
  ('Tourism Guiding', 'Tourism', 'Tour guide and hospitality services'),
  ('Handicrafts', 'Creative', 'Traditional crafts and artisan work'),
  ('Sewing', 'Creative', 'Textile and garment production'),
  ('Driving', 'Transportation', 'Vehicle operation and logistics'),
  ('IT Skills', 'Technology', 'Basic computer and internet skills'),
  ('Marketing', 'Business', 'Product promotion and sales'),
  ('Leadership', 'Management', 'Team coordination and project management'),
  ('Teaching', 'Education', 'Education and training delivery'),
  ('Healthcare', 'Health', 'Basic health and first aid skills');

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
