-- 006_complete_assignment
-- Completing an assignment must be doable by (a) a manager/admin, or (b) the
-- assigned resident themselves when they report 100% progress. RLS blocks
-- residents from updating the assignments table directly, so this SECURITY DEFINER
-- function performs the transition with an explicit in-body authorization check.

CREATE OR REPLACE FUNCTION public.complete_assignment(p_assignment_id uuid)
RETURNS public.assignments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  a public.assignments;
  caller uuid := auth.uid();
  caller_role public.user_role;
BEGIN
  SELECT role INTO caller_role FROM public.profiles WHERE id = caller;
  SELECT * INTO a FROM public.assignments WHERE id = p_assignment_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Assignment not found' USING ERRCODE = 'no_data_found';
  END IF;

  -- Only the assigned resident or a manager/admin may complete it.
  IF NOT (caller = a.resident_id OR caller_role IN ('manager','admin')) THEN
    RAISE EXCEPTION 'Not authorized to complete this assignment' USING ERRCODE = 'insufficient_privilege';
  END IF;

  IF a.status IN ('confirmed','active') THEN
    UPDATE public.assignments
      SET status = 'completed', completed_at = now()
      WHERE id = p_assignment_id
      RETURNING * INTO a;
  END IF;

  RETURN a;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.complete_assignment(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.complete_assignment(uuid) TO authenticated;
