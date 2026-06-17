-- ── User roles ──────────────────────────────────────────────────────────────

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin'));

-- Promote yourself to admin after applying this migration:
-- UPDATE user_profiles SET role = 'admin' WHERE id = auth.uid();

-- ── Supported cities ─────────────────────────────────────────────────────────
-- Tracks which communes we actively scrape. Joining with `communes` gives
-- the full name, code_postal, and geometry without duplicating data.

CREATE TABLE IF NOT EXISTS supported_cities (
  id              UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  commune_insee   TEXT    NOT NULL UNIQUE REFERENCES communes(code_insee) ON DELETE CASCADE,
  status          TEXT    NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'coming_soon', 'paused')),
  scraping_sources JSONB  NOT NULL DEFAULT '[]',
  notes           TEXT,
  added_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Public read (landing page shows supported cities), service-role-only write.
ALTER TABLE supported_cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "supported_cities_public_read" ON supported_cities
  FOR SELECT USING (true);

-- ── Seed: Montigny-le-Bretonneux ─────────────────────────────────────────────

INSERT INTO supported_cities (commune_insee, status, scraping_sources, notes)
VALUES (
  '78440',
  'active',
  '[{"type":"conseil_municipal","url":"https://www.montigny78.fr","method":"scraping","notes":"Délibérations du conseil municipal à scraper"}]',
  'Ville pilote. Toutes les délibérations du conseil municipal sont à scraper manuellement depuis le site officiel.'
)
ON CONFLICT (commune_insee) DO NOTHING;
