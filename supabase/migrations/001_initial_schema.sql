-- =============================================================================
-- VoteInfoFrance — Initial Schema Migration
-- =============================================================================
-- Run with: supabase db push (linked to a Supabase project)
-- Or locally: supabase migration up
-- =============================================================================

-- PostGIS extension for geographic queries
CREATE EXTENSION IF NOT EXISTS postgis;


-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE geo_level AS ENUM (
  'commune',
  'departement',
  'region',
  'national',
  'europeen'
);

CREATE TYPE institution AS ENUM (
  'assemblee_nationale',
  'senat',
  'conseil_regional',
  'conseil_departemental',
  'conseil_municipal',
  'parlement_europeen'
);

CREATE TYPE proposition_status AS ENUM (
  'en_cours',
  'adopte',
  'rejete',
  'suspendu'
);

CREATE TYPE vote_option AS ENUM ('POUR', 'CONTRE', 'INFO', 'BLANC');

CREATE TYPE ingestion_status AS ENUM ('running', 'success', 'error');


-- =============================================================================
-- GEOGRAPHIC REFERENCE TABLES (seeded once from IGN / geo.api.gouv.fr)
-- =============================================================================

CREATE TABLE regions (
  code        TEXT PRIMARY KEY,
  nom         TEXT NOT NULL,
  geometry    GEOMETRY(MULTIPOLYGON, 4326),
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_regions_geom ON regions USING GIST(geometry);


CREATE TABLE departements (
  code        TEXT PRIMARY KEY,
  nom         TEXT NOT NULL,
  code_region TEXT NOT NULL REFERENCES regions(code) ON DELETE RESTRICT,
  geometry    GEOMETRY(MULTIPOLYGON, 4326),
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_departements_geom ON departements USING GIST(geometry);
CREATE INDEX idx_departements_region ON departements(code_region);


CREATE TABLE communes (
  code_insee   TEXT PRIMARY KEY,
  nom          TEXT NOT NULL,
  code_postal  TEXT[] NOT NULL DEFAULT '{}',
  code_dept    TEXT NOT NULL REFERENCES departements(code) ON DELETE RESTRICT,
  geometry     GEOMETRY(POINT, 4326),
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- GIN index enables fast containment queries: WHERE $1 = ANY(code_postal)
CREATE INDEX idx_communes_code_postal ON communes USING GIN(code_postal);
CREATE INDEX idx_communes_geom ON communes USING GIST(geometry);
CREATE INDEX idx_communes_dept ON communes(code_dept);


-- =============================================================================
-- PROPOSITIONS
-- =============================================================================

CREATE TABLE propositions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id        TEXT NOT NULL,
  source_url       TEXT NOT NULL,
  institution      institution NOT NULL,
  titre            TEXT NOT NULL,
  texte_original   TEXT,
  date_depot       DATE,
  date_vote        DATE,
  status           proposition_status NOT NULL DEFAULT 'en_cours',
  geo_level        geo_level NOT NULL,
  geo_code         TEXT,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT uq_propositions_source UNIQUE (source_id, institution)
);

CREATE INDEX idx_propositions_geo ON propositions(geo_level, geo_code);
CREATE INDEX idx_propositions_institution ON propositions(institution);
CREATE INDEX idx_propositions_status ON propositions(status);
CREATE INDEX idx_propositions_date_depot ON propositions(date_depot DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_propositions_updated_at
  BEFORE UPDATE ON propositions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- =============================================================================
-- AI SUMMARIES
-- =============================================================================

CREATE TABLE summaries (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposition_id   UUID NOT NULL REFERENCES propositions(id) ON DELETE CASCADE,
  resume           TEXT NOT NULL,
  pour             TEXT NOT NULL,
  contre           TEXT NOT NULL,
  model_used       TEXT NOT NULL,
  generated_at     TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT uq_summaries_proposition UNIQUE (proposition_id)
);

CREATE INDEX idx_summaries_proposition ON summaries(proposition_id);


-- =============================================================================
-- USER PROFILES (extends Supabase Auth auth.users)
-- =============================================================================

CREATE TABLE user_profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  code_postal     TEXT,
  commune_insee   TEXT REFERENCES communes(code_insee) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_user_profiles_commune ON user_profiles(commune_insee);

-- Auto-create profile on sign-up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- =============================================================================
-- VOTES
-- =============================================================================

CREATE TABLE votes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  proposition_id   UUID NOT NULL REFERENCES propositions(id) ON DELETE CASCADE,
  option           vote_option NOT NULL,
  voted_at         TIMESTAMPTZ DEFAULT now(),

  -- Core duplicate-prevention constraint
  CONSTRAINT uq_votes_user_proposition UNIQUE (user_id, proposition_id)
);

CREATE INDEX idx_votes_user ON votes(user_id);
CREATE INDEX idx_votes_proposition ON votes(proposition_id);
CREATE INDEX idx_votes_option ON votes(proposition_id, option);


-- =============================================================================
-- MATERIALIZED VIEW: vote tallies per proposition per department
-- Refreshed via: REFRESH MATERIALIZED VIEW CONCURRENTLY vote_tallies
-- Triggered by: Supabase DB webhook → NestJS /admin/tally/refresh endpoint
-- =============================================================================

CREATE MATERIALIZED VIEW vote_tallies AS
SELECT
  v.proposition_id,
  up.commune_insee,
  d.code AS code_dept,
  d.code_region,
  v.option,
  COUNT(*) AS count
FROM votes v
JOIN user_profiles up ON up.id = v.user_id
JOIN communes c ON c.code_insee = up.commune_insee
JOIN departements d ON d.code = c.code_dept
GROUP BY v.proposition_id, up.commune_insee, d.code, d.code_region, v.option;

CREATE UNIQUE INDEX idx_vote_tallies_pk
  ON vote_tallies (proposition_id, commune_insee, option);
CREATE INDEX idx_vote_tallies_proposition ON vote_tallies(proposition_id);
CREATE INDEX idx_vote_tallies_dept ON vote_tallies(code_dept);


-- =============================================================================
-- INGESTION AUDIT LOG
-- =============================================================================

CREATE TABLE ingestion_runs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source           TEXT NOT NULL,
  started_at       TIMESTAMPTZ DEFAULT now(),
  finished_at      TIMESTAMPTZ,
  status           ingestion_status NOT NULL DEFAULT 'running',
  records_upserted INT NOT NULL DEFAULT 0,
  error_message    TEXT
);

CREATE INDEX idx_ingestion_runs_source ON ingestion_runs(source, started_at DESC);


-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- user_profiles: own row only
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_profile" ON user_profiles
  FOR ALL USING (auth.uid() = id);

-- votes: own votes only
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_votes" ON votes
  FOR ALL USING (auth.uid() = user_id);

-- propositions: public read, no public write (service role only)
ALTER TABLE propositions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_propositions" ON propositions
  FOR SELECT USING (true);

-- summaries: public read
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_summaries" ON summaries
  FOR SELECT USING (true);

-- geographic tables: public read (static reference data)
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_regions" ON regions FOR SELECT USING (true);

ALTER TABLE departements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_departements" ON departements FOR SELECT USING (true);

ALTER TABLE communes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_communes" ON communes FOR SELECT USING (true);
