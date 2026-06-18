-- =============================================================================
-- VoteInfoFrance — Sample vote data for map visualization
-- Adds real French regions/depts/communes + 30 fake voters with votes
-- on national and european propositions so the choropleth map is populated.
-- Safe to re-run (ON CONFLICT DO NOTHING throughout).
-- =============================================================================

-- ── 1. Real geographic data (minimal — one commune per dept) ─────────────────

INSERT INTO regions (code, nom) VALUES
  ('11', 'Île-de-France'),
  ('28', 'Normandie'),
  ('32', 'Hauts-de-France'),
  ('44', 'Grand Est'),
  ('52', 'Pays de la Loire'),
  ('75', 'Nouvelle-Aquitaine'),
  ('76', 'Occitanie'),
  ('84', 'Auvergne-Rhône-Alpes'),
  ('93', 'Provence-Alpes-Côte d''Azur')
ON CONFLICT (code) DO NOTHING;

INSERT INTO departements (code, nom, code_region) VALUES
  ('06', 'Alpes-Maritimes',  '93'),
  ('13', 'Bouches-du-Rhône', '93'),
  ('14', 'Calvados',         '28'),
  ('31', 'Haute-Garonne',    '76'),
  ('33', 'Gironde',          '75'),
  ('44', 'Loire-Atlantique', '52'),
  ('59', 'Nord',             '32'),
  ('67', 'Bas-Rhin',         '44'),
  ('69', 'Rhône',            '84'),
  ('75', 'Paris',            '11'),
  ('76', 'Seine-Maritime',   '28')
ON CONFLICT (code) DO NOTHING;

INSERT INTO communes (code_insee, nom, code_postal, code_dept) VALUES
  ('06088', 'Nice',        ARRAY['06000','06100','06200','06300'],   '06'),
  ('13055', 'Marseille',   ARRAY['13001','13002','13013','13014'],   '13'),
  ('14118', 'Caen',        ARRAY['14000'],                          '14'),
  ('31555', 'Toulouse',    ARRAY['31000','31100','31200','31300'],   '31'),
  ('33063', 'Bordeaux',    ARRAY['33000','33100','33200','33300'],   '33'),
  ('44109', 'Nantes',      ARRAY['44000','44100','44200','44300'],   '44'),
  ('59350', 'Lille',       ARRAY['59000','59160','59800'],           '59'),
  ('67482', 'Strasbourg',  ARRAY['67000','67100','67200'],           '67'),
  ('69123', 'Lyon',        ARRAY['69001','69002','69003','69006'],   '69'),
  ('75056', 'Paris',       ARRAY['75001','75008','75015','75016'],   '75'),
  ('76540', 'Rouen',       ARRAY['76000','76100'],                   '76')
ON CONFLICT (code_insee) DO NOTHING;

