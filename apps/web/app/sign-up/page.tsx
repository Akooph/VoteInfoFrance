'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setDone(true);
  }

  if (done) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 16 }}>📬</div>
          <h2 style={{ textAlign: 'center', fontWeight: 700, marginBottom: 12 }}>Vérifiez votre email</h2>
          <p style={{ textAlign: 'center', color: '#6b7280', lineHeight: 1.6 }}>
            Un lien de confirmation a été envoyé à <strong>{email}</strong>.
            Cliquez dessus pour activer votre compte.
          </p>
          <a href="/sign-in" style={{ display: 'block', textAlign: 'center', marginTop: 20, color: '#2563eb' }}>
            Retour à la connexion
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>VoteInfoFrance</h1>
        <h2 style={styles.subtitle}>Créer un compte</h2>

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

          <label style={styles.label}>Mot de passe <span style={{ color: '#9ca3af', fontWeight: 400 }}>(8 caractères min.)</span></label>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p style={styles.footer}>
          Déjà un compte ?{' '}
          <a href="/sign-in" style={styles.link}>Se connecter</a>
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
