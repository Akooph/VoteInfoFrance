export const dynamic = 'force-dynamic';

import { createSupabaseAdminClient } from '@/lib/supabase-admin';

export default async function AdminDashboard() {
  const db = createSupabaseAdminClient();

  const [
    { count: propositions },
    { count: votes },
    { count: users },
    { count: cities },
    { data: runs },
  ] = await Promise.all([
    db.from('propositions').select('*', { count: 'exact', head: true }),
    db.from('votes').select('*', { count: 'exact', head: true }),
    db.from('user_profiles').select('*', { count: 'exact', head: true }),
    db.from('supported_cities').select('*', { count: 'exact', head: true }),
    db.from('ingestion_runs').select('source, status, started_at, records_upserted').order('started_at', { ascending: false }).limit(5),
  ]);

  const stats = [
    { label: 'Propositions', value: propositions ?? 0, color: '#1d4ed8' },
    { label: 'Votes', value: votes ?? 0, color: '#059669' },
    { label: 'Utilisateurs', value: users ?? 0, color: '#7c3aed' },
    { label: 'Villes suivies', value: cities ?? 0, color: '#d97706' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 24px', color: '#111827' }}>Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <p style={{ margin: '0 0 4px', fontSize: 13, color: '#6b7280' }}>{s.label}</p>
            <p style={{ margin: 0, fontSize: 32, fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#111827' }}>Dernières ingestions</h2>
        {!runs?.length && <p style={{ color: '#6b7280', fontSize: 14 }}>Aucune ingestion pour l&apos;instant.</p>}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <tbody>
            {runs?.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '10px 0', color: '#111827', fontWeight: 500 }}>{r.source}</td>
                <td style={{ padding: '10px 8px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: r.status === 'success' ? '#d1fae5' : r.status === 'error' ? '#fee2e2' : '#fef9c3', color: r.status === 'success' ? '#065f46' : r.status === 'error' ? '#991b1b' : '#92400e' }}>
                    {r.status}
                  </span>
                </td>
                <td style={{ padding: '10px 0', color: '#6b7280' }}>{r.records_upserted ?? 0} enregistrements</td>
                <td style={{ padding: '10px 0', color: '#9ca3af', textAlign: 'right' }}>{new Date(r.started_at).toLocaleString('fr-FR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
