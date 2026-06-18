'use client';

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const isKeyMissing = error.message.includes('supabaseKey') || error.message.includes('required');
  return (
    <div style={{ padding: 32, maxWidth: 540 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#dc2626', marginBottom: 8 }}>Erreur panneau admin</h2>
      <p style={{ color: '#374151', marginBottom: 16 }}>{error.message}</p>
      {isKeyMissing && (
        <div style={{ background: '#fef9c3', border: '1px solid #fde047', borderRadius: 8, padding: 16, marginBottom: 16, fontSize: 14 }}>
          <strong>SUPABASE_SERVICE_ROLE_KEY</strong> est absente ou vide sur ce déploiement Fly.io.<br />
          Vérifiez les secrets de l&apos;app <code>voteinfofrance-web</code> :<br />
          <code style={{ display: 'block', marginTop: 8 }}>flyctl secrets list --app voteinfofrance-web</code>
        </div>
      )}
      <button onClick={reset}
        style={{ padding: '8px 16px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
        Réessayer
      </button>
    </div>
  );
}
