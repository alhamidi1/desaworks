-- 003_foundation_auth_and_perf
-- Foundation fixes for DesaWorks V2:
--   (1) Auto-create a profile row when an auth user is created  -> fixes registration
--       (self-registered residents previously could never get a profile / log in).
--   (2) Covering indexes for the unindexed foreign keys flagged by the performance advisor.
--   (3) Pin search_path on the updated_at trigger function (security advisor).
--
-- SECURITY NOTE: handle_new_user() ALWAYS sets role = 'resident'. It never reads a role
-- from client-supplied signup metadata, so a self-signup cannot escalate to manager/admin.
-- Managers/admins are promoted separately by an existing manager/admin (see Phase 2 invite flow).

-- ============================================================================
-- (1) handle_new_user: create profiles row on auth.users INSERT
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, role, agreed_to_tos, agreed_to_privacy)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''), split_part(NEW.email, '@', 1)),
    NEW.email,
    NULLIF(TRIM(NEW.raw_user_meta_data->>'phone'), ''),
    'resident',  -- never trust a client-provided role
    COALESCE((NEW.raw_user_meta_data->>'agreed_to_tos')::boolean, FALSE),
    COALESCE((NEW.raw_user_meta_data->>'agreed_to_privacy')::boolean, FALSE)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- A trigger function must not be callable through the PostgREST API surface.
-- (The trigger still fires; triggers ignore EXECUTE grants.)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;

-- ============================================================================
-- (2) Covering indexes for unindexed foreign keys
--     (project_id/resident_id FKs are already covered by their UNIQUE indexes;
--      these are the remaining uncovered FK columns.)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_assignments_assigned_by ON public.assignments(assigned_by);
CREATE INDEX IF NOT EXISTS idx_progress_reported_by    ON public.progress_updates(reported_by);
CREATE INDEX IF NOT EXISTS idx_revenue_recorded_by     ON public.revenue_records(recorded_by);
CREATE INDEX IF NOT EXISTS idx_psr_skill              ON public.project_skill_requirements(skill_id);

-- ============================================================================
-- (3) Pin search_path on the updated_at trigger function
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Refresh planner statistics (tables were never ANALYZEd; estimates were stale).
ANALYZE public.profiles, public.projects, public.assignments,
        public.progress_updates, public.revenue_records;
