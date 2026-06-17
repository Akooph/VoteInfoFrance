import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { revalidatePath } from 'next/cache';

async function deleteProposition(formData: FormData) {
  'use server';
  const db = createSupabaseAdminClient();
  const id = formData.get('id') as string;
  await db.from('votes').delete().eq('proposition_id', id);
  await db.from('summaries').delete().eq('proposition_id', id);
  await db.from('propositions').delete().eq('id', id);
  revalidatePath('/admin/propositions');
}

export default async function PropositionsPage({ searchParams }: { searchParams: Promise<{ q?: string; institution?: string; geo_level?: string }> }) {
  const db = createSupabaseAdminClient();
  const params = await searchParams;

  let query = db.from('propositions')
    .select('id, titre, institution, geo_level, geo_code, status, date_depot', { count: 'exact' })
    .order('date_depot', { ascending: false })
    .limit(50);

  if (params.q) query = query.ilike('titre', `%${params.q}%`);
  if (params.institution) query = query.eq('institution', params.institution);
  if (params.geo_level) query = query.eq('geo_level', params.geo_level);

  const { data: propositions, count } = await query;

  const GEO_LEVELS = ['national', 'europeen', 'region', 'departement', 'commune'];
  const INSTITUTIONS = ['assemblee_nationale', 'senat', 'parlement_europeen', 'conseil_regional', 'conseil_municipal'];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px', color: '#111827' }}>Propositions</h1>
      <p style={{ color: '#6b7280', margin: '0 0 24px', fontSize: 14 }}>{count ?? 0} au total</p>

      {/* Filters */}
      <form method="GET" style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <input name="q" defaultValue={params.q} placeholder="Rechercher dans les titres…"
          style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 12px', fontSize: 14, flex: 1, minWidth: 200 }} />
        <select name="institution" defaultValue={params.institution ?? ''}
          style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 12px', fontSize: 14 }}>
          <option value="">Toutes institutions</option>
          {INSTITUTIONS.map((i) => <option key={i} value={i}>{i.replace(/_/g, ' ')}</option>)}
        </select>
        <select name="geo_level" defaultValue={params.geo_level ?? ''}
          style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 12px', fontSize: 14 }}>
          <option value="">Tous niveaux</option>
          {GEO_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <button type="submit"
          style={{ background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          Filtrer
        </button>
        <a href="/admin/propositions" style={{ fontSize: 14, color: '#6b7280', textDecoration: 'none', padding: '8px 0' }}>Effacer</a>
      </form>

      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
              {['Titre', 'Institution', 'Niveau', 'Code geo', 'Date', ''].map((h) => (
                <th key={h} style={{ padding: '8px 12px 12px 0', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {propositions?.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                <td style={{ padding: '10px 12px 10px 0', color: '#111827', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.titre}>{p.titre}</td>
                <td style={{ padding: '10px 12px 10px 0', color: '#6b7280', fontSize: 12 }}>{p.institution?.replace(/_/g, ' ')}</td>
                <td style={{ padding: '10px 12px 10px 0' }}>
                  <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 6px', borderRadius: 8, fontSize: 11, fontWeight: 600 }}>{p.geo_level}</span>
                </td>
                <td style={{ padding: '10px 12px 10px 0', color: '#9ca3af', fontFamily: 'monospace', fontSize: 12 }}>{p.geo_code ?? '—'}</td>
                <td style={{ padding: '10px 12px 10px 0', color: '#9ca3af', fontSize: 12 }}>{p.date_depot ? new Date(p.date_depot).toLocaleDateString('fr-FR') : '—'}</td>
                <td style={{ padding: '10px 0' }}>
                  <form action={deleteProposition} style={{ display: 'inline' }}
                    onSubmit={(e) => { if (!confirm('Supprimer cette proposition et ses votes ?')) e.preventDefault(); }}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit"
                      style={{ background: 'none', border: '1px solid #fca5a5', borderRadius: 6, padding: '3px 8px', fontSize: 11, cursor: 'pointer', color: '#dc2626' }}>
                      Supprimer
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!propositions?.length && <p style={{ color: '#6b7280', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>Aucune proposition trouvée.</p>}
      </div>
    </div>
  );
}
