-- =============================================================================
-- Migration 004 — Add is_test flag to propositions
-- Allows test/demo data to be filtered out in the UI and toggled by admins.
-- =============================================================================

ALTER TABLE propositions ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;

-- Mark all TEST-* source_ids as test data
UPDATE propositions SET is_test = true WHERE source_id LIKE 'TEST-%';

-- Index for fast filtering (most queries will filter is_test = false)
CREATE INDEX IF NOT EXISTS idx_propositions_is_test ON propositions (is_test);

-- Expose is_test in the public tally RPC (no change needed — it's on propositions, not votes)
-- The dashboard/list queries need to filter on is_test; that's done client-side via the
-- Supabase direct query: .eq('is_test', false) or toggled off in admin.
