-- =============================================================================
-- Public tally RPCs — SECURITY DEFINER so anonymous browsers can read
-- aggregated vote counts without hitting the votes table RLS (own-votes only).
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_proposition_tally(p_id uuid)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT json_build_object(
    'POUR',   COALESCE(SUM(CASE WHEN option = 'POUR'   THEN 1 END), 0)::int,
    'CONTRE', COALESCE(SUM(CASE WHEN option = 'CONTRE' THEN 1 END), 0)::int,
    'INFO',   COALESCE(SUM(CASE WHEN option = 'INFO'   THEN 1 END), 0)::int,
    'BLANC',  COALESCE(SUM(CASE WHEN option = 'BLANC'  THEN 1 END), 0)::int,
    'total',  COUNT(*)::int
  )
  FROM votes
  WHERE proposition_id = p_id;
$$;

CREATE OR REPLACE FUNCTION public.get_proposition_map_data(p_id uuid)
RETURNS TABLE(code_dept text, pour int, contre int, info int, blanc int, total int)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    d.code                                                               AS code_dept,
    COALESCE(SUM(CASE WHEN v.option = 'POUR'   THEN 1 END), 0)::int    AS pour,
    COALESCE(SUM(CASE WHEN v.option = 'CONTRE' THEN 1 END), 0)::int    AS contre,
    COALESCE(SUM(CASE WHEN v.option = 'INFO'   THEN 1 END), 0)::int    AS info,
    COALESCE(SUM(CASE WHEN v.option = 'BLANC'  THEN 1 END), 0)::int    AS blanc,
    COUNT(*)::int                                                        AS total
  FROM votes v
  JOIN user_profiles up ON up.id = v.user_id
  JOIN communes c ON c.code_insee = up.commune_insee
  JOIN departements d ON d.code = c.code_dept
  WHERE v.proposition_id = p_id
  GROUP BY d.code;
$$;

GRANT EXECUTE ON FUNCTION public.get_proposition_tally(uuid)    TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_proposition_map_data(uuid) TO anon, authenticated;
