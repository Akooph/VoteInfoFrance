import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { revalidatePath } from 'next/cache';

async function resetSummary(formData: FormData) {
  'use server';
  const db = createSupabaseAdminClient();
  const id = formData.get('id') as string;
  await db.from('summaries').update({
    resume: 'Résumé en cours de génération…',
    pour: "Arguments en cours d'analyse.",
    contre: "Arguments en cours d'analyse.",
    model_used: 'placeholder',
  }).eq('id', id);
  revalidatePath('/admin/summaries');
}

async function deleteSummary(formData: FormData) {
  'use server';
  const db = createSupabaseAdminClient();
  const id = formData.get('id') as string;
  await db.from('summaries').delete().eq('id', id);
  revalidatePath('/admin/summaries');
}

export default async function SummariesPage() {
  const db = createSupabaseAdminClient();

  const { data: summaries, count } = await db
    .from('summaries')
    .select('id, model_used, generated_at, propositions(titre)', { count: 'exact' })
    .order('generated_at', { ascending: false })
    .limit(50);

  const isPlaceholder = (model: string) => model === 'placeholder';

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px', color: '#111827' }}>Résumés IA</h1>
      <p style={{ color: '#6b7280', margin: '0 0 24px', fontSize: 14 }}>{count ?? 0} résumés générés</p>

      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
              {['Proposition', 'Modèle', 'Généré le', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '8px 12px 12px 0', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {summaries?.map((s) => {
              const placeholder = isPlaceholder(s.model_used);
              const prop = s.propositions as { titre: string } | null;
              return (
                <tr key={s.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                  <td style={{ padding: '10px 12px 10px 0', color: '#111827', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={prop?.titre}>{prop?.titre ?? '—'}</td>
                  <td style={{ padding: '10px 12px 10px 0' }}>
                    <span style={{ background: placeholder ? '#fef9c3' : '#d1fae5', color: placeholder ? '#92400e' : '#065f46', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                      {s.model_used}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px 10px 0', color: '#9ca3af', fontSize: 12 }}>{s.generated_at ? new Date(s.generated_at).toLocaleString('fr-FR') : '—'}</td>
                  <td style={{ padding: '10px 0', display: 'flex', gap: 8 }}>
                    <form action={resetSummary}>
                      <input type="hidden" name="id" value={s.id} />
                      <button type="submit" style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: 6, padding: '3px 8px', fontSize: 11, cursor: 'pointer', color: '#374151' }}>
                        Réinitialiser
                      </button>
                    </form>
                    <form action={deleteSummary}>
                      <input type="hidden" name="id" value={s.id} />
                      <button type="submit" style={{ background: 'none', border: '1px solid #fca5a5', borderRadius: 6, padding: '3px 8px', fontSize: 11, cursor: 'pointer', color: '#dc2626' }}>
                        Supprimer
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!summaries?.length && <p style={{ color: '#6b7280', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>Aucun résumé.</p>}
      </div>
    </div>
  );
}
