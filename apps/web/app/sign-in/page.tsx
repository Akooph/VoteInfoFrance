'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.replace('/dashboard');
    router.refresh();
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>VoteInfoFrance</h1>
        <h2 style={styles.subtitle}>Connexion</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            placeholder="votre@email.fr"
          />

          <label style={styles.label}>Mot de passe</label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p style={styles.footer}>
          Pas encore de compte ?{' '}
          <a href="/sign-up" style={styles.link}>Créer un compte</a>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', padding: 16 },
  card: { background: '#fff', borderRadius: 12, padding: 36, width: '100%', maxWidth: 400, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  title: { textAlign: 'center', fontSize: 28, fontWeight: 800, color: '#1d4ed8', margin: '0 0 4px' },
  subtitle: { textAlign: 'center', fontSize: 18, fontWeight: 500, color: '#374151', margin: '0 0 28px' },
  form: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 },
  input: { padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 15, marginBottom: 14, outline: 'none' },
  error: { color: '#dc2626', fontSize: 13, margin: '0 0 8px' },
  button: { marginTop: 4, padding: '12px', borderRadius: 8, background: '#1d4ed8', color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer' },
  footer: { marginTop: 20, textAlign: 'center', fontSize: 14, color: '#6b7280' },
  link: { color: '#2563eb', textDecoration: 'none', fontWeight: 500 },
};
