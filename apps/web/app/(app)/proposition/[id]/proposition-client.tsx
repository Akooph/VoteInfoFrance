'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { createClient } from '@/lib/supabase';
import dynamic from 'next/dynamic';

const PropositionMap = dynamic(() => import('@/components/map/proposition-map'), { ssr: false });

// ── Types ────────────────────────────────────────────────────────────────────

type PropositionData = {
  id: string;
  titre: string;
  institution: string;
  status: string;
  geo_level: string;
  geo_code: string | null;
  date_depot: string | null;
  date_vote: string | null;
  source_url: string;
  texte_original: string | null;
  summaries: Array<{ resume: string; pour: string; contre: string; model_used: string }>;
};

type Tally = { POUR: number; CONTRE: number; INFO: number; BLANC: number; total: number };
type Tab = 'resume' | 'vote' | 'carte' | 'document';

const VOTE_OPTIONS = ['POUR', 'CONTRE', 'INFO', 'BLANC'] as const;
type VoteOption = (typeof VOTE_OPTIONS)[number];

// ── Config ────────────────────────────────────────────────────────────────────

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
const VOTE_COLORS: Record<VoteOption, string> = {
  POUR: '#16a34a', CONTRE: '#dc2626', INFO: '#d97706', BLANC: '#6b7280',
};

// ── Cache ─────────────────────────────────────────────────────────────────────

