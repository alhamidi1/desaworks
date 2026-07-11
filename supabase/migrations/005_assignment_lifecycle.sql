-- 005_assignment_lifecycle
-- Atomic project-status change that cascades the assignment lifecycle, so the
-- active/completed states the metrics depend on are actually produced in real use.
--
--   project -> in_progress : confirmed assignments become 'active'
--   project -> completed   : confirmed/active assignments become 'completed' (+ completed_at)
--   project -> cancelled   : pending/confirmed/active assignments become 'void'
--
-- SECURITY INVOKER: runs as the caller, so RLS applies (only managers/admins can
-- update projects+assignments). The whole function body is one transaction.

CREATE OR REPLACE FUNCTION public.set_project_status(
  p_project_id uuid,
  p_status public.project_status
)
RETURNS public.projects
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  result public.projects;
BEGIN
  UPDATE public.projects SET status = p_status
    WHERE id = p_project_id
    RETURNING * INTO result;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Project % not found', p_project_id USING ERRCODE = 'no_data_found';
  END IF;

  IF p_status = 'in_progress' THEN
    UPDATE public.assignments SET status = 'active'
      WHERE project_id = p_project_id AND status = 'confirmed';
  ELSIF p_status = 'completed' THEN
    UPDATE public.assignments SET status = 'completed', completed_at = now()
      WHERE project_id = p_project_id AND status IN ('confirmed','active');
  ELSIF p_status = 'cancelled' THEN
    UPDATE public.assignments SET status = 'void'
      WHERE project_id = p_project_id AND status IN ('pending','confirmed','active');
  END IF;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_project_status(uuid, public.project_status) TO authenticated;
