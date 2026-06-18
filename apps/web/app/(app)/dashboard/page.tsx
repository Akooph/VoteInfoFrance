'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { lookupByZip } from '@/lib/geo';
import { createClient } from '@/lib/supabase';
import type { PaginatedPropositions, GeoLookupResult } from '@vif/types';
import { GeoLevelBadge } from '@vif/ui';

function getZipCookie(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)vif_zip=([0-9]{5})(?:;|$)/);
  return match?.[1] ?? null;
}

export default function DashboardPage() {
  const [propositions, setPropositions] = useState<PaginatedPropositions | null>(null);
  const [geoResult, setGeoResult] = useState<GeoLookupResult | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const [profile, data] = await Promise.all([
        token ? api.profile.get(token).catch(() => null) : Promise.resolve(null),
        api.propositions.list({ page: 1, limit: 20, token }).catch(() => null),
      ]);

      const zipCode = profile?.codePostal ?? getZipCookie();
      if (zipCode) {
        const geo = await lookupByZip(zipCode).catch(() => null);
        setGeoResult(geo);
      }

      setPropositions(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: '#6b7280' }}>
        Chargement...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
      {geoResult ? (
        <div style={{ marginBottom: 24, padding: 16, background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe' }}>
          <div style={{ fontWeight: 600, marginBottom: 8, color: '#1d4ed8' }}>Votre espace civique</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 14 }}>
            <span>{geoResult.commune.nom}</span>
            <span>·</span>
            <span>{geoResult.departement.nom}</span>
            <span>·</span>
            <span>{geoResult.region.nom}</span>
            <span>·</span>
            <span>France</span>
            <span>·</span>
            <span>Europe</span>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 24, padding: 16, background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, color: '#6b7280' }}>Personnalisez votre vue en renseignant votre code postal.</span>
          <a href="/onboarding" style={{ fontSize: 14, color: '#1d4ed8', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap', marginLeft: 12 }}>
            Localiser →
          </a>
        </div>
      )}

      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Propositions en cours</h1>

      {!propositions || propositions.data.length === 0 ? (
        <p style={{ color: '#6b7280' }}>Aucune proposition pour le moment.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {propositions.data.map((p) => (
            <a
              key={p.id}
              href={`/proposition/${p.id}`}
              style={{
                display: 'block',
                padding: 16,
                background: '#fff',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <GeoLevelBadge level={p.geoLevel} />
                {p.userVote && (
                  <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
                    ✓ Voté
                  </span>
                )}
                {!p.hasSummary && (
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>Résumé en cours...</span>
                )}
              </div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{p.titre}</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>
                {p.institution.replace(/_/g, ' ')}
                {p.dateDepot ? ` · ${new Date(p.dateDepot).toLocaleDateString('fr-FR')}` : ''}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
