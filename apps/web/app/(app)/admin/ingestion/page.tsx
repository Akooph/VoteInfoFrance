export const dynamic = 'force-dynamic';

import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { revalidatePath } from 'next/cache';

const SOURCES = [
  { id: 'assemblee_nationale', label: 'Assemblée Nationale', level: 'national' },
  { id: 'senat', label: 'Sénat', level: 'national' },
  { id: 'parlement_europeen', label: 'Parlement Européen', level: 'européen' },
  { id: 'legifrance', label: 'Légifrance', level: 'national' },
  { id: 'conseils_regionaux', label: 'Conseils Régionaux', level: 'région' },
];

async function triggerIngestion(formData: FormData) {
  'use server';
  const source = formData.get('source') as string;
  const apiUrl = process.env['NEXT_PUBLIC_API_URL'];
  const adminKey = process.env['ADMIN_API_KEY'];
  await fetch(`${apiUrl}/admin/ingestion/trigger?source=${source}`, {
    method: 'POST',
    headers: { 'x-admin-api-key': adminKey ?? '' },
  }).catch(() => null);
  revalidatePath('/admin/ingestion');
}

export default async function IngestionPage() {
  const db = createSupabaseAdminClient();

  const { data: runs } = await db
    .from('ingestion_runs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(30);

  const statusColor = (s: string) =>
    s === 'success' ? { bg: '#d1fae5', text: '#065f46' } :
    s === 'error'   ? { bg: '#fee2e2', text: '#991b1b' } :
                      { bg: '#fef9c3', text: '#92400e' };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 24px', color: '#111827' }}>Ingestion</h1>

      {/* Trigger buttons */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#111827' }}>Déclencher manuellement</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {SOURCES.map((s) => (
            <form key={s.id} action={triggerIngestion}>
              <input type="hidden" name="source" value={s.id} />
              <button type="submit"
                style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                <span>{s.label}</span>
                <span style={{ fontSize: 11, fontWeight: 400, color: '#6b7280' }}>{s.level}</span>
              </button>
            </form>
          ))}
        </div>
      </div>

      {/* Run history */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#111827' }}>Historique des runs</h2>
        {!runs?.length && <p style={{ color: '#6b7280', fontSize: 14 }}>Aucun run pour l&apos;instant.</p>}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
              {['Source', 'Status', 'Enregistrements', 'Erreur', 'Démarré le'].map((h) => (
                <th key={h} style={{ padding: '8px 12px 12px 0', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {runs?.map((r) => {
              const col = statusColor(r.status);
              return (
                <tr key={r.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                  <td style={{ padding: '10px 12px 10px 0', fontWeight: 500, color: '#111827' }}>{r.source}</td>
                  <td style={{ padding: '10px 12px 10px 0' }}>
                    <span style={{ background: col.bg, color: col.text, padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>{r.status}</span>
                  </td>
                  <td style={{ padding: '10px 12px 10px 0', color: '#374151' }}>{r.records_upserted ?? 0}</td>
                  <td style={{ padding: '10px 12px 10px 0', color: '#dc2626', fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.error_message ?? ''}>{r.error_message ?? '—'}</td>
                  <td style={{ padding: '10px 0', color: '#9ca3af', fontSize: 12 }}>{new Date(r.started_at).toLocaleString('fr-FR')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
