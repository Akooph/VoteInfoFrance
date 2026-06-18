'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export function NavHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/dashboard');
    router.refresh();
  }

  return (
    <header style={styles.header}>
      <a href="/dashboard" style={styles.brand}>VoteInfoFrance</a>
      <nav style={styles.nav}>
        <a href="/dashboard" style={styles.link}>Actualités</a>
        <a href="/map" style={styles.link}>Carte</a>
        {isLoggedIn ? (
          <button onClick={handleSignOut} style={styles.authBtn}>Déconnexion</button>
        ) : (
          <a href="/sign-in" style={styles.authLink}>Connexion</a>
        )}
      </nav>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: { background: '#1d4ed8', padding: '0 20px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  brand: { color: '#fff', fontWeight: 800, fontSize: 18, textDecoration: 'none' },
  nav: { display: 'flex', alignItems: 'center', gap: 16 },
  link: { color: 'rgba(255,255,255,0.85)', fontSize: 14, textDecoration: 'none', fontWeight: 500 },
  authBtn: { color: 'rgba(255,255,255,0.7)', fontSize: 13, background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 500 },
  authLink: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600, textDecoration: 'none', background: 'rgba(255,255,255,0.15)', padding: '5px 12px', borderRadius: 6 },
};
