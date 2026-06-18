'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { api } from '@/lib/api-client';
import { createClient } from '@/lib/supabase';
import type { Proposition, VoteTally, VoteOption } from '@vif/types';
import { VoteBadge, VoteTallyBar, GeoLevelBadge } from '@vif/ui';

const VOTE_OPTIONS: VoteOption[] = ['POUR', 'CONTRE', 'INFO', 'BLANC'];

export default function PropositionPageClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [proposition, setProposition] = useState<Proposition | null>(null);
  const [tally, setTally] = useState<VoteTally | null>(null);
  const [userVote, setUserVote] = useState<VoteOption | null>(null);
  const [voting, setVoting] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setToken(session?.access_token ?? null);

        const [prop, t] = await Promise.all([
          api.propositions.get(id, session?.access_token),
          api.propositions.tally(id),
        ]);
        setProposition(prop);
        setTally(t);

        if (session?.access_token) {
          const votes = await api.votes.myVotes(session.access_token).catch(() => []);
          const existing = votes.find((v) => v.propositionId === id);
          if (existing) setUserVote(existing.option as VoteOption);
        }
      } catch {
        setLoadError(true);
      }
    }
    load();

    // Realtime subscription: refresh tally whenever a new vote is cast on this proposition
    const channel = supabase
      .channel(`votes:${id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'votes', filter: `proposition_id=eq.${id}` },
        () => { api.propositions.tally(id).then(setTally).catch(() => null); },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  async function handleVote(option: VoteOption) {
    if (!token || userVote || voting) return;
    setVoting(true);
    try {
      await api.votes.cast({ propositionId: id, option }, token);
      setUserVote(option);
      const updated = await api.propositions.tally(id);
      setTally(updated);
    } finally {
      setVoting(false);
    }
  }

  if (loadError) {
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <p style={{ color: '#dc2626', marginBottom: 12 }}>Impossible de charger cette proposition.</p>
        <p style={{ color: '#6b7280', fontSize: 14 }}>
          L&apos;API est peut-être en cours de démarrage.{' '}
          <button onClick={() => { setLoadError(false); window.location.reload(); }} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: 14 }}>
            Réessayer
          </button>
        </p>
      </div>
    );
  }

  if (!proposition) {
    return <div style={{ padding: 32, textAlign: 'center', color: '#6b7280' }}>Chargement...</div>;
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
      <a href="/dashboard" style={{ fontSize: 14, color: '#2563eb', textDecoration: 'none' }}>
        ← Retour
      </a>

      <div style={{ display: 'flex', gap: 8, marginTop: 16, marginBottom: 12, alignItems: 'center' }}>
        <GeoLevelBadge level={proposition.geoLevel} />
        <span style={{ fontSize: 13, color: '#6b7280' }}>
          {proposition.institution.replace(/_/g, ' ')}
        </span>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>
        {proposition.titre}
      </h1>

      {proposition.dateDepot && (
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
          Déposé le {new Date(proposition.dateDepot).toLocaleDateString('fr-FR')}
        </p>
      )}

      {proposition.summary ? (
        <div style={{ marginBottom: 24 }}>
          <section style={{ marginBottom: 16, padding: 16, background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
            <h2 style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>Résumé</h2>
            <p style={{ margin: 0, lineHeight: 1.6 }}>{proposition.summary.resume}</p>
          </section>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <section style={{ padding: 16, background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
              <h3 style={{ fontWeight: 600, color: '#16a34a', fontSize: 14, marginBottom: 8 }}>Pour</h3>
              <p style={{ margin: 0, fontSize: 14, whiteSpace: 'pre-line', lineHeight: 1.5 }}>{proposition.summary.pour}</p>
            </section>
            <section style={{ padding: 16, background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca' }}>
              <h3 style={{ fontWeight: 600, color: '#dc2626', fontSize: 14, marginBottom: 8 }}>Contre</h3>
              <p style={{ margin: 0, fontSize: 14, whiteSpace: 'pre-line', lineHeight: 1.5 }}>{proposition.summary.contre}</p>
            </section>
          </div>
        </div>
      ) : (
        <div style={{ padding: 16, background: '#f3f4f6', borderRadius: 8, marginBottom: 24, color: '#6b7280', fontSize: 14 }}>
          Résumé en cours de génération...
        </div>
      )}

      <a
        href={proposition.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: 14, color: '#2563eb' }}
      >
        Consulter le document officiel →
      </a>

      <hr style={{ margin: '24px 0', borderColor: '#e5e7eb' }} />

      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>Votre vote</h2>
        {userVote ? (
          <p style={{ color: '#16a34a' }}>
            Vous avez voté : <VoteBadge option={userVote} selected />
          </p>
        ) : !token ? (
          <p style={{ fontSize: 14, color: '#6b7280' }}>
            <a href="/sign-in" style={{ color: '#2563eb' }}>Connectez-vous</a> pour voter.
          </p>
        ) : (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {VOTE_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => handleVote(opt)}
                disabled={voting}
                style={{
                  padding: '8px 20px',
                  borderRadius: 6,
                  border: 'none',
                  cursor: voting ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: 14,
                  opacity: voting ? 0.6 : 1,
                  background:
                    opt === 'POUR' ? '#16a34a'
                    : opt === 'CONTRE' ? '#dc2626'
                    : opt === 'INFO' ? '#d97706'
                    : '#6b7280',
                  color: '#fff',
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      {tally && tally.total > 0 && (
        <div>
          <h2 style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>Résultats</h2>
          <VoteTallyBar tally={tally} />
          <div style={{ marginTop: 12 }}>
            <a href={`/map?propositionId=${id}`} style={{ fontSize: 14, color: '#2563eb' }}>
              Voir la carte par département →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
