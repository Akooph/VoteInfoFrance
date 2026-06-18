'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { lookupByZip } from '@/lib/geo';
import type { GeoLookupResult } from '@vif/types';

// ── Types ────────────────────────────────────────────────────────────────────

type PropositionRow = {
  id: string;
  titre: string;
  institution: string;
  status: string;
  geo_level: string;
  geo_code: string | null;
  date_depot: string | null;
  summaries: { id: string }[];
  userVote?: string | null;
};

// ── Cache helpers ─────────────────────────────────────────────────────────────

function getCached<T>(key: string, ttlMs: number): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { value, ts } = JSON.parse(raw) as { value: T; ts: number };
    if (Date.now() - ts > ttlMs) { localStorage.removeItem(key); return null; }
    return value;
  } catch { return null; }
}

function setCached(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify({ value, ts: Date.now() })); } catch {}
}

// ── Geo level config ──────────────────────────────────────────────────────────

const GEO_LEVEL_LABELS: Record<string, string> = {
  commune: 'Commune', departement: 'Département', region: 'Région',
  national: 'National', europeen: 'Européen',
};

const GEO_LEVEL_COLORS: Record<string, { bg: string; color: string }> = {
  commune:     { bg: '#dcfce7', color: '#15803d' },
  departement: { bg: '#dbeafe', color: '#1d4ed8' },
  region:      { bg: '#f3e8ff', color: '#7c3aed' },
  national:    { bg: '#fee2e2', color: '#dc2626' },
  europeen:    { bg: '#fef3c7', color: '#b45309' },
};

const STATUS_LABELS: Record<string, string> = {
  en_cours: 'En cours', adopte: 'Adopté', rejete: 'Rejeté', suspendu: 'Suspendu',
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  en_cours: { bg: '#eff6ff', color: '#1d4ed8' },
  adopte:   { bg: '#f0fdf4', color: '#16a34a' },
  rejete:   { bg: '#fef2f2', color: '#dc2626' },
  suspendu: { bg: '#f3f4f6', color: '#6b7280' },
};

// ── Cookie helper ─────────────────────────────────────────────────────────────

function getZipCookie(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)vif_zip=([0-9]{5})(?:;|$)/);
  return match?.[1] ?? null;
}

// ── Component ─────────────────────────────────────────────────────────────────

const GEO_TABS = [
  { id: 'all',         label: 'Tous' },
  { id: 'commune',     label: 'Commune' },
  { id: 'departement', label: 'Département' },
  { id: 'region',      label: 'Région' },
  { id: 'national',    label: 'National' },
  { id: 'europeen',    label: 'Européen' },
] as const;
type GeoTab = (typeof GEO_TABS)[number]['id'];

