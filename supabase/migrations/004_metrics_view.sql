-- 004_metrics_view
-- Single source of truth for per-project MIS metrics. Replaces the previous
-- pattern of loading whole tables into JS and recomputing per project (N+1 full scans).
--
-- Definitions here match the V2 metric dictionary:
--   * assigned_workers      = DISTINCT residents on non-void assignments
--   * active_workers        = DISTINCT residents whose assignment is confirmed/active
--   * completion_pct        = weighted: sum(latest progress per non-void assignment)
--                             / slots, where slots = greatest(workers_needed, assignment_count).
--                             Unfilled slots and assignments with no progress count as 0.
--   * revenue_vs_budget_pct = total revenue / budget * 100 (NULL when budget <= 0)  [renamed from "utilization"]
--   * schedule_elapsed_pct  = how far into the planned window we are today (NULL if no valid dates)
--   * health                = RAG from completion vs schedule (on_track / at_risk / delayed)
--
-- security_invoker = on  -> the view obeys the querying user's RLS (managers see all today;
--                            village scoping in Phase 3 will restrict automatically).

CREATE OR REPLACE VIEW public.project_metrics_v
WITH (security_invoker = on) AS
WITH latest_progress AS (
  SELECT DISTINCT ON (pu.assignment_id)
    pu.assignment_id,
    pu.progress_percentage,
    pu.created_at
  FROM public.progress_updates pu
  ORDER BY pu.assignment_id, pu.created_at DESC
),
assignment_progress AS (
  SELECT
    a.project_id,
    a.resident_id,
    a.status,
    COALESCE(lp.progress_percentage, 0) AS latest_pct,
    lp.created_at AS latest_at
  FROM public.assignments a
  LEFT JOIN latest_progress lp ON lp.assignment_id = a.id
  WHERE a.status <> 'void'
),
agg AS (
  SELECT
    project_id,
    COUNT(DISTINCT resident_id) AS assigned_workers,
    COUNT(DISTINCT resident_id) FILTER (WHERE status IN ('confirmed','active')) AS active_workers,
    COUNT(DISTINCT resident_id) FILTER (WHERE status = 'completed') AS completed_workers,
    COUNT(*) AS assignment_count,
    SUM(latest_pct) AS progress_sum,
    MAX(latest_at) AS latest_progress_at
  FROM assignment_progress
  GROUP BY project_id
),
rev AS (
  SELECT project_id, SUM(amount) AS total_revenue, COUNT(*) AS revenue_count
  FROM public.revenue_records
  GROUP BY project_id
),
base AS (
  SELECT
    p.id,
    p.name,
    p.status,
    p.created_by,
    p.start_date,
    p.end_date,
    COALESCE(p.budget, 0)::numeric      AS budget,
    COALESCE(p.workers_needed, 1)       AS workers_needed,
    COALESCE(ag.assigned_workers, 0)    AS assigned_workers,
    COALESCE(ag.active_workers, 0)      AS active_workers,
    COALESCE(ag.completed_workers, 0)   AS completed_workers,
    COALESCE(ag.assignment_count, 0)    AS assignment_count,
    ag.latest_progress_at,
    COALESCE(rev.total_revenue, 0)::numeric AS total_revenue,
    COALESCE(rev.revenue_count, 0)      AS revenue_count,
    CASE
      WHEN GREATEST(COALESCE(p.workers_needed, 1), COALESCE(ag.assignment_count, 0)) = 0 THEN 0
      ELSE ROUND(
        COALESCE(ag.progress_sum, 0)::numeric
        / GREATEST(COALESCE(p.workers_needed, 1), COALESCE(ag.assignment_count, 0)),
        1)
    END AS completion_pct,
    CASE
      WHEN COALESCE(p.budget, 0) <= 0 THEN NULL
      ELSE ROUND(COALESCE(rev.total_revenue, 0)::numeric / p.budget * 100, 1)
    END AS revenue_vs_budget_pct,
    CASE
      WHEN p.start_date IS NULL OR p.end_date IS NULL OR p.end_date <= p.start_date THEN NULL
      ELSE GREATEST(0, LEAST(100, ROUND(
        (CURRENT_DATE - p.start_date)::numeric / NULLIF((p.end_date - p.start_date), 0) * 100, 1)))
    END AS schedule_elapsed_pct
  FROM public.projects p
  LEFT JOIN agg AS ag ON ag.project_id = p.id
  LEFT JOIN rev ON rev.project_id = p.id
)
SELECT
  b.*,
  CASE
    WHEN b.status = 'completed'                     THEN 'completed'
    WHEN b.status IN ('draft','cancelled')          THEN 'inactive'
    WHEN b.schedule_elapsed_pct IS NULL             THEN 'on_track'
    WHEN b.completion_pct >= b.schedule_elapsed_pct - 10 THEN 'on_track'
    WHEN b.completion_pct >= b.schedule_elapsed_pct - 25 THEN 'at_risk'
    ELSE 'delayed'
  END AS health,
  (b.status NOT IN ('draft','completed','cancelled') AND b.active_workers < b.workers_needed) AS understaffed
FROM base b;

GRANT SELECT ON public.project_metrics_v TO authenticated;