-- ── 2. Fake auth users (no password — test only) ─────────────────────────────
-- IDs follow pattern 00000000-0000-0000-0000-0000000000XX (01–30)
-- These rows are inert — they have no password and can never log in.

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, role, aud, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin
) VALUES
  -- Paris (75) — users 01-03
  ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','voter01@test.vif','',now(),'authenticated','authenticated',now(),now(),'{"provider":"email","providers":["email"]}','{}',false),
  ('00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','voter02@test.vif','',now(),'authenticated','authenticated',now(),now(),'{"provider":"email","providers":["email"]}','{}',false),
  ('00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000','voter03@test.vif','',now(),'authenticated','authenticated',now(),now(),'{"provider":"email","providers":["email"]}','{}',false),
  -- Marseille (13) — users 04-06
  ('00000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000000','voter04@test.vif','',now(),'authenticated','authenticated',now(),now(),'{"provider":"email","providers":["email"]}','{}',false),
  ('00000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000000','voter05@test.vif','',now(),'authenticated','authenticated',now(),now(),'{"provider":"email","providers":["email"]}','{}',false),
  ('00000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000000','voter06@test.vif','',now(),'authenticated','authenticated',now(),now(),'{"provider":"email","providers":["email"]}','{}',false),
  -- Lyon (69) — users 07-09
  ('00000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000000','voter07@test.vif','',now(),'authenticated','authenticated',now(),now(),'{"provider":"email","providers":["email"]}','{}',false),
  ('00000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000000','voter08@test.vif','',now(),'authenticated','authenticated',now(),now(),'{"provider":"email","providers":["email"]}','{}',false),
  ('00000000-0000-0000-0000-000000000009','00000000-0000-0000-0000-000000000000','voter09@test.vif','',now(),'authenticated','authenticated',now(),now(),'{"provider":"email","providers":["email"]}','{}',false),
  -- Bordeaux (33) — users 10-12
  ('00000000-0000-0000-0000-000000000010','00000000-0000-0000-0000-000000000000','voter10@test.vif','',now(),'authenticated','authenticated',now(),now(),'{"provider":"email","providers":["email"]}','{}',false),
  ('00000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000000','voter11@test.vif','',now(),'authenticated','authenticated',now(),now(),'{"provider":"email","providers":["email"]}','{}',false),
  ('00000000-0000-0000-0000-000000000012','00000000-0000-0000-0000-000000000000','voter12@test.vif','',now(),'authenticated','authenticated',now(),now(),'{"provider":"email","providers":["email"]}','{}',false),
  -- Lille (59) — users 13-15
  ('00000000-0000-0000-0000-000000000013','00000000-0000-0000-0000-000000000000','voter13@test.vif','',now(),'authenticated','authenticated',now(),now(),'{"provider":"email","providers":["email"]}','{}',false),
  ('00000000-0000-0000-0000-000000000014','00000000-0000-0000-0000-000000000000','voter14@test.vif','',now(),'authenticated','authenticated',now(),now(),'{"provider":"email","providers":["email"]}','{}',false),
  ('00000000-0000-0000-0000-000000000015','00000000-0000-0000-0000-000000000000','voter15@test.vif','',now(),'authenticated','authenticated',now(),now(),'{"provider":"email","providers":["email"]}','{}',false),
  -- Toulouse (31) — users 16-18
  ('00000000-0000-0000-0000-000000000016','00000000-0000-0000-0000-000000000000','voter16@test.vif','',now(),'authenticated','authenticated',now(),now(),'{"provider":"email","providers":["email"]}','{}',false),
  ('00000000-0000-0000-0000-000000000017','00000000-0000-0000-0000-000000000000','voter17@test.vif','',now(),'authenticated','authenticated',now(),now(),'{"provider":"email","providers":["email"]}','{}',false),
  ('00000000-0000-0000-0000-000000000018','00000000-0000-0000-0000-000000000000','voter18@test.vif','',now(),'authenticated','authenticated',now(),now(),'{"provider":"email","providers":["email"]}','{}',false),
  -- Nice (06) — users 19-21
  ('00000000-0000-0000-0000-000000000019','00000000-0000-0000-0000-000000000000','voter19@test.vif','',now(),'authenticated','authenticated',now(),now(),'{"provider":"email","providers":["email"]}','{}',false),
  ('00000000-0000-0000-0000-000000000020','00000000-0000-0000-0000-000000000000','voter20@test.vif','',now(),'authenticated','authenticated',now(),now(),'{"provider":"email","providers":["email"]}','{}',false),
  ('00000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000000','voter21@test.vif','',now(),'authenticated','authenticated',now(),now(),'{"provider":"email","providers":["email"]}','{}',false),
  -- Nantes (44) — users 22-24
  ('00000000-0000-0000-0000-000000000022','00000000-0000-0000-0000-000000000000','voter22@test.vif','',now(),'authenticated','authenticated',now(),now(),'{"provider":"email","providers":["email"]}','{}',false),
  ('00000000-0000-0000-0000-000000000023','00000000-0000-0000-0000-000000000000','voter23@test.vif','',now(),'authenticated','authenticated',now(),now(),'{"provider":"email","providers":["email"]}','{}',false),
  ('00000000-0000-0000-0000-000000000024','00000000-0000-0000-0000-000000000000','voter24@test.vif','',now(),'authenticated','authenticated',now(),now(),'{"provider":"email","providers":["email"]}','{}',false),
  -- Strasbourg (67) — users 25-27
  ('00000000-0000-0000-0000-000000000025','00000000-0000-0000-0000-000000000000','voter25@test.vif','',now(),'authenticated','authenticated',now(),now(),'{"provider":"email","providers":["email"]}','{}',false),
  ('00000000-0000-0000-0000-000000000026','00000000-0000-0000-0000-000000000000','voter26@test.vif','',now(),'authenticated','authenticated',now(),now(),'{"provider":"email","providers":["email"]}','{}',false),
  ('00000000-0000-0000-0000-000000000027','00000000-0000-0000-0000-000000000000','voter27@test.vif','',now(),'authenticated','authenticated',now(),now(),'{"provider":"email","providers":["email"]}','{}',false),
  -- Rouen (76) — users 28-30
  ('00000000-0000-0000-0000-000000000028','00000000-0000-0000-0000-000000000000','voter28@test.vif','',now(),'authenticated','authenticated',now(),now(),'{"provider":"email","providers":["email"]}','{}',false),
  ('00000000-0000-0000-0000-000000000029','00000000-0000-0000-0000-000000000000','voter29@test.vif','',now(),'authenticated','authenticated',now(),now(),'{"provider":"email","providers":["email"]}','{}',false),
  ('00000000-0000-0000-0000-000000000030','00000000-0000-0000-0000-000000000000','voter30@test.vif','',now(),'authenticated','authenticated',now(),now(),'{"provider":"email","providers":["email"]}','{}',false)
