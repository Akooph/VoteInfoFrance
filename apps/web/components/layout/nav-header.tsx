'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export function NavHeader() {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/sign-in');
    router.refresh();
  }

  return (
    <header style={styles.header}>
      <a href="/dashboard" style={styles.brand}>VoteInfoFrance</a>
      <nav style={styles.nav}>
        <a href="/dashboard" style={styles.link}>Actualités</a>
        <a href="/map" style={styles.link}>Carte</a>
        <button onClick={handleSignOut} style={styles.signOut}>Déconnexion</button>
      </nav>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: { background: '#1d4ed8', padding: '0 20px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  brand: { color: '#fff', fontWeight: 800, fontSize: 18, textDecoration: 'none' },
  nav: { display: 'flex', alignItems: 'center', gap: 16 },
  link: { color: 'rgba(255,255,255,0.85)', fontSize: 14, textDecoration: 'none', fontWeight: 500 },
  signOut: { color: 'rgba(255,255,255,0.7)', fontSize: 13, background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 500 },
};
