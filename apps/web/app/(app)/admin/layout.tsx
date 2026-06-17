const NAV = [
  { href: '/admin', label: '📊 Dashboard' },
  { href: '/admin/cities', label: '🏙️ Villes' },
  { href: '/admin/propositions', label: '📋 Propositions' },
  { href: '/admin/ingestion', label: '⚙️ Ingestion' },
  { href: '/admin/summaries', label: '🤖 Résumés' },
  { href: '/admin/users', label: '👥 Utilisateurs' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>
      <aside style={{ width: 220, background: '#111827', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #1f2937' }}>
          <a href="/dashboard" style={{ color: '#6b7280', fontSize: 12, textDecoration: 'none' }}>← Retour à l'app</a>
          <p style={{ color: '#fff', fontWeight: 800, fontSize: 18, margin: '6px 0 0' }}>Admin</p>
        </div>
        <nav style={{ padding: '8px 0' }}>
          {NAV.map(({ href, label }) => (
            <a key={href} href={href}
              style={{ display: 'block', padding: '10px 20px', color: '#d1d5db', fontSize: 14, textDecoration: 'none' }}>
              {label}
            </a>
          ))}
        </nav>
      </aside>
      <main style={{ flex: 1, padding: 32, background: '#f9fafb', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