ON CONFLICT (id) DO NOTHING;

-- ── 3. User profiles (commune → dept mapping for the choropleth) ──────────────

INSERT INTO user_profiles (id, commune_insee, role) VALUES
  -- Paris (75056 → dept 75)
  ('00000000-0000-0000-0000-000000000001','75056','user'),
  ('00000000-0000-0000-0000-000000000002','75056','user'),
  ('00000000-0000-0000-0000-000000000003','75056','user'),
  -- Marseille (13055 → dept 13)
  ('00000000-0000-0000-0000-000000000004','13055','user'),
  ('00000000-0000-0000-0000-000000000005','13055','user'),
  ('00000000-0000-0000-0000-000000000006','13055','user'),
  -- Lyon (69123 → dept 69)
  ('00000000-0000-0000-0000-000000000007','69123','user'),
  ('00000000-0000-0000-0000-000000000008','69123','user'),
  ('00000000-0000-0000-0000-000000000009','69123','user'),
  -- Bordeaux (33063 → dept 33)
  ('00000000-0000-0000-0000-000000000010','33063','user'),
  ('00000000-0000-0000-0000-000000000011','33063','user'),
  ('00000000-0000-0000-0000-000000000012','33063','user'),
  -- Lille (59350 → dept 59)
  ('00000000-0000-0000-0000-000000000013','59350','user'),
  ('00000000-0000-0000-0000-000000000014','59350','user'),
  ('00000000-0000-0000-0000-000000000015','59350','user'),
  -- Toulouse (31555 → dept 31)
  ('00000000-0000-0000-0000-000000000016','31555','user'),
  ('00000000-0000-0000-0000-000000000017','31555','user'),
  ('00000000-0000-0000-0000-000000000018','31555','user'),
  -- Nice (06088 → dept 06)
  ('00000000-0000-0000-0000-000000000019','06088','user'),
  ('00000000-0000-0000-0000-000000000020','06088','user'),
  ('00000000-0000-0000-0000-000000000021','06088','user'),
  -- Nantes (44109 → dept 44)
  ('00000000-0000-0000-0000-000000000022','44109','user'),
  ('00000000-0000-0000-0000-000000000023','44109','user'),
  ('00000000-0000-0000-0000-000000000024','44109','user'),
  -- Strasbourg (67482 → dept 67)
  ('00000000-0000-0000-0000-000000000025','67482','user'),
  ('00000000-0000-0000-0000-000000000026','67482','user'),
  ('00000000-0000-0000-0000-000000000027','67482','user'),
  -- Rouen (76540 → dept 76)
  ('00000000-0000-0000-0000-000000000028','76540','user'),
  ('00000000-0000-0000-0000-000000000029','76540','user'),
  ('00000000-0000-0000-0000-000000000030','76540','user')
ON CONFLICT (id) DO NOTHING;

-- ── 4. Votes ──────────────────────────────────────────────────────────────────
-- Each INSERT looks up the proposition by source_id to get the real UUID.
-- Spread across national + european propositions so all departments show on map.
--
-- Vote distribution per proposition:
--   TEST-NAT-001 (loi carbone numérique, ADOPTÉ)     — 28 voters, mostly POUR
--   TEST-NAT-002 (droit déconnexion, EN COURS)        — 20 voters, mixed
--   TEST-EU-001  (règlement IA générative, ADOPTÉ)    — 26 voters, mostly POUR
--   TEST-EU-002  (taxe géants numériques, EN COURS)   — 22 voters, split

