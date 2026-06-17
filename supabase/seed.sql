-- ============================================================
-- DesaWorks Mock Seed Data
-- Run this in the Supabase SQL Editor AFTER the schema migration.
-- ============================================================
-- IMPORTANT: This script inserts directly into auth.users so that
-- the RLS on profiles (which requires auth.uid() = id) is satisfied.
-- All passwords are: Password123!
-- ============================================================

-- ============================================================
-- STEP 1: Create mock users in auth.users
-- ============================================================

-- Manager
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin
) VALUES (
  'a1000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'manager@desaworks.test',
  crypt('Password123!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Budi Santoso"}',
  false
) ON CONFLICT (id) DO NOTHING;

-- Residents (10 people)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin) VALUES
  ('a1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'siti.rahma@desaworks.test',    crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Siti Rahma"}',      false),
  ('a1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ahmad.fauzi@desaworks.test',    crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ahmad Fauzi"}',     false),
  ('a1000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'dewi.kartika@desaworks.test',   crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Dewi Kartika"}',    false),
  ('a1000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rizki.pratama@desaworks.test',  crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Rizki Pratama"}',   false),
  ('a1000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'nur.aini@desaworks.test',       crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Nur Aini"}',        false),
  ('a1000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hendra.wijaya@desaworks.test',  crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Hendra Wijaya"}',   false),
  ('a1000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rina.susanti@desaworks.test',   crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Rina Susanti"}',    false),
  ('a1000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'dian.permana@desaworks.test',   crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Dian Permana"}',    false),
  ('a1000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'yusuf.hakim@desaworks.test',    crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Yusuf Hakim"}',     false),
  ('a1000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'maya.lestari@desaworks.test',   crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Maya Lestari"}',    false)
ON CONFLICT (id) DO NOTHING;

-- Link identities so the users can log in via GoTrue / Supabase Auth
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT 
  id,
  id,
  jsonb_build_object('sub', id::text, 'email', email),
  'email',
  id::text,
  now(),
  now(),
  now()
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STEP 2: Profiles
-- ============================================================

INSERT INTO profiles (id, full_name, email, phone, address, role, availability, bio, agreed_to_tos, agreed_to_privacy) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Budi Santoso',   'manager@desaworks.test',       '081200000001', 'Jl. Merdeka No. 1, Desa Sukamaju',      'manager',  'available', 'Kepala Desa Sukamaju dengan pengalaman 10 tahun.', true, true),
  ('a1000000-0000-0000-0000-000000000002', 'Siti Rahma',     'siti.rahma@desaworks.test',    '081200000002', 'Jl. Kamboja No. 5, Desa Sukamaju',      'resident', 'available', 'Petani dan pengrajin berpengalaman.', true, true),
  ('a1000000-0000-0000-0000-000000000003', 'Ahmad Fauzi',    'ahmad.fauzi@desaworks.test',   '081200000003', 'Jl. Mawar No. 12, Desa Sukamaju',       'resident', 'available', 'Tukang kayu dan bangunan.', true, true),
  ('a1000000-0000-0000-0000-000000000004', 'Dewi Kartika',   'dewi.kartika@desaworks.test',  '081200000004', 'Jl. Melati No. 3, Desa Sukamaju',       'resident', 'available', 'Ahli keuangan dan administrasi desa.', true, true),
  ('a1000000-0000-0000-0000-000000000005', 'Rizki Pratama',  'rizki.pratama@desaworks.test', '081200000005', 'Jl. Anggrek No. 8, Desa Sukamaju',      'resident', 'available', 'Teknisi listrik dan IT.', true, true),
  ('a1000000-0000-0000-0000-000000000006', 'Nur Aini',       'nur.aini@desaworks.test',      '081200000006', 'Jl. Dahlia No. 7, Desa Sukamaju',       'resident', 'available', 'Pengrajin batik dan penjahit.', true, true),
  ('a1000000-0000-0000-0000-000000000007', 'Hendra Wijaya',  'hendra.wijaya@desaworks.test', '081200000007', 'Jl. Flamboyan No. 2, Desa Sukamaju',    'resident', 'available', 'Petani dan pengelola ternak.', true, true),
  ('a1000000-0000-0000-0000-000000000008', 'Rina Susanti',   'rina.susanti@desaworks.test',  '081200000008', 'Jl. Kenanga No. 15, Desa Sukamaju',     'resident', 'unavailable', 'Pedagang makanan dan juru masak.', true, true),
  ('a1000000-0000-0000-0000-000000000009', 'Dian Permana',   'dian.permana@desaworks.test',  '081200000009', 'Jl. Teratai No. 4, Desa Sukamaju',      'resident', 'available', 'Pengemudi dan koordinator logistik.', true, true),
  ('a1000000-0000-0000-0000-000000000010', 'Yusuf Hakim',    'yusuf.hakim@desaworks.test',   '081200000010', 'Jl. Cempaka No. 9, Desa Sukamaju',      'resident', 'available', 'Pemandu wisata dan petugas kesehatan.', true, true),
  ('a1000000-0000-0000-0000-000000000011', 'Maya Lestari',   'maya.lestari@desaworks.test',  '081200000011', 'Jl. Seruni No. 6, Desa Sukamaju',       'resident', 'available', 'Guru dan pengajar pelatihan.', true, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STEP 3: Assign skills to residents (using skills seeded in schema)
-- ============================================================

DO $$
DECLARE
  skill_agriculture        UUID;
  skill_animal_husbandry   UUID;
  skill_fisheries          UUID;
  skill_accounting         UUID;
  skill_financial_rpt      UUID;
  skill_carpentry          UUID;
  skill_masonry            UUID;
  skill_electrical         UUID;
  skill_plumbing           UUID;
  skill_cooking            UUID;
  skill_food_processing    UUID;
  skill_tourism            UUID;
  skill_handicrafts        UUID;
  skill_sewing             UUID;
  skill_driving            UUID;
  skill_it                 UUID;
  skill_marketing          UUID;
  skill_leadership         UUID;
  skill_teaching           UUID;
  skill_healthcare         UUID;
BEGIN
  SELECT id INTO skill_agriculture      FROM skills WHERE name = 'Agriculture';
  SELECT id INTO skill_animal_husbandry FROM skills WHERE name = 'Animal Husbandry';
  SELECT id INTO skill_fisheries        FROM skills WHERE name = 'Fisheries';
  SELECT id INTO skill_accounting       FROM skills WHERE name = 'Basic Accounting';
  SELECT id INTO skill_financial_rpt    FROM skills WHERE name = 'Financial Reporting';
  SELECT id INTO skill_carpentry        FROM skills WHERE name = 'Carpentry';
  SELECT id INTO skill_masonry          FROM skills WHERE name = 'Masonry';
  SELECT id INTO skill_electrical       FROM skills WHERE name = 'Electrical Work';
  SELECT id INTO skill_plumbing         FROM skills WHERE name = 'Plumbing';
  SELECT id INTO skill_cooking          FROM skills WHERE name = 'Cooking';
  SELECT id INTO skill_food_processing  FROM skills WHERE name = 'Food Processing';
  SELECT id INTO skill_tourism          FROM skills WHERE name = 'Tourism Guiding';
  SELECT id INTO skill_handicrafts      FROM skills WHERE name = 'Handicrafts';
  SELECT id INTO skill_sewing           FROM skills WHERE name = 'Sewing';
  SELECT id INTO skill_driving          FROM skills WHERE name = 'Driving';
  SELECT id INTO skill_it               FROM skills WHERE name = 'IT Skills';
  SELECT id INTO skill_marketing        FROM skills WHERE name = 'Marketing';
  SELECT id INTO skill_leadership       FROM skills WHERE name = 'Leadership';
  SELECT id INTO skill_teaching         FROM skills WHERE name = 'Teaching';
  SELECT id INTO skill_healthcare       FROM skills WHERE name = 'Healthcare';

  -- Siti Rahma: Agriculture (advanced), Handicrafts (intermediate), Marketing (beginner)
  INSERT INTO resident_skills (resident_id, skill_id, experience_years, proficiency_level) VALUES
    ('a1000000-0000-0000-0000-000000000002', skill_agriculture,  8, 'advanced'),
    ('a1000000-0000-0000-0000-000000000002', skill_handicrafts,  5, 'intermediate'),
    ('a1000000-0000-0000-0000-000000000002', skill_marketing,    2, 'beginner')
  ON CONFLICT DO NOTHING;

  -- Ahmad Fauzi: Carpentry (advanced), Masonry (intermediate), Plumbing (beginner)
  INSERT INTO resident_skills (resident_id, skill_id, experience_years, proficiency_level) VALUES
    ('a1000000-0000-0000-0000-000000000003', skill_carpentry, 10, 'advanced'),
    ('a1000000-0000-0000-0000-000000000003', skill_masonry,    6, 'intermediate'),
    ('a1000000-0000-0000-0000-000000000003', skill_plumbing,   2, 'beginner')
  ON CONFLICT DO NOTHING;

  -- Dewi Kartika: Basic Accounting (advanced), Financial Reporting (advanced), Leadership (intermediate)
  INSERT INTO resident_skills (resident_id, skill_id, experience_years, proficiency_level) VALUES
    ('a1000000-0000-0000-0000-000000000004', skill_accounting,    7, 'advanced'),
    ('a1000000-0000-0000-0000-000000000004', skill_financial_rpt, 5, 'advanced'),
    ('a1000000-0000-0000-0000-000000000004', skill_leadership,    3, 'intermediate')
  ON CONFLICT DO NOTHING;

  -- Rizki Pratama: IT Skills (advanced), Electrical Work (intermediate), Marketing (intermediate)
  INSERT INTO resident_skills (resident_id, skill_id, experience_years, proficiency_level) VALUES
    ('a1000000-0000-0000-0000-000000000005', skill_it,         4, 'advanced'),
    ('a1000000-0000-0000-0000-000000000005', skill_electrical,  3, 'intermediate'),
    ('a1000000-0000-0000-0000-000000000005', skill_marketing,   2, 'intermediate')
  ON CONFLICT DO NOTHING;

  -- Nur Aini: Sewing (advanced), Handicrafts (advanced), Food Processing (beginner)
  INSERT INTO resident_skills (resident_id, skill_id, experience_years, proficiency_level) VALUES
    ('a1000000-0000-0000-0000-000000000006', skill_sewing,          9, 'advanced'),
    ('a1000000-0000-0000-0000-000000000006', skill_handicrafts,     6, 'advanced'),
    ('a1000000-0000-0000-0000-000000000006', skill_food_processing,  1, 'beginner')
  ON CONFLICT DO NOTHING;

  -- Hendra Wijaya: Agriculture (advanced), Animal Husbandry (advanced), Fisheries (intermediate)
  INSERT INTO resident_skills (resident_id, skill_id, experience_years, proficiency_level) VALUES
    ('a1000000-0000-0000-0000-000000000007', skill_agriculture,     12, 'advanced'),
    ('a1000000-0000-0000-0000-000000000007', skill_animal_husbandry, 8, 'advanced'),
    ('a1000000-0000-0000-0000-000000000007', skill_fisheries,        4, 'intermediate')
  ON CONFLICT DO NOTHING;

  -- Rina Susanti (unavailable): Cooking (advanced), Food Processing (advanced), Marketing (intermediate)
  INSERT INTO resident_skills (resident_id, skill_id, experience_years, proficiency_level) VALUES
    ('a1000000-0000-0000-0000-000000000008', skill_cooking,          7, 'advanced'),
    ('a1000000-0000-0000-0000-000000000008', skill_food_processing,  5, 'advanced'),
    ('a1000000-0000-0000-0000-000000000008', skill_marketing,        3, 'intermediate')
  ON CONFLICT DO NOTHING;

  -- Dian Permana: Driving (advanced), Leadership (beginner), Basic Accounting (beginner)
  INSERT INTO resident_skills (resident_id, skill_id, experience_years, proficiency_level) VALUES
    ('a1000000-0000-0000-0000-000000000009', skill_driving,     6, 'advanced'),
    ('a1000000-0000-0000-0000-000000000009', skill_leadership,  1, 'beginner'),
    ('a1000000-0000-0000-0000-000000000009', skill_accounting,  1, 'beginner')
  ON CONFLICT DO NOTHING;

  -- Yusuf Hakim: Tourism Guiding (advanced), Healthcare (intermediate), Driving (intermediate)
  INSERT INTO resident_skills (resident_id, skill_id, experience_years, proficiency_level) VALUES
    ('a1000000-0000-0000-0000-000000000010', skill_tourism,    5, 'advanced'),
    ('a1000000-0000-0000-0000-000000000010', skill_healthcare, 3, 'intermediate'),
    ('a1000000-0000-0000-0000-000000000010', skill_driving,    4, 'intermediate')
  ON CONFLICT DO NOTHING;

  -- Maya Lestari: Teaching (advanced), Leadership (advanced), IT Skills (intermediate)
  INSERT INTO resident_skills (resident_id, skill_id, experience_years, proficiency_level) VALUES
    ('a1000000-0000-0000-0000-000000000011', skill_teaching,   8, 'advanced'),
    ('a1000000-0000-0000-0000-000000000011', skill_leadership, 5, 'advanced'),
    ('a1000000-0000-0000-0000-000000000011', skill_it,         2, 'intermediate')
  ON CONFLICT DO NOTHING;
END $$;

-- ============================================================
-- STEP 4: Projects
-- ============================================================

INSERT INTO projects (id, name, description, created_by, status, start_date, end_date, budget, actual_revenue, workers_needed) VALUES
  (
    'b1000000-0000-0000-0000-000000000001',
    'Renovasi Balai Desa',
    'Renovasi dan pengecatan ulang balai desa termasuk perbaikan atap, lantai, dan instalasi listrik baru.',
    'a1000000-0000-0000-0000-000000000001',
    'in_progress',
    '2026-05-01', '2026-07-31',
    75000000, 45000000, 4
  ),
  (
    'b1000000-0000-0000-0000-000000000002',
    'Pengembangan Wisata Alam Sungai Bening',
    'Pembangunan fasilitas wisata tepi sungai termasuk gazebo, jalur jalan, dan pusat informasi wisata.',
    'a1000000-0000-0000-0000-000000000001',
    'open',
    '2026-07-01', '2026-10-31',
    120000000, 0, 5
  ),
  (
    'b1000000-0000-0000-0000-000000000003',
    'Program Batik Desa — Ekspor Perdana',
    'Produksi 500 lembar kain batik tulis khas Desa Sukamaju untuk diekspor ke pasar luar daerah.',
    'a1000000-0000-0000-0000-000000000001',
    'in_progress',
    '2026-04-15', '2026-06-30',
    40000000, 28500000, 3
  ),
  (
    'b1000000-0000-0000-0000-000000000004',
    'Digitalisasi Administrasi Desa',
    'Implementasi sistem administrasi digital untuk pencatatan KTP, KK, dan surat menyurat desa.',
    'a1000000-0000-0000-0000-000000000001',
    'completed',
    '2026-02-01', '2026-04-30',
    25000000, 25000000, 2
  ),
  (
    'b1000000-0000-0000-0000-000000000005',
    'Pelatihan Pertanian Organik',
    'Program pelatihan dan pendampingan pertanian organik untuk 20 petani desa selama 3 bulan.',
    'a1000000-0000-0000-0000-000000000001',
    'draft',
    '2026-08-01', '2026-10-31',
    30000000, 0, 3
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STEP 5: Project Skill Requirements
-- ============================================================

DO $$
DECLARE
  skill_carpentry   UUID;
  skill_masonry     UUID;
  skill_electrical  UUID;
  skill_leadership  UUID;
  skill_tourism     UUID;
  skill_handicrafts UUID;
  skill_sewing      UUID;
  skill_marketing   UUID;
  skill_it          UUID;
  skill_accounting  UUID;
  skill_agriculture UUID;
  skill_teaching    UUID;
BEGIN
  SELECT id INTO skill_carpentry   FROM skills WHERE name = 'Carpentry';
  SELECT id INTO skill_masonry     FROM skills WHERE name = 'Masonry';
  SELECT id INTO skill_electrical  FROM skills WHERE name = 'Electrical Work';
  SELECT id INTO skill_leadership  FROM skills WHERE name = 'Leadership';
  SELECT id INTO skill_tourism     FROM skills WHERE name = 'Tourism Guiding';
  SELECT id INTO skill_handicrafts FROM skills WHERE name = 'Handicrafts';
  SELECT id INTO skill_sewing      FROM skills WHERE name = 'Sewing';
  SELECT id INTO skill_marketing   FROM skills WHERE name = 'Marketing';
  SELECT id INTO skill_it          FROM skills WHERE name = 'IT Skills';
  SELECT id INTO skill_accounting  FROM skills WHERE name = 'Basic Accounting';
  SELECT id INTO skill_agriculture FROM skills WHERE name = 'Agriculture';
  SELECT id INTO skill_teaching    FROM skills WHERE name = 'Teaching';

  -- Project 1: Renovasi Balai Desa
  INSERT INTO project_skill_requirements (project_id, skill_id, min_proficiency, workers_needed) VALUES
    ('b1000000-0000-0000-0000-000000000001', skill_carpentry,  'intermediate', 2),
    ('b1000000-0000-0000-0000-000000000001', skill_masonry,    'intermediate', 1),
    ('b1000000-0000-0000-0000-000000000001', skill_electrical, 'beginner',     1)
  ON CONFLICT DO NOTHING;

  -- Project 2: Wisata Alam
  INSERT INTO project_skill_requirements (project_id, skill_id, min_proficiency, workers_needed) VALUES
    ('b1000000-0000-0000-0000-000000000002', skill_tourism,    'intermediate', 2),
    ('b1000000-0000-0000-0000-000000000002', skill_carpentry,  'beginner',     2),
    ('b1000000-0000-0000-0000-000000000002', skill_marketing,  'beginner',     1)
  ON CONFLICT DO NOTHING;

  -- Project 3: Batik Desa
  INSERT INTO project_skill_requirements (project_id, skill_id, min_proficiency, workers_needed) VALUES
    ('b1000000-0000-0000-0000-000000000003', skill_handicrafts, 'advanced',     2),
    ('b1000000-0000-0000-0000-000000000003', skill_sewing,      'intermediate', 1),
    ('b1000000-0000-0000-0000-000000000003', skill_marketing,   'beginner',     1)
  ON CONFLICT DO NOTHING;

  -- Project 4: Digitalisasi (completed)
  INSERT INTO project_skill_requirements (project_id, skill_id, min_proficiency, workers_needed) VALUES
    ('b1000000-0000-0000-0000-000000000004', skill_it,         'advanced',     1),
    ('b1000000-0000-0000-0000-000000000004', skill_accounting, 'intermediate', 1)
  ON CONFLICT DO NOTHING;

  -- Project 5: Pelatihan Pertanian (draft)
  INSERT INTO project_skill_requirements (project_id, skill_id, min_proficiency, workers_needed) VALUES
    ('b1000000-0000-0000-0000-000000000005', skill_agriculture, 'advanced',     2),
    ('b1000000-0000-0000-0000-000000000005', skill_teaching,    'intermediate', 1)
  ON CONFLICT DO NOTHING;
END $$;

-- ============================================================
-- STEP 6: Assignments
-- ============================================================

INSERT INTO assignments (id, project_id, resident_id, assigned_by, status, assigned_at, confirmed_at, completed_at, notes) VALUES
  -- Project 1: Renovasi Balai Desa
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'active',     '2026-05-01 08:00:00+07', '2026-05-02 09:00:00+07', NULL, 'Tukang kayu utama, bertanggung jawab atas perbaikan pintu dan jendela.'),
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'active',     '2026-05-01 08:00:00+07', '2026-05-02 09:00:00+07', NULL, 'Instalasi listrik dan pencahayaan baru.'),
  ('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000001', 'confirmed',  '2026-05-05 08:00:00+07', '2026-05-06 08:00:00+07', NULL, 'Koordinator logistik material bangunan.'),

  -- Project 3: Batik Desa
  ('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', 'active',     '2026-04-15 08:00:00+07', '2026-04-16 09:00:00+07', NULL, 'Pengrajin batik utama, memimpin tim produksi.'),
  ('c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'active',     '2026-04-15 08:00:00+07', '2026-04-16 09:00:00+07', NULL, 'Pembuatan pola dan pewarnaan.'),

  -- Project 4: Digitalisasi (completed)
  ('c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'completed',  '2026-02-01 08:00:00+07', '2026-02-02 09:00:00+07', '2026-04-28 16:00:00+07', 'Pengembangan sistem dan pelatihan staf.'),
  ('c1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'completed',  '2026-02-01 08:00:00+07', '2026-02-02 09:00:00+07', '2026-04-28 16:00:00+07', 'Pengelolaan data dan rekonsiliasi administrasi.')
ON CONFLICT (project_id, resident_id) DO NOTHING;

-- ============================================================
-- STEP 7: Progress Updates
-- ============================================================

INSERT INTO progress_updates (assignment_id, reported_by, progress_percentage, status, description, hours_worked, created_at) VALUES
  -- Ahmad Fauzi on Renovasi
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003', 25, 'in_progress', 'Pembongkaran pintu lama selesai. Pengukuran untuk kusen baru sudah dilakukan.', 24.0, '2026-05-08 17:00:00+07'),
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003', 55, 'in_progress', 'Pemasangan kusen baru selesai. Sedang dalam proses pemasangan daun pintu dan jendela.', 40.0, '2026-05-22 17:00:00+07'),
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003', 75, 'in_progress', 'Semua pintu dan jendela terpasang. Sedang pengecatan dan finishing kayu.', 56.0, '2026-06-05 17:00:00+07'),

  -- Rizki Pratama on Renovasi
  ('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000005', 30, 'in_progress', 'Pemetaan jalur kabel lama selesai. Pembuatan jalur kabel baru dimulai.', 20.0, '2026-05-10 17:00:00+07'),
  ('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000005', 70, 'in_progress', 'Instalasi panel listrik baru selesai. Sedang pemasangan titik lampu dan stop kontak.', 45.0, '2026-05-28 17:00:00+07'),

  -- Nur Aini on Batik Desa
  ('c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000006', 40, 'in_progress', 'Pembuatan pola untuk 200 lembar kain selesai. Proses pengecapan dimulai.', 35.0, '2026-05-01 17:00:00+07'),
  ('c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000006', 80, 'in_progress', 'Pengecapan 400 lembar selesai. Proses pewarnaan dan penjemutan sedang berlangsung.', 70.0, '2026-06-01 17:00:00+07'),

  -- Siti Rahma on Batik Desa
  ('c1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002', 50, 'in_progress', 'Selesai membuat 250 pola dasar. Membantu proses perendaman malam.', 42.0, '2026-05-20 17:00:00+07'),

  -- Digitalisasi (completed)
  ('c1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000005', 100, 'completed', 'Sistem sepenuhnya live. Semua staf desa sudah dilatih. Migrasi data lama selesai 100%.', 120.0, '2026-04-28 15:00:00+07'),
  ('c1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000004', 100, 'completed', 'Rekonsiliasi data KTP dan KK selesai. Laporan keuangan digital Q1 2026 sudah dibuat.', 95.0, '2026-04-28 15:00:00+07')
ON CONFLICT DO NOTHING;

-- ============================================================
-- STEP 8: Revenue Records
-- ============================================================

INSERT INTO revenue_records (project_id, recorded_by, amount, description, record_date) VALUES
  -- Renovasi Balai Desa (in_progress — partial)
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 20000000, 'Termin 1: Dana tahap awal dari anggaran desa', '2026-05-01'),
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 25000000, 'Termin 2: Dana tahap kedua setelah verifikasi progres 50%', '2026-06-01'),

  -- Batik Desa (in_progress — partial)
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 15000000, 'Pembayaran DP dari pembeli perdana (Toko Batik Nusantara)', '2026-04-20'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 13500000, 'Pelunasan 300 lembar kain batch pertama', '2026-05-30'),

  -- Digitalisasi (completed — full)
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 10000000, 'Termin 1: Dana hibah digitalisasi dari Pemkab', '2026-02-01'),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 15000000, 'Termin 2: Pencairan sisa hibah setelah sistem live', '2026-04-28')
ON CONFLICT DO NOTHING;

-- ============================================================
-- DONE!
-- ============================================================
-- Accounts created (all passwords: Password123!):
--   Manager : manager@desaworks.test
--   Residents: siti.rahma@desaworks.test, ahmad.fauzi@desaworks.test,
--              dewi.kartika@desaworks.test, rizki.pratama@desaworks.test,
--              nur.aini@desaworks.test, hendra.wijaya@desaworks.test,
--              rina.susanti@desaworks.test (unavailable),
--              dian.permana@desaworks.test, yusuf.hakim@desaworks.test,
--              maya.lestari@desaworks.test
-- ============================================================
