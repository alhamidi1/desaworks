-- seed_v2.sql — realistic DesaWorks demo data
-- Replaces the earlier seed whose revenue reached ~IDR 1 trillion. Keeps existing
-- auth users/profiles/skills/villages; reseeds all transactional data at village scale
-- (budgets ~5M–200M IDR), with a full lifecycle spread and ~90 extra projects for
-- chart-density testing. Idempotent-ish: clears transactional tables first.

DELETE FROM public.notifications;
DELETE FROM public.resident_skills;
DELETE FROM public.projects; -- cascades assignments, progress_updates, revenue_records, requirements

DO $$
DECLARE
  v_village uuid := '11111111-1111-1111-1111-111111111111';
  v_mgr uuid;
  v_res uuid[];
  v_skill uuid[];
  pid uuid;
  n int;
  rcount int;
BEGIN
  SELECT id INTO v_mgr FROM public.profiles WHERE role IN ('manager','admin') ORDER BY created_at LIMIT 1;
  SELECT array_agg(id) INTO v_res FROM public.profiles WHERE role = 'resident';
  SELECT array_agg(id) INTO v_skill FROM public.skills;

  -- Give every resident 3 random skills so the recommender has data.
  FOR n IN 1..array_length(v_res, 1) LOOP
    INSERT INTO public.resident_skills (resident_id, skill_id, experience_years, proficiency_level)
    SELECT v_res[n], s, (1 + floor(random() * 8))::int,
           (ARRAY['beginner','intermediate','advanced'])[1 + floor(random() * 3)]
    FROM (SELECT unnest(v_skill) AS s ORDER BY random() LIMIT 3) sub
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- ── Curated showcase projects (each exercises a specific health/alert state) ──

  -- 1) Completed & profitable
  INSERT INTO public.projects (name, description, created_by, village_id, status, start_date, end_date, budget, workers_needed)
  VALUES ('Digitalisasi Administrasi Desa', 'Sistem administrasi desa berbasis web', v_mgr, v_village, 'completed', current_date - 120, current_date - 30, 25000000, 2)
  RETURNING id INTO pid;
  INSERT INTO public.assignments (project_id, resident_id, assigned_by, status, confirmed_at, completed_at)
  VALUES (pid, v_res[1], v_mgr, 'completed', now() - interval '115 days', now() - interval '30 days'),
         (pid, v_res[2], v_mgr, 'completed', now() - interval '115 days', now() - interval '30 days');
  INSERT INTO public.progress_updates (assignment_id, reported_by, progress_percentage, status, hours_worked, description, created_at)
  SELECT a.id, a.resident_id, 100, 'completed', 40, 'Pekerjaan selesai', now() - interval '31 days' FROM public.assignments a WHERE a.project_id = pid;
  INSERT INTO public.revenue_records (project_id, recorded_by, amount, description, record_date)
  VALUES (pid, v_mgr, 28000000, 'Pembayaran akhir proyek', current_date - 30);

  -- 2) In progress & on-track
  INSERT INTO public.projects (name, description, created_by, village_id, status, start_date, end_date, budget, workers_needed)
  VALUES ('Pengembangan Wisata Sungai Bening', 'Penataan kawasan wisata alam desa', v_mgr, v_village, 'in_progress', current_date - 20, current_date + 40, 120000000, 4)
  RETURNING id INTO pid;
  INSERT INTO public.assignments (project_id, resident_id, assigned_by, status, confirmed_at)
  VALUES (pid, v_res[3], v_mgr, 'active', now() - interval '18 days'),
         (pid, v_res[4], v_mgr, 'active', now() - interval '18 days'),
         (pid, v_res[5], v_mgr, 'active', now() - interval '18 days'),
         (pid, v_res[6], v_mgr, 'confirmed', now() - interval '2 days');
  INSERT INTO public.progress_updates (assignment_id, reported_by, progress_percentage, status, hours_worked, created_at)
  SELECT a.id, a.resident_id, (25 + floor(random() * 20))::int, 'in_progress', 12, now() - interval '3 days' FROM public.assignments a WHERE a.project_id = pid AND a.status = 'active';
  INSERT INTO public.revenue_records (project_id, recorded_by, amount, description, record_date)
  VALUES (pid, v_mgr, 30000000, 'Termin 1', current_date - 10);

  -- 3) DELAYED (behind schedule) + understaffed
  INSERT INTO public.projects (name, description, created_by, village_id, status, start_date, end_date, budget, workers_needed)
  VALUES ('Renovasi Balai Desa', 'Perbaikan gedung balai pertemuan warga', v_mgr, v_village, 'in_progress', current_date - 70, current_date - 5, 75000000, 4)
  RETURNING id INTO pid;
  INSERT INTO public.assignments (project_id, resident_id, assigned_by, status, confirmed_at)
  VALUES (pid, v_res[7], v_mgr, 'active', now() - interval '65 days'),
         (pid, v_res[8], v_mgr, 'active', now() - interval '65 days');
  INSERT INTO public.progress_updates (assignment_id, reported_by, progress_percentage, status, hours_worked, created_at)
  SELECT a.id, a.resident_id, (30 + floor(random() * 10))::int, 'in_progress', 20, now() - interval '12 days' FROM public.assignments a WHERE a.project_id = pid;

  -- 4) OVER-BUDGET (revenue > 150% of budget → warning) + completed
  INSERT INTO public.projects (name, description, created_by, village_id, status, start_date, end_date, budget, workers_needed)
  VALUES ('Program Batik Desa — Ekspor Perdana', 'Produksi dan pemasaran batik khas desa', v_mgr, v_village, 'completed', current_date - 90, current_date - 10, 40000000, 3)
  RETURNING id INTO pid;
  INSERT INTO public.assignments (project_id, resident_id, assigned_by, status, confirmed_at, completed_at)
  VALUES (pid, v_res[9], v_mgr, 'completed', now() - interval '85 days', now() - interval '10 days'),
         (pid, v_res[10], v_mgr, 'completed', now() - interval '85 days', now() - interval '10 days');
  INSERT INTO public.progress_updates (assignment_id, reported_by, progress_percentage, status, hours_worked, created_at)
  SELECT a.id, a.resident_id, 100, 'completed', 60, now() - interval '11 days' FROM public.assignments a WHERE a.project_id = pid;
  INSERT INTO public.revenue_records (project_id, recorded_by, amount, description, record_date) VALUES
    (pid, v_mgr, 35000000, 'Penjualan batch 1', current_date - 40),
    (pid, v_mgr, 34000000, 'Penjualan batch 2 (ekspor)', current_date - 15);

  -- 5) Open & understaffed (recruiting)
  INSERT INTO public.projects (name, description, created_by, village_id, status, start_date, end_date, budget, workers_needed)
  VALUES ('Pelatihan Pertanian Organik', 'Pelatihan warga untuk pertanian organik', v_mgr, v_village, 'open', current_date + 5, current_date + 65, 30000000, 5)
  RETURNING id INTO pid;
  INSERT INTO public.assignments (project_id, resident_id, assigned_by, status, confirmed_at)
  VALUES (pid, v_res[1], v_mgr, 'confirmed', now() - interval '1 day');

  -- 6) Draft (planning)
  INSERT INTO public.projects (name, description, created_by, village_id, status, start_date, end_date, budget, workers_needed)
  VALUES ('Pengelolaan Sampah Terpadu', 'Sistem pengelolaan sampah tingkat desa', v_mgr, v_village, 'draft', current_date + 30, current_date + 120, 55000000, 3);

  -- ── Large-N portfolio (~90 projects) for chart-density testing ──
  FOR n IN 1..90 LOOP
    INSERT INTO public.projects (name, description, created_by, village_id, status, start_date, end_date, budget, workers_needed)
    VALUES ('Proyek Portofolio ' || lpad(n::text, 3, '0'),
            'Proyek pembangunan/pemberdayaan desa nomor ' || n,
            v_mgr, v_village,
            (ARRAY['draft','open','in_progress','in_progress','completed','cancelled'])[1 + floor(random() * 6)]::public.project_status,
            current_date - (floor(random() * 120))::int,
            current_date + (floor(random() * 90) - 30)::int,
            (5000000 + floor(random() * 150000000))::numeric,
            (1 + floor(random() * 5))::int)
    RETURNING id INTO pid;

    rcount := 1 + floor(random() * 3);
    INSERT INTO public.assignments (project_id, resident_id, assigned_by, status, confirmed_at)
    SELECT pid, r, v_mgr, (ARRAY['confirmed','active','completed'])[1 + floor(random() * 3)]::public.assignment_status, now() - interval '20 days'
    FROM (SELECT unnest(v_res) AS r ORDER BY random() LIMIT rcount) sub
    ON CONFLICT DO NOTHING;

    INSERT INTO public.progress_updates (assignment_id, reported_by, progress_percentage, status, hours_worked, created_at)
    SELECT a.id, a.resident_id, (floor(random() * 101))::int, 'in_progress', (floor(random() * 30))::numeric,
           now() - (floor(random() * 30) || ' days')::interval
    FROM public.assignments a WHERE a.project_id = pid;

    IF random() < 0.5 THEN
      INSERT INTO public.revenue_records (project_id, recorded_by, amount, description, record_date)
      VALUES (pid, v_mgr, (2000000 + floor(random() * 80000000))::numeric, 'Pendapatan proyek', current_date - (floor(random() * 60))::int);
    END IF;
  END LOOP;

  -- Any assignment marked completed needs a completed_at timestamp.
  UPDATE public.assignments SET completed_at = COALESCE(confirmed_at, now()) WHERE status = 'completed' AND completed_at IS NULL;
END $$;
