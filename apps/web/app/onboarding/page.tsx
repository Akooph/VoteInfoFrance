'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { api } from '@/lib/api-client';
import type { GeoLookupResult } from '@vif/types';

type Step = 'zip' | 'confirm';

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('zip');
  const [codePostal, setCodePostal] = useState('');
  const [geoResult, setGeoResult] = useState<GeoLookupResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{5}$/.test(codePostal)) { setError('Code postal invalide (5 chiffres requis).'); return; }
    setError('');
    setLoading(true);
    let result: GeoLookupResult | null = null;
    try {
      result = await api.geo.lookup(codePostal);
    } catch (err) {
      setLoading(false);
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('found') || msg.includes('introuvable') || msg.includes('No commune')) {
        setError('Code postal introuvable. Vérifiez et réessayez.');
      } else {
        setError('Erreur de connexion au serveur. Veuillez réessayer dans quelques secondes.');
      }
      return;
    }
    setLoading(false);
    if (!result) { setError('Code postal introuvable. Vérifiez et réessayez.'); return; }
    setGeoResult(result);
    setStep('confirm');
  }

  async function handleConfirm() {
    setLoading(true);

    // Always save to cookie (works for anonymous + logged-in users)
    document.cookie = `vif_zip=${codePostal}; max-age=2592000; path=/; SameSite=Lax`;

    // If logged in, also persist to profile
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      await api.profile.update(codePostal, session.access_token).catch(() => null);
    }

    setLoading(false);
    router.replace('/dashboard');
    router.refresh();
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={styles.logo}>VoteInfoFrance</div>
          <h2 style={styles.heading}>Bienvenue !</h2>
          <p style={styles.body}>
            Pour vous montrer les décisions qui vous concernent,
            nous avons besoin de votre localisation.
          </p>
        </div>

        {step === 'zip' && (
          <form onSubmit={handleLookup} style={styles.form}>
            <label style={styles.label}>Votre code postal</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{5}"
              maxLength={5}
              required
              placeholder="75001"
              value={codePostal}
              onChange={(e) => setCodePostal(e.target.value.replace(/\D/g, ''))}
              style={styles.input}
              autoFocus
            />
            {error && <p style={styles.error}>{error}</p>}
            <button type="submit" disabled={loading || codePostal.length !== 5} style={styles.button}>
              {loading ? 'Recherche...' : 'Trouver ma commune →'}
            </button>
            <a href="/dashboard" style={styles.skipLink}>Continuer sans localisation</a>
          </form>
        )}

        {step === 'confirm' && geoResult && (
          <div>
            <div style={styles.geoCard}>
              <div style={styles.geoRow}>
                <span style={styles.geoIcon}>🏘️</span>
                <div>
                  <div style={styles.geoLevel}>Commune</div>
                  <div style={styles.geoName}>{geoResult.commune.nom}</div>
                </div>
              </div>
              <div style={styles.geoRow}>
                <span style={styles.geoIcon}>📍</span>
                <div>
                  <div style={styles.geoLevel}>Département</div>
                  <div style={styles.geoName}>{geoResult.departement.nom}</div>
                </div>
              </div>
              <div style={styles.geoRow}>
                <span style={styles.geoIcon}>🗺️</span>
                <div>
                  <div style={styles.geoLevel}>Région</div>
                  <div style={styles.geoName}>{geoResult.region.nom}</div>
                </div>
              </div>
              <div style={styles.geoRow}>
                <span style={styles.geoIcon}>🇫🇷</span>
                <div>
                  <div style={styles.geoLevel}>National</div>
                  <div style={styles.geoName}>France</div>
                </div>
              </div>
              <div style={styles.geoRow}>
                <span style={styles.geoIcon}>🇪🇺</span>
                <div>
                  <div style={styles.geoLevel}>Européen</div>
                  <div style={styles.geoName}>Parlement Européen</div>
                </div>
              </div>
            </div>

            <p style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 16 }}>
              Vous verrez les décisions à ces 5 niveaux géographiques.
            </p>

            <button onClick={handleConfirm} disabled={loading} style={styles.button}>
              {loading ? 'Enregistrement...' : 'Confirmer ma localisation →'}
            </button>
            <button onClick={() => setStep('zip')} style={styles.secondaryButton}>
              Modifier le code postal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eff6ff', padding: 16 },
  card: { background: '#fff', borderRadius: 16, padding: 36, width: '100%', maxWidth: 440, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
  logo: { fontSize: 22, fontWeight: 800, color: '#1d4ed8', marginBottom: 8 },
  heading: { fontSize: 22, fontWeight: 700, margin: '0 0 8px' },
  body: { color: '#6b7280', fontSize: 14, lineHeight: 1.6, margin: 0 },
  form: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 },
  input: { padding: '12px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 20, textAlign: 'center', letterSpacing: 4, marginBottom: 12, outline: 'none' },
  error: { color: '#dc2626', fontSize: 13, marginBottom: 8 },
  button: { padding: '12px', borderRadius: 8, background: '#1d4ed8', color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', width: '100%', marginBottom: 8 },
  secondaryButton: { padding: '10px', borderRadius: 8, background: 'transparent', color: '#6b7280', fontWeight: 500, fontSize: 14, border: '1px solid #e5e7eb', cursor: 'pointer', width: '100%' },
  skipLink: { display: 'block', textAlign: 'center', marginTop: 8, fontSize: 13, color: '#9ca3af', textDecoration: 'none' },
  geoCard: { background: '#f8fafc', borderRadius: 10, padding: 16, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 },
  geoRow: { display: 'flex', alignItems: 'center', gap: 12 },
  geoIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  geoLevel: { fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  geoName: { fontSize: 15, fontWeight: 600, color: '#111827' },
};
