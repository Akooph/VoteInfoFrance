export default function LandingPage() {
  return (
    <main style={{ fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>
      <header style={{ background: '#1d4ed8', color: '#fff', padding: '60px 24px 80px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 42, fontWeight: 800, margin: '0 0 16px', letterSpacing: -1 }}>
          VoteInfoFrance
        </h1>
        <p style={{ fontSize: 20, opacity: 0.9, maxWidth: 560, margin: '0 auto 32px' }}>
          Restez informé des décisions politiques à tous les niveaux —
          commune, département, région, national et européen.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="https://voteinfofrance.vercel.app"
            style={{ padding: '14px 28px', background: '#fff', color: '#1d4ed8', borderRadius: 8, fontWeight: 700, fontSize: 16, textDecoration: 'none' }}
          >
            Ouvrir l&apos;application →
          </a>
        </div>
      </header>

      <section style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, marginBottom: 48 }}>
          Comment ça marche ?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32 }}>
          {[
            {
              step: '1',
              title: 'Entrez votre code postal',
              desc: 'Nous identifions votre commune, département, région et vos représentants européens.',
            },
            {
              step: '2',
              title: 'Découvrez les décisions',
              desc: 'Chaque proposition est résumée par IA : résumé, arguments pour et contre.',
            },
            {
              step: '3',
              title: 'Votez et comparez',
              desc: 'Votez POUR, CONTRE, INFO ou BLANC. Visualisez les résultats sur une carte de France.',
            },
          ].map((item) => (
            <div key={item.step} style={{ textAlign: 'center', padding: 24 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                {item.step}
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{item.title}</h3>
              <p style={{ color: '#6b7280', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: '#f3f4f6', padding: '48px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>5 niveaux d&apos;information</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          {['Commune', 'Département', 'Région', 'National', 'Européen'].map((level) => (
            <span key={level} style={{ padding: '6px 16px', background: '#1d4ed8', color: '#fff', borderRadius: 20, fontSize: 14, fontWeight: 500 }}>
              {level}
            </span>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 700, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Sources officielles uniquement</h2>
        <p style={{ color: '#6b7280', lineHeight: 1.7, fontSize: 16 }}>
          Assemblée Nationale · Sénat · Légifrance · Parlement Européen · Conseils Régionaux
          via data.gouv.fr. Toutes les propositions sont résumées par Mistral AI.
        </p>
      </section>

      <footer style={{ background: '#111827', color: '#9ca3af', padding: '24px', textAlign: 'center', fontSize: 13 }}>
        <p style={{ margin: '0 0 8px' }}>
          VoteInfoFrance — Open source sur{' '}
          <a href="https://github.com/Akooph/VoteInfoFrance" style={{ color: '#60a5fa' }}>GitHub</a>
        </p>
        <p style={{ margin: 0 }}>Données publiques françaises · Conforme RGPD</p>
      </footer>
    </main>
  );
}