export default function DashboardPage() {
  const [propositions, setPropositions] = useState<PropositionRow[]>([]);
  const [geoResult, setGeoResult] = useState<GeoLookupResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [zipCode, setZipCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<GeoTab>('all');
  const supabase = createClient();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    // 1. Try cached propositions first (instant render)
    const cached = getCached<PropositionRow[]>('vif_propositions', 5 * 60_000);
    if (cached) {
      setPropositions(cached);
      setLoading(false);
    }

    // 2. Fetch propositions from Supabase (public read, no cold start)
    const { data } = await supabase
      .from('propositions')
      .select('id, titre, institution, status, geo_level, geo_code, date_depot, summaries(id)')
      .order('date_depot', { ascending: false, nullsFirst: false })
      .limit(30);

    const rows = (data ?? []) as PropositionRow[];

    // 3. If logged in, layer in user votes
    const { data: { session } } = await supabase.auth.getSession();
    if (session && rows.length > 0) {
      const ids = rows.map((r) => r.id);
      const { data: votes } = await supabase
        .from('votes')
        .select('proposition_id, option')
        .in('proposition_id', ids)
        .eq('user_id', session.user.id);
      const voteMap = Object.fromEntries((votes ?? []).map((v) => [v.proposition_id, v.option]));
      rows.forEach((r) => { r.userVote = voteMap[r.id] ?? null; });
    }

    setCached('vif_propositions', rows);
    setPropositions(rows);
    setLoading(false);

    // 4. Resolve geo (from cookie or profile)
    let zip = getZipCookie();
    if (!zip && session) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('code_postal')
        .eq('id', session.user.id)
        .maybeSingle();
      zip = profile?.code_postal ?? null;
    }
    setZipCode(zip);

    if (zip) {
      const geoKey = `vif_geo_${zip}`;
      const geoCache = getCached<GeoLookupResult>(geoKey, 30 * 60_000);
      if (geoCache) { setGeoResult(geoCache); return; }
      const geo = await lookupByZip(zip).catch(() => null);
      if (geo) { setCached(geoKey, geo); setGeoResult(geo); }
    }
  }

  const filtered = activeTab === 'all' ? propositions : propositions.filter(p => p.geo_level === activeTab);
  const hasPropositions = propositions.length > 0;

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '28px 16px' }}>

      {/* Geo context banner */}
      {geoResult ? (
        <div style={s.geoBanner}>
          <div>
            <div style={s.geoTitle}>Votre espace civique</div>
            <div style={s.geoLevels}>
              {[
                geoResult.commune.nom,
                geoResult.departement.nom,
                geoResult.region.nom,
                'France',
                'Europe',
              ].map((name, i, arr) => (
                <span key={name}>
                  <span style={s.geoName}>{name}</span>
                  {i < arr.length - 1 && <span style={s.geoDot}>·</span>}
                </span>
              ))}
            </div>
          </div>
          <a href="/onboarding" style={s.geoEdit}>Modifier</a>
        </div>
      ) : (
        <div style={s.geoNudge}>
          <span style={{ fontSize: 14, color: '#6b7280' }}>
            Personnalisez votre vue en renseignant votre code postal.
          </span>
          <a href="/onboarding" style={s.nudgeLink}>Localiser →</a>
        </div>
      )}

      {/* Header + geo-level tabs */}
      <div style={{ marginBottom: 4 }}>
        <h1 style={{ ...s.heading, marginBottom: 16 }}>Propositions en cours</h1>
        <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e5e7eb', overflowX: 'auto' }}>
          {GEO_TABS.map((t) => {
            const count = t.id === 'all' ? propositions.length : propositions.filter(p => p.geo_level === t.id).length;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                padding: '8px 14px', fontSize: 13, fontWeight: activeTab === t.id ? 700 : 500,
                color: activeTab === t.id ? '#1d4ed8' : '#6b7280',
                background: 'none', border: 'none',
                borderBottom: `2px solid ${activeTab === t.id ? '#1d4ed8' : 'transparent'}`,
                marginBottom: -2, cursor: 'pointer', whiteSpace: 'nowrap',
              }}>
                {t.label}
                {count > 0 && <span style={{ marginLeft: 5, fontSize: 11, background: activeTab === t.id ? '#dbeafe' : '#f3f4f6', color: activeTab === t.id ? '#1d4ed8' : '#9ca3af', padding: '1px 6px', borderRadius: 10, fontWeight: 600 }}>{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && propositions.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={s.skeleton} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div style={s.empty}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
          <div style={{ fontWeight: 600, marginBottom: 4, color: '#374151' }}>
            {activeTab === 'all' ? 'Aucune proposition pour le moment' : `Aucune proposition au niveau ${GEO_TABS.find(t => t.id === activeTab)?.label}`}
          </div>
          <div style={{ fontSize: 14, color: '#9ca3af' }}>
            {activeTab === 'all' ? 'Les données sont en cours d\'importation.' : 'Essayez un autre niveau géographique.'}
          </div>
        </div>
      )}

      {/* Proposition cards */}
      {filtered.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
          {filtered.map((p) => {
            const geoStyle = GEO_LEVEL_COLORS[p.geo_level] ?? { bg: '#f3f4f6', color: '#374151' };
            const stStyle = STATUS_COLORS[p.status] ?? { bg: '#f3f4f6', color: '#374151' };
            const hasSummary = p.summaries?.length > 0;

            return (
              <a key={p.id} href={`/proposition/${p.id}`} style={s.card}>
                {/* Badges row */}
                <div style={s.badgeRow}>
                  <span style={{ ...s.badge, background: geoStyle.bg, color: geoStyle.color }}>
                    {GEO_LEVEL_LABELS[p.geo_level] ?? p.geo_level}
                  </span>
                  <span style={{ ...s.badge, background: stStyle.bg, color: stStyle.color }}>
                    {STATUS_LABELS[p.status] ?? p.status}
                  </span>
                  {p.userVote && (
                    <span style={{ ...s.badge, background: '#f0fdf4', color: '#16a34a' }}>
                      ✓ {p.userVote}
                    </span>
                  )}
                  {!hasSummary && (
                    <span style={{ ...s.badge, background: '#f9fafb', color: '#9ca3af', fontStyle: 'italic' }}>
                      Résumé en cours…
                    </span>
                  )}
                </div>

                {/* Title */}
                <div style={s.cardTitle}>{p.titre}</div>

                {/* Meta */}
                <div style={s.cardMeta}>
                  <span>{p.institution.replace(/_/g, ' ')}</span>
                  {p.date_depot && (
                    <>
                      <span style={s.metaDot}>·</span>
                      <span>{new Date(p.date_depot).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  geoBanner: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 24, padding: '14px 18px',
    background: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe',
  },
  geoTitle: { fontSize: 11, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  geoLevels: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  geoName: { fontSize: 14, fontWeight: 600, color: '#1e3a8a' },
  geoDot: { fontSize: 14, color: '#93c5fd', margin: '0 2px' },
  geoEdit: { fontSize: 13, color: '#1d4ed8', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap', marginLeft: 16, padding: '5px 12px', border: '1px solid #bfdbfe', borderRadius: 6, background: '#fff' },
  geoNudge: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 24, padding: '14px 18px',
    background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb',
  },
  nudgeLink: { fontSize: 14, color: '#1d4ed8', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', marginLeft: 12 },
  heading: { fontSize: 22, fontWeight: 800, margin: 0, color: '#111827' },
  count: { fontSize: 14, color: '#9ca3af', fontWeight: 500 },
  skeleton: { height: 88, borderRadius: 10, background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' },
  empty: { textAlign: 'center', padding: '60px 24px', background: '#f9fafb', borderRadius: 12, border: '1px dashed #e5e7eb' },
  card: {
    display: 'block', padding: '14px 18px',
    background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb',
    textDecoration: 'none', color: 'inherit',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    cursor: 'pointer',
  },
  badgeRow: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 },
  badge: { fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, letterSpacing: 0.2, textTransform: 'capitalize' as const },
  cardTitle: { fontSize: 15, fontWeight: 600, color: '#111827', lineHeight: 1.45, marginBottom: 6 },
  cardMeta: { fontSize: 12, color: '#9ca3af', display: 'flex', gap: 4, alignItems: 'center', textTransform: 'capitalize' as const },
  metaDot: { color: '#d1d5db', margin: '0 2px' },
};
