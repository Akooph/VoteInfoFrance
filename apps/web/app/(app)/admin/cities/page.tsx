export const dynamic = 'force-dynamic';

import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { revalidatePath } from 'next/cache';

async function toggleStatus(formData: FormData) {
  'use server';
  const db = createSupabaseAdminClient();
  const id = formData.get('id') as string;
  const current = formData.get('status') as string;
  const next = current === 'active' ? 'paused' : 'active';
  await db.from('supported_cities').update({ status: next }).eq('id', id);
  revalidatePath('/admin/cities');
}

async function addCity(formData: FormData) {
  'use server';
  const db = createSupabaseAdminClient();
  const commune_insee = (formData.get('commune_insee') as string).trim();
  const notes = (formData.get('notes') as string).trim();
  if (!commune_insee) return;
  await db.from('supported_cities').upsert({ commune_insee, notes, status: 'active' }, { onConflict: 'commune_insee' });
  revalidatePath('/admin/cities');
}

export default async function CitiesPage() {
  const db = createSupabaseAdminClient();

  const { data: cities } = await db
    .from('supported_cities')
    .select('*, communes(nom, code_postal, code_dept)')
    .order('added_at', { ascending: false });

  const statusColor = (s: string) =>
    s === 'active' ? { bg: '#d1fae5', text: '#065f46' } :
    s === 'paused'  ? { bg: '#fee2e2', text: '#991b1b' } :
                      { bg: '#fef9c3', text: '#92400e' };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 24px', color: '#111827' }}>Villes suivies</h1>

      {/* Add city */}
      <form action={addCity} style={{ background: '#fff', borderRadius: 12, padding: 20, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Code INSEE *</label>
          <input name="commune_insee" placeholder="ex: 78440" required
            style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 12px', fontSize: 14, width: 140 }} />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Notes de scraping</label>
          <input name="notes" placeholder="Sources, méthode, contact..."
            style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 12px', fontSize: 14, width: '100%' }} />
        </div>
        <button type="submit"
          style={{ background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          Ajouter
        </button>
      </form>

      {/* Cities table */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
              {['Ville', 'INSEE', 'Département', 'Status', 'Notes', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '8px 12px 12px 0', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cities?.map((c) => {
              const col = statusColor(c.status);
              const commune = c.communes as { nom: string; code_postal: string; code_dept: string } | null;
              return (
                <tr key={c.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                  <td style={{ padding: '12px 0', fontWeight: 600, color: '#111827' }}>{commune?.nom ?? c.commune_insee}</td>
                  <td style={{ padding: '12px 12px 12px 0', color: '#6b7280', fontFamily: 'monospace' }}>{c.commune_insee}</td>
                  <td style={{ padding: '12px 12px 12px 0', color: '#6b7280' }}>{commune?.code_dept}</td>
                  <td style={{ padding: '12px 12px 12px 0' }}>
                    <span style={{ background: col.bg, color: col.text, padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>{c.status}</span>
                  </td>
                  <td style={{ padding: '12px 12px 12px 0', color: '#6b7280', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.notes ?? '—'}</td>
                  <td style={{ padding: '12px 0' }}>
                    <form action={toggleStatus} style={{ display: 'inline' }}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="status" value={c.status} />
                      <button type="submit"
                        style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', color: '#374151' }}>
                        {c.status === 'active' ? 'Mettre en pause' : 'Réactiver'}
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!cities?.length && <p style={{ color: '#6b7280', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>Aucune ville suivie.</p>}
      </div>
    </div>
  );
}