function getCached<T>(key: string, ttlMs: number): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { value, ts } = JSON.parse(raw) as { value: T; ts: number };
    if (Date.now() - ts > ttlMs) { localStorage.removeItem(key); return null; }
    return value;
  } catch { return null; }
}
function setCached(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify({ value, ts: Date.now() })); } catch {}
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PropositionPageClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tab, setTab] = useState<Tab>('resume');
  const [proposition, setProposition] = useState<PropositionData | null>(null);
  const [tally, setTally] = useState<Tally | null>(null);
  const [userVote, setUserVote] = useState<VoteOption | null>(null);
  const [voting, setVoting] = useState(false);
  const [voteError, setVoteError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const supabase = createClient();

  useEffect(() => { load(); }, [id]);

  async function load() {
    // Render immediately from cache — zero-latency for return visits
    const cached = getCached<PropositionData>(`vif_prop_${id}`, 10 * 60_000);
    if (cached) setProposition(cached);
    const cachedTally = getCached<Tally>(`vif_tally_${id}`, 2 * 60_000);
    if (cachedTally) setTally(cachedTally);

    try {
      const [{ data: propRaw, error: propErr }, { data: { session } }] = await Promise.all([
        supabase
          .from('propositions')
          .select('id, titre, institution, status, geo_level, geo_code, date_depot, date_vote, source_url, texte_original, summaries(resume, pour, contre, model_used)')
          .eq('id', id)
          .single(),
        supabase.auth.getSession(),
      ]);

      if (propErr || !propRaw) { if (!cached) setLoadError(true); return; }

      const prop = propRaw as PropositionData;
      setCached(`vif_prop_${id}`, prop);
      setProposition(prop);

      setIsLoggedIn(!!session);
      if (session) setUserId(session.user.id);

      // Tally via SECURITY DEFINER RPC — readable by everyone
      const { data: tallyData } = await supabase.rpc('get_proposition_tally', { p_id: id });
      if (tallyData) {
        const t = tallyData as Tally;
        setCached(`vif_tally_${id}`, t);
        setTally(t);
      }

      // Own vote (own-votes RLS allows this)
      if (session) {
        const { data: myVote } = await supabase
          .from('votes')
          .select('option')
          .eq('proposition_id', id)
          .eq('user_id', session.user.id)
          .maybeSingle();
        if (myVote) setUserVote(myVote.option as VoteOption);
      }
    } catch {
      if (!cached) setLoadError(true);
    }
  }

  async function handleVote(option: VoteOption) {
    if (!isLoggedIn || userVote || voting || !userId) return;
    setVoting(true);
    setVoteError('');
    try {
      const { error } = await supabase.from('votes').insert({
        proposition_id: id,
        option,
        user_id: userId,
      });
      if (error) {
        if (error.code === '23505') {
          setUserVote(option);
        } else {
          setVoteError('Erreur lors du vote. Réessayez.');
        }
      } else {
        setUserVote(option);
        localStorage.removeItem(`vif_tally_${id}`);
        localStorage.removeItem('vif_propositions');
        const { data: fresh } = await supabase.rpc('get_proposition_tally', { p_id: id });
        if (fresh) { setCached(`vif_tally_${id}`, fresh); setTally(fresh as Tally); }
      }
    } finally {
      setVoting(false);
    }
  }

  // ── Error state ──────────────────────────────────────────────────────────────

  if (loadError && !proposition) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>😕</div>
        <p style={{ fontWeight: 600, color: '#374151', marginBottom: 8 }}>Proposition introuvable</p>
        <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 20 }}>
          Cette proposition n&apos;existe pas ou a été supprimée.
        </p>
        <a href="/dashboard" style={{ color: '#1d4ed8', fontSize: 14, fontWeight: 600 }}>← Retour aux propositions</a>
      </div>
    );
  }

  // ── Loading skeleton ─────────────────────────────────────────────────────────

  if (!proposition) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ height: 14, width: 80, background: '#e5e7eb', borderRadius: 4, marginBottom: 20 }} />
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {[60, 90, 120].map((w) => <div key={w} style={{ height: 20, width: w, background: '#e5e7eb', borderRadius: 4 }} />)}
        </div>
        <div style={{ height: 26, width: '85%', background: '#e5e7eb', borderRadius: 4, marginBottom: 8 }} />
        <div style={{ height: 26, width: '65%', background: '#e5e7eb', borderRadius: 4, marginBottom: 28 }} />
        <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e5e7eb', marginBottom: 24 }}>
          {[80, 70, 70, 90].map((w, i) => <div key={i} style={{ height: 36, width: w, background: '#f3f4f6', marginRight: 4, borderRadius: '4px 4px 0 0' }} />)}
        </div>
        <div style={{ height: 100, background: '#f3f4f6', borderRadius: 10, marginBottom: 12 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ height: 120, background: '#f3f4f6', borderRadius: 10 }} />
          <div style={{ height: 120, background: '#f3f4f6', borderRadius: 10 }} />
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const summary = proposition.summaries?.[0] ?? null;
  const geoStyle = GEO_LEVEL_COLORS[proposition.geo_level] ?? { bg: '#f3f4f6', color: '#374151' };
  const showMapTab = proposition.geo_level !== 'commune';

  const TABS: { id: Tab; label: string }[] = [
    { id: 'resume',   label: '📄 Résumé' },
    { id: 'vote',     label: userVote ? `🗳️ Voté ${userVote}` : '🗳️ Voter' },
    ...(showMapTab ? [{ id: 'carte' as Tab, label: '🗺️ Carte' }] : []),
    { id: 'document', label: '📎 Document' },
  ];

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 16px' }}>

      {/* Back */}
      <a href="/dashboard" style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 18 }}>
        ← Propositions
      </a>

      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ ...s.badge, background: geoStyle.bg, color: geoStyle.color }}>
            {GEO_LEVEL_LABELS[proposition.geo_level] ?? proposition.geo_level}
          </span>
          <span style={s.meta}>{STATUS_LABELS[proposition.status] ?? proposition.status}</span>
          <span style={s.dot}>·</span>
          <span style={{ ...s.meta, textTransform: 'capitalize' }}>{proposition.institution.replace(/_/g, ' ')}</span>
          {proposition.date_depot && (
            <>
              <span style={s.dot}>·</span>
              <span style={s.meta}>{new Date(proposition.date_depot).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </>
          )}
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, lineHeight: 1.35, color: '#111827' }}>
          {proposition.titre}
        </h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', marginBottom: 24, overflowX: 'auto' }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '10px 16px', fontSize: 14, fontWeight: tab === t.id ? 700 : 500,
            color: tab === t.id ? '#1d4ed8' : '#6b7280', background: 'none', border: 'none',
            borderBottom: `2px solid ${tab === t.id ? '#1d4ed8' : 'transparent'}`,
            marginBottom: -2, cursor: 'pointer', whiteSpace: 'nowrap',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Résumé ── */}
      {tab === 'resume' && (
        summary ? (
          <div>
            <div style={{ padding: '18px 20px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 16, lineHeight: 1.75, color: '#334155', fontSize: 15 }}>
              {summary.resume}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
              <div style={{ padding: '14px 16px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0' }}>
                <div style={{ fontWeight: 700, color: '#15803d', marginBottom: 8, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6 }}>Arguments pour</div>
                <div style={{ fontSize: 14, color: '#166534', lineHeight: 1.65, whiteSpace: 'pre-line' }}>{summary.pour}</div>
              </div>
              <div style={{ padding: '14px 16px', background: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca' }}>
                <div style={{ fontWeight: 700, color: '#dc2626', marginBottom: 8, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6 }}>Arguments contre</div>
                <div style={{ fontSize: 14, color: '#991b1b', lineHeight: 1.65, whiteSpace: 'pre-line' }}>{summary.contre}</div>
              </div>
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: '#cbd5e1', textAlign: 'right' }}>
              Résumé généré par {summary.model_used}
            </div>
          </div>
        ) : (
          <div style={{ padding: 40, textAlign: 'center', background: '#f9fafb', borderRadius: 10, border: '1px dashed #e5e7eb' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>⏳</div>
            <div style={{ fontWeight: 600, color: '#374151', marginBottom: 4 }}>Résumé en cours de génération</div>
            <div style={{ fontSize: 13, color: '#9ca3af' }}>L&apos;IA analyse le texte officiel. Revenez dans quelques minutes.</div>
          </div>
        )
      )}

      {/* ── Tab: Voter ── */}
      {tab === 'vote' && (
        <div>
          {/* Vote buttons */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 14 }}>
              {userVote ? 'Votre vote a été enregistré' : isLoggedIn ? 'Voter sur cette proposition' : 'Connexion requise pour voter'}
            </div>

            {!isLoggedIn ? (
              <div style={{ padding: '20px 24px', background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>
                <a href={`/sign-in?next=/proposition/${id}`} style={{ color: '#1d4ed8', fontWeight: 700, fontSize: 15 }}>Se connecter</a>
                <span style={{ color: '#9ca3af', fontSize: 14 }}> pour voter.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {VOTE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => !userVote && handleVote(opt)}
                    disabled={voting || !!userVote}
                    style={{
                      padding: '11px 28px', borderRadius: 8, fontWeight: 700, fontSize: 14,
                      background: userVote === opt ? VOTE_COLORS[opt] : userVote ? '#f3f4f6' : VOTE_COLORS[opt],
                      color: userVote && userVote !== opt ? '#9ca3af' : '#fff',
                      border: 'none',
                      cursor: userVote || voting ? 'default' : 'pointer',
                      opacity: userVote && userVote !== opt ? 0.45 : 1,
                      transform: userVote === opt ? 'scale(1.04)' : 'scale(1)',
                      transition: 'all 0.15s',
                    }}
                  >
                    {userVote === opt ? '✓ ' : ''}{opt}
                  </button>
                ))}
              </div>
            )}

            {voteError && <p style={{ color: '#dc2626', fontSize: 13, marginTop: 10 }}>{voteError}</p>}
          </div>

          {/* Tally */}
          {tally !== null && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 14 }}>
                {tally.total === 0 ? 'Aucun vote pour le moment' : `${tally.total.toLocaleString('fr-FR')} vote${tally.total > 1 ? 's' : ''}`}
              </div>

              {tally.total === 0 ? (
                <div style={{ padding: '20px 24px', background: '#f9fafb', borderRadius: 10, border: '1px dashed #e5e7eb', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                  Soyez le premier à voter sur cette proposition !
                </div>
              ) : (
                <div>
                  {VOTE_OPTIONS.map((opt) => {
                    const count = tally[opt];
                    const pct = tally.total > 0 ? Math.round((count / tally.total) * 100) : 0;
                    return (
                      <div key={opt} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: VOTE_COLORS[opt] }}>{opt}</span>
                          <span style={{ fontSize: 13, color: '#9ca3af' }}>{count.toLocaleString('fr-FR')} · {pct}%</span>
                        </div>
                        <div style={{ height: 10, background: '#f3f4f6', borderRadius: 5, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: VOTE_COLORS[opt], borderRadius: 5, transition: 'width 0.6s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Carte ── */}
      {tab === 'carte' && showMapTab && (
        <PropositionMap propositionId={id} />
      )}

      {/* ── Tab: Document ── */}
      {tab === 'document' && (
        <div>
          <a
            href={proposition.source_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', background: '#1d4ed8', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 14, marginBottom: 24 }}
          >
            Consulter le document officiel →
          </a>

          {proposition.texte_original ? (
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Texte original</div>
              <div style={{ padding: '16px 18px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13, lineHeight: 1.75, color: '#475569', maxHeight: 440, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                {proposition.texte_original.length > 3000
                  ? proposition.texte_original.slice(0, 3000) + '\n\n[…texte tronqué — consulter le document officiel pour la version complète]'
                  : proposition.texte_original}
              </div>
            </div>
          ) : (
            <div style={{ padding: 24, background: '#f9fafb', borderRadius: 10, border: '1px dashed #e5e7eb', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
              Le texte intégral est disponible sur le document officiel.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  badge: { fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase' as const, letterSpacing: 0.3 },
  meta:  { fontSize: 12, color: '#9ca3af' },
  dot:   { fontSize: 12, color: '#d1d5db' },
};