-- ── TEST-NAT-001: Loi carbone numérique ──────────────────────────────────────
INSERT INTO votes (user_id, proposition_id, option, voted_at)
SELECT u, p.id, v::vote_option, now() - (random() * interval '30 days')
FROM propositions p,
(VALUES
  -- Paris: progressive, mostly POUR
  ('00000000-0000-0000-0000-000000000001'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000002'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000003'::uuid,'INFO'),
  -- Marseille: POUR + CONTRE
  ('00000000-0000-0000-0000-000000000004'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000005'::uuid,'CONTRE'),
  ('00000000-0000-0000-0000-000000000006'::uuid,'POUR'),
  -- Lyon: split
  ('00000000-0000-0000-0000-000000000007'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000008'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000009'::uuid,'CONTRE'),
  -- Bordeaux: POUR
  ('00000000-0000-0000-0000-000000000010'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000011'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000012'::uuid,'INFO'),
  -- Lille: mixed
  ('00000000-0000-0000-0000-000000000013'::uuid,'CONTRE'),
  ('00000000-0000-0000-0000-000000000014'::uuid,'INFO'),
  ('00000000-0000-0000-0000-000000000015'::uuid,'POUR'),
  -- Toulouse: POUR
  ('00000000-0000-0000-0000-000000000016'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000017'::uuid,'POUR'),
  -- Nice: CONTRE + INFO
  ('00000000-0000-0000-0000-000000000019'::uuid,'CONTRE'),
  ('00000000-0000-0000-0000-000000000020'::uuid,'CONTRE'),
  ('00000000-0000-0000-0000-000000000021'::uuid,'INFO'),
  -- Nantes: POUR
  ('00000000-0000-0000-0000-000000000022'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000023'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000024'::uuid,'BLANC'),
  -- Strasbourg: très POUR (EU-adjacent)
  ('00000000-0000-0000-0000-000000000025'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000026'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000027'::uuid,'POUR'),
  -- Rouen: POUR + INFO
  ('00000000-0000-0000-0000-000000000028'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000029'::uuid,'INFO')
) AS t(u, v)
WHERE p.source_id = 'TEST-NAT-001'
ON CONFLICT (user_id, proposition_id) DO NOTHING;

-- ── TEST-NAT-002: Droit à la déconnexion ─────────────────────────────────────
INSERT INTO votes (user_id, proposition_id, option, voted_at)
SELECT u, p.id, v::vote_option, now() - (random() * interval '20 days')
FROM propositions p,
(VALUES
  ('00000000-0000-0000-0000-000000000001'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000002'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000004'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000005'::uuid,'CONTRE'),
  ('00000000-0000-0000-0000-000000000007'::uuid,'INFO'),
  ('00000000-0000-0000-0000-000000000008'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000010'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000013'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000014'::uuid,'CONTRE'),
  ('00000000-0000-0000-0000-000000000016'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000019'::uuid,'CONTRE'),
  ('00000000-0000-0000-0000-000000000020'::uuid,'BLANC'),
  ('00000000-0000-0000-0000-000000000022'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000025'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000026'::uuid,'INFO'),
  ('00000000-0000-0000-0000-000000000028'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000029'::uuid,'CONTRE'),
  ('00000000-0000-0000-0000-000000000030'::uuid,'INFO')
) AS t(u, v)
WHERE p.source_id = 'TEST-NAT-002'
ON CONFLICT (user_id, proposition_id) DO NOTHING;

-- ── TEST-EU-001: Règlement IA générative ──────────────────────────────────────
INSERT INTO votes (user_id, proposition_id, option, voted_at)
SELECT u, p.id, v::vote_option, now() - (random() * interval '14 days')
FROM propositions p,
(VALUES
  -- Paris: fort POUR
  ('00000000-0000-0000-0000-000000000001'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000002'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000003'::uuid,'POUR'),
  -- Marseille
  ('00000000-0000-0000-0000-000000000004'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000006'::uuid,'INFO'),
  -- Lyon
  ('00000000-0000-0000-0000-000000000007'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000008'::uuid,'CONTRE'),
  ('00000000-0000-0000-0000-000000000009'::uuid,'POUR'),
  -- Bordeaux
  ('00000000-0000-0000-0000-000000000010'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000011'::uuid,'POUR'),
  -- Lille
  ('00000000-0000-0000-0000-000000000013'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000015'::uuid,'POUR'),
  -- Toulouse
  ('00000000-0000-0000-0000-000000000016'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000017'::uuid,'INFO'),
  ('00000000-0000-0000-0000-000000000018'::uuid,'POUR'),
  -- Nice
  ('00000000-0000-0000-0000-000000000019'::uuid,'CONTRE'),
  ('00000000-0000-0000-0000-000000000021'::uuid,'POUR'),
  -- Nantes
  ('00000000-0000-0000-0000-000000000022'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000023'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000024'::uuid,'POUR'),
  -- Strasbourg: très POUR
  ('00000000-0000-0000-0000-000000000025'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000026'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000027'::uuid,'POUR'),
  -- Rouen
  ('00000000-0000-0000-0000-000000000028'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000030'::uuid,'INFO')
) AS t(u, v)
WHERE p.source_id = 'TEST-EU-001'
ON CONFLICT (user_id, proposition_id) DO NOTHING;

-- ── TEST-EU-002: Taxe géants numériques ──────────────────────────────────────
INSERT INTO votes (user_id, proposition_id, option, voted_at)
SELECT u, p.id, v::vote_option, now() - (random() * interval '10 days')
FROM propositions p,
(VALUES
  ('00000000-0000-0000-0000-000000000001'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000003'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000004'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000005'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000006'::uuid,'CONTRE'),
  ('00000000-0000-0000-0000-000000000007'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000009'::uuid,'CONTRE'),
  ('00000000-0000-0000-0000-000000000011'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000012'::uuid,'INFO'),
  ('00000000-0000-0000-0000-000000000014'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000016'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000018'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000020'::uuid,'CONTRE'),
  ('00000000-0000-0000-0000-000000000022'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000025'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000026'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000027'::uuid,'BLANC'),
  ('00000000-0000-0000-0000-000000000028'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000029'::uuid,'CONTRE'),
  ('00000000-0000-0000-0000-000000000030'::uuid,'POUR')
) AS t(u, v)
WHERE p.source_id = 'TEST-EU-002'
ON CONFLICT (user_id, proposition_id) DO NOTHING;

-- ── 5. Votes on 00000 commune/dept/region propositions ───────────────────────
-- Same 30 fake users can vote on any proposition regardless of their location.
-- No map tab for commune-level, but Voter tab tally will be populated.

-- TEST-COM-001: Rénovation salle des fêtes (adopted, mostly POUR)
INSERT INTO votes (user_id, proposition_id, option, voted_at)
SELECT u, p.id, v::vote_option, now() - (random() * interval '45 days')
FROM propositions p,
(VALUES
  ('00000000-0000-0000-0000-000000000001'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000002'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000004'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000005'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000007'::uuid,'CONTRE'),
  ('00000000-0000-0000-0000-000000000010'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000013'::uuid,'INFO'),
  ('00000000-0000-0000-0000-000000000016'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000019'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000022'::uuid,'BLANC')
) AS t(u, v)
WHERE p.source_id = 'TEST-COM-001'
ON CONFLICT (user_id, proposition_id) DO NOTHING;

-- TEST-COM-002: Piste cyclable (en cours, split)
INSERT INTO votes (user_id, proposition_id, option, voted_at)
SELECT u, p.id, v::vote_option, now() - (random() * interval '15 days')
FROM propositions p,
(VALUES
  ('00000000-0000-0000-0000-000000000001'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000003'::uuid,'CONTRE'),
  ('00000000-0000-0000-0000-000000000006'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000008'::uuid,'CONTRE'),
  ('00000000-0000-0000-0000-000000000011'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000014'::uuid,'INFO'),
  ('00000000-0000-0000-0000-000000000017'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000020'::uuid,'CONTRE')
) AS t(u, v)
WHERE p.source_id = 'TEST-COM-002'
ON CONFLICT (user_id, proposition_id) DO NOTHING;

-- TEST-DEP-001: Rénovation énergétique (adopted, mostly POUR)
INSERT INTO votes (user_id, proposition_id, option, voted_at)
SELECT u, p.id, v::vote_option, now() - (random() * interval '35 days')
FROM propositions p,
(VALUES
  ('00000000-0000-0000-0000-000000000001'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000002'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000004'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000007'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000009'::uuid,'INFO'),
  ('00000000-0000-0000-0000-000000000013'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000016'::uuid,'CONTRE'),
  ('00000000-0000-0000-0000-000000000019'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000022'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000025'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000028'::uuid,'INFO')
) AS t(u, v)
WHERE p.source_id = 'TEST-DEP-001'
ON CONFLICT (user_id, proposition_id) DO NOTHING;

-- TEST-DEP-002: Fermeture collège (en cours, contested)
INSERT INTO votes (user_id, proposition_id, option, voted_at)
SELECT u, p.id, v::vote_option, now() - (random() * interval '10 days')
FROM propositions p,
(VALUES
  ('00000000-0000-0000-0000-000000000002'::uuid,'CONTRE'),
  ('00000000-0000-0000-0000-000000000005'::uuid,'CONTRE'),
  ('00000000-0000-0000-0000-000000000008'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000011'::uuid,'CONTRE'),
  ('00000000-0000-0000-0000-000000000014'::uuid,'INFO'),
  ('00000000-0000-0000-0000-000000000017'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000020'::uuid,'CONTRE'),
  ('00000000-0000-0000-0000-000000000023'::uuid,'BLANC')
) AS t(u, v)
WHERE p.source_id = 'TEST-DEP-002'
ON CONFLICT (user_id, proposition_id) DO NOTHING;

-- TEST-REG-001: Schéma régional développement (adopted, POUR)
INSERT INTO votes (user_id, proposition_id, option, voted_at)
SELECT u, p.id, v::vote_option, now() - (random() * interval '25 days')
FROM propositions p,
(VALUES
  ('00000000-0000-0000-0000-000000000001'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000004'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000007'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000010'::uuid,'INFO'),
  ('00000000-0000-0000-0000-000000000013'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000016'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000019'::uuid,'CONTRE'),
  ('00000000-0000-0000-0000-000000000022'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000025'::uuid,'POUR')
) AS t(u, v)
WHERE p.source_id = 'TEST-REG-001'
ON CONFLICT (user_id, proposition_id) DO NOTHING;

-- TEST-REG-002: Extension TER (en cours, split opinion)
INSERT INTO votes (user_id, proposition_id, option, voted_at)
SELECT u, p.id, v::vote_option, now() - (random() * interval '8 days')
FROM propositions p,
(VALUES
  ('00000000-0000-0000-0000-000000000003'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000006'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000009'::uuid,'CONTRE'),
  ('00000000-0000-0000-0000-000000000012'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000015'::uuid,'INFO'),
  ('00000000-0000-0000-0000-000000000018'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000021'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000024'::uuid,'BLANC'),
  ('00000000-0000-0000-0000-000000000027'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000030'::uuid,'CONTRE')
) AS t(u, v)
WHERE p.source_id = 'TEST-REG-002'
ON CONFLICT (user_id, proposition_id) DO NOTHING;

-- TEST-NAT-003: Réforme apprentissage (rejected)
INSERT INTO votes (user_id, proposition_id, option, voted_at)
SELECT u, p.id, v::vote_option, now() - (random() * interval '55 days')
FROM propositions p,
(VALUES
  ('00000000-0000-0000-0000-000000000001'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000004'::uuid,'CONTRE'),
  ('00000000-0000-0000-0000-000000000007'::uuid,'CONTRE'),
  ('00000000-0000-0000-0000-000000000010'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000013'::uuid,'CONTRE'),
  ('00000000-0000-0000-0000-000000000016'::uuid,'INFO'),
  ('00000000-0000-0000-0000-000000000019'::uuid,'CONTRE'),
  ('00000000-0000-0000-0000-000000000022'::uuid,'POUR'),
  ('00000000-0000-0000-0000-000000000025'::uuid,'CONTRE'),
  ('00000000-0000-0000-0000-000000000028'::uuid,'CONTRE')
) AS t(u, v)
WHERE p.source_id = 'TEST-NAT-003'
ON CONFLICT (user_id, proposition_id) DO NOTHING;
