export const dynamic = 'force-dynamic';

import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { revalidatePath } from 'next/cache';

async function toggleAdmin(formData: FormData) {
  'use server';
  const db = createSupabaseAdminClient();
  const id = formData.get('id') as string;
  const current = formData.get('role') as string;
  await db.from('user_profiles').update({ role: current === 'admin' ? 'user' : 'admin' }).eq('id', id);
  revalidatePath('/admin/users');
}

export default async function UsersPage() {
  const db = createSupabaseAdminClient();

  const { data: users, count } = await db
    .from('user_profiles')
    .select('id, role, commune_insee, communes(nom)', { count: 'exact' })
    .order('id')
    .limit(100);

  const { data: authUsers } = await db.auth.admin.listUsers({ perPage: 100 });
  const emailMap = Object.fromEntries(authUsers.users.map((u) => [u.id, u.email]));

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px', color: '#111827' }}>Utilisateurs</h1>
      <p style={{ color: '#6b7280', margin: '0 0 24px', fontSize: 14 }}>{count ?? 0} comptes</p>

      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
              {['Email', 'Commune', 'Rôle', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '8px 12px 12px 0', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users?.map((u) => {
              const commune = u.communes as unknown as { nom: string } | null;
              return (
                <tr key={u.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                  <td style={{ padding: '10px 12px 10px 0', color: '#111827' }}>{emailMap[u.id] ?? u.id.slice(0, 8) + '…'}</td>
                  <td style={{ padding: '10px 12px 10px 0', color: '#6b7280' }}>{commune?.nom ?? u.commune_insee ?? '—'}</td>
                  <td style={{ padding: '10px 12px 10px 0' }}>
                    <span style={{ background: u.role === 'admin' ? '#ede9fe' : '#f3f4f6', color: u.role === 'admin' ? '#5b21b6' : '#374151', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '10px 0' }}>
                    <form action={toggleAdmin}>
                      <input type="hidden" name="id" value={u.id} />
                      <input type="hidden" name="role" value={u.role} />
                      <button type="submit"
                        style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: 6, padding: '3px 8px', fontSize: 11, cursor: 'pointer', color: '#374151' }}>
                        {u.role === 'admin' ? 'Rétrograder' : 'Promouvoir admin'}
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!users?.length && <p style={{ color: '#6b7280', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>Aucun utilisateur.</p>}
      </div>
    </div>
  );
}
