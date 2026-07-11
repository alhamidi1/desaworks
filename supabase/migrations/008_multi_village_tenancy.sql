-- 008_multi_village_tenancy
-- Adds village (BUMDes) tenancy and rewrites RLS so every user only sees their own
-- village's data. This ALSO fixes two standing flaws:
--   * profiles/resident_skills were readable by everyone (PII exposure) -> now village-scoped
--   * notifications INSERT was WITH CHECK(true) -> now manager/admin only
--
-- Tenant model: profiles.village_id + projects.village_id are the anchors. Child tables
-- (assignments, progress, revenue, requirements, resident_skills) are scoped through their
-- parent project/profile. A default village is created and all existing rows backfilled to it.

-- ============================================================================
-- Villages
-- ============================================================================
CREATE TABLE public.villages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  regency text,
  province text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.villages ENABLE ROW LEVEL SECURITY;

INSERT INTO public.villages (id, name, regency, province)
VALUES ('11111111-1111-1111-1111-111111111111', 'Desa Contoh', 'Kabupaten Contoh', 'Jawa Barat');

-- ============================================================================
-- village_id columns + backfill + indexes
-- ============================================================================
ALTER TABLE public.profiles ADD COLUMN village_id uuid REFERENCES public.villages(id);
ALTER TABLE public.projects ADD COLUMN village_id uuid REFERENCES public.villages(id);

UPDATE public.profiles SET village_id = '11111111-1111-1111-1111-111111111111' WHERE village_id IS NULL;
UPDATE public.projects SET village_id = '11111111-1111-1111-1111-111111111111' WHERE village_id IS NULL;

CREATE INDEX idx_profiles_village ON public.profiles(village_id);
CREATE INDEX idx_projects_village ON public.projects(village_id);

-- ============================================================================
-- Helper: the caller's village. SECURITY DEFINER so it can read profiles without
-- being subject to (and recursing into) the profiles RLS policy.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.auth_village_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT village_id FROM public.profiles WHERE id = auth.uid();
$$;
REVOKE EXECUTE ON FUNCTION public.auth_village_id() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.auth_village_id() TO authenticated;

-- ============================================================================
-- handle_new_user: also set village_id from signup metadata (manager passes theirs)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, role, agreed_to_tos, agreed_to_privacy, village_id)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''), split_part(NEW.email, '@', 1)),
    NEW.email,
    NULLIF(TRIM(NEW.raw_user_meta_data->>'phone'), ''),
    'resident',
    COALESCE((NEW.raw_user_meta_data->>'agreed_to_tos')::boolean, FALSE),
    COALESCE((NEW.raw_user_meta_data->>'agreed_to_privacy')::boolean, FALSE),
    NULLIF(NEW.raw_user_meta_data->>'village_id', '')::uuid
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ============================================================================
-- RLS rewrite (village-scoped). Drop the permissive policies and recreate.
-- ============================================================================

-- villages: a user sees only their own village
CREATE POLICY "Villages viewable by members" ON public.villages
  FOR SELECT USING (id = (SELECT public.auth_village_id()));

-- profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles viewable within village" ON public.profiles
  FOR SELECT USING (village_id = (SELECT public.auth_village_id()));
-- (Users can update / insert own profile policies remain from migration 001.)

-- resident_skills
DROP POLICY IF EXISTS "Resident skills viewable by everyone" ON public.resident_skills;
CREATE POLICY "Resident skills viewable within village" ON public.resident_skills
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p
            WHERE p.id = resident_skills.resident_id AND p.village_id = (SELECT public.auth_village_id()))
  );
-- ("Residents manage own skills" remains.)

-- projects
DROP POLICY IF EXISTS "Projects viewable by everyone" ON public.projects;
DROP POLICY IF EXISTS "Managers can manage projects" ON public.projects;
CREATE POLICY "Projects viewable within village" ON public.projects
  FOR SELECT USING (village_id = (SELECT public.auth_village_id()));
CREATE POLICY "Managers manage village projects" ON public.projects
  FOR ALL USING (
    village_id = (SELECT public.auth_village_id())
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role IN ('manager','admin'))
  )
  WITH CHECK (
    village_id = (SELECT public.auth_village_id())
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role IN ('manager','admin'))
  );

-- project_skill_requirements (scoped through its project)
DROP POLICY IF EXISTS "Project requirements viewable by everyone" ON public.project_skill_requirements;
DROP POLICY IF EXISTS "Managers can manage project requirements" ON public.project_skill_requirements;
CREATE POLICY "Requirements viewable within village" ON public.project_skill_requirements
  FOR SELECT USING (
    project_id IN (SELECT id FROM public.projects WHERE village_id = (SELECT public.auth_village_id()))
  );
CREATE POLICY "Managers manage village requirements" ON public.project_skill_requirements
  FOR ALL USING (
    project_id IN (SELECT id FROM public.projects WHERE village_id = (SELECT public.auth_village_id()))
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role IN ('manager','admin'))
  );

-- assignments
DROP POLICY IF EXISTS "Assignments viewable by involved users" ON public.assignments;
DROP POLICY IF EXISTS "Managers can manage assignments" ON public.assignments;
CREATE POLICY "Assignments viewable within village" ON public.assignments
  FOR SELECT USING (
    project_id IN (SELECT id FROM public.projects WHERE village_id = (SELECT public.auth_village_id()))
    AND (
      resident_id = (SELECT auth.uid())
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role IN ('manager','admin'))
    )
  );
CREATE POLICY "Managers manage village assignments" ON public.assignments
  FOR ALL USING (
    project_id IN (SELECT id FROM public.projects WHERE village_id = (SELECT public.auth_village_id()))
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role IN ('manager','admin'))
  );

-- progress_updates
DROP POLICY IF EXISTS "Progress viewable by involved users" ON public.progress_updates;
CREATE POLICY "Progress viewable within village" ON public.progress_updates
  FOR SELECT USING (
    assignment_id IN (
      SELECT a.id FROM public.assignments a
      JOIN public.projects p ON p.id = a.project_id
      WHERE p.village_id = (SELECT public.auth_village_id())
    )
    AND (
      reported_by = (SELECT auth.uid())
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role IN ('manager','admin'))
    )
  );
-- ("Workers can report progress" INSERT remains.)

-- revenue_records
DROP POLICY IF EXISTS "Revenue viewable by managers" ON public.revenue_records;
DROP POLICY IF EXISTS "Managers can record revenue" ON public.revenue_records;
CREATE POLICY "Revenue viewable by village managers" ON public.revenue_records
  FOR SELECT USING (
    project_id IN (SELECT id FROM public.projects WHERE village_id = (SELECT public.auth_village_id()))
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role IN ('manager','admin'))
  );
CREATE POLICY "Managers record village revenue" ON public.revenue_records
  FOR ALL USING (
    project_id IN (SELECT id FROM public.projects WHERE village_id = (SELECT public.auth_village_id()))
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role IN ('manager','admin'))
  );

-- notifications: fix the WITH CHECK(true) INSERT hole (managers/admins only)
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Managers can create notifications" ON public.notifications;
CREATE POLICY "Managers create notifications" ON public.notifications
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role IN ('manager','admin'))
  );
