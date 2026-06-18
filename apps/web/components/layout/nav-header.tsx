'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';

const NAV_TABS = [
  { href: '/dashboard', label: 'Propositions', icon: '📋' },
  { href: '/map',       label: 'Carte',        icon: '🗺️' },
  { href: '/onboarding', label: 'Localisation', icon: '📍' },
] as const;

export function NavHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setIsLoggedIn(!!session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setIsLoggedIn(!!session));
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/dashboard');
    router.refresh();
  }

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname.startsWith('/proposition');
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <header className="vif-top-header">
        <a href="/dashboard" style={{ color: '#fff', fontWeight: 800, fontSize: 18, textDecoration: 'none', letterSpacing: -0.3 }}>
          VoteInfoFrance
        </a>

        {/* Desktop nav */}
        <nav className="vif-nav-desktop">
          {NAV_TABS.map((t) => (
            <a key={t.href} href={t.href} style={{
              color: isActive(t.href) ? '#fff' : 'rgba(255,255,255,0.72)',
              fontSize: 14,
              fontWeight: isActive(t.href) ? 700 : 500,
              textDecoration: 'none',
            }}>
              {t.label}
            </a>
          ))}
          {isLoggedIn ? (
            <button onClick={handleSignOut} style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13, background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
              Déconnexion
            </button>
          ) : (
            <a href="/sign-in" style={{ color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none', background: 'rgba(255,255,255,0.18)', padding: '5px 14px', borderRadius: 6 }}>
              Connexion
            </a>
          )}
        </nav>

        {/* Mobile: auth shortcut in top-right */}
        <div className="vif-nav-mobile">
          {isLoggedIn ? (
            <button onClick={handleSignOut} style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px 4px', minHeight: 44 }}>
              Quitter
            </button>
          ) : (
            <a href="/sign-in" style={{ color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none', padding: '8px 4px', minHeight: 44, display: 'flex', alignItems: 'center' }}>
              Connexion
            </a>
          )}
        </div>
      </header>

      {/* ── Bottom tab bar (mobile only) ─────────────────────────────── */}
      <nav className="vif-bottom-nav" aria-label="Navigation principale">
        {NAV_TABS.map((t) => (
          <a key={t.href} href={t.href} className={isActive(t.href) ? 'active' : ''}>
            <span className="nav-icon">{t.icon}</span>
            <span>{t.label}</span>
          </a>
        ))}
        {isLoggedIn ? (
          <button onClick={handleSignOut} style={{ color: '#9ca3af' }}>
            <span className="nav-icon">🚪</span>
            <span>Quitter</span>
          </button>
        ) : (
          <a href="/sign-in" className={pathname === '/sign-in' ? 'active' : ''}>
            <span className="nav-icon">👤</span>
            <span>Connexion</span>
          </a>
        )}
      </nav>
    </>
  );
}
