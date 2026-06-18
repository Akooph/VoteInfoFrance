import MapLandingWrapper from '@/components/map/map-landing-wrapper';

const APK_URL = 'https://github.com/Akooph/VoteInfoFrance/releases/download/android-latest/voteinfofrance.apk';

export default function LandingPage() {
  return (
    <main style={{ fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif', color: '#111827' }}>

      {/* Nav */}
      <nav style={{ background: '#1d4ed8', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>VoteInfoFrance</span>
        <div style={{ display: 'flex', gap: 12 }}>
          <a href="/dashboard" style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, textDecoration: 'none', fontWeight: 500 }}>Propositions</a>
          <a href="/onboarding" style={{ color: '#fff', fontSize: 14, fontWeight: 700, background: 'rgba(255,255,255,0.2)', padding: '5px 14px', borderRadius: 6, textDecoration: 'none' }}>Mon code postal</a>
          <a href="/sign-in" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, textDecoration: 'none', padding: '5px 0' }}>Connexion</a>
        </div>
      </nav>

      {/* Hero */}
      <header style={{ background: '#1d4ed8', color: '#fff', padding: '60px 24px 80px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 42, fontWeight: 800, margin: '0 0 16px', letterSpacing: -1 }}>
          VoteInfoFrance
        </h1>
        <p style={{ fontSize: 20, opacity: 0.9, maxWidth: 560, margin: '0 auto 40px' }}>
          Restez informé des décisions politiques à tous les niveaux —
          commune, département, région, national et européen.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/onboarding"
            style={{ padding: '14px 28px', background: '#fff', color: '#1d4ed8', borderRadius: 8, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
            Entrer mon code postal →
          </a>
          <a href={APK_URL}
            style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
            ⬇ APK Android
          </a>
        </div>
      </header>

      {/* Interactive map */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '64px 24px 32px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          Explorez par département
        </h2>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: 32, fontSize: 16 }}>
          Cliquez sur un département pour voir les propositions en cours.
        </p>
        <MapLandingWrapper />
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 26, fontWeight: 700, marginBottom: 48 }}>
          Comment ça marche ?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32 }}>
          {[
            { step: '1', title: 'Entrez votre code postal', desc: 'Nous identifions votre commune, département, région et vos représentants européens.' },
            { step: '2', title: 'Découvrez les décisions', desc: 'Chaque proposition est résumée par IA : résumé, arguments pour et contre.' },
            { step: '3', title: 'Votez depuis l\'app', desc: 'Téléchargez l\'app mobile pour voter POUR, CONTRE, INFO ou BLANC et suivre les résultats.' },
          ].map((item) => (
            <div key={item.step} style={{ textAlign: 'center', padding: '0 16px' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                {item.step}
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{item.title}</h3>
              <p style={{ color: '#6b7280', lineHeight: 1.6, margin: 0, fontSize: 15 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Geo levels */}
      <section style={{ background: '#f3f4f6', padding: '40px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>5 niveaux d&apos;information</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          {['Commune', 'Département', 'Région', 'National', 'Européen'].map((level) => (
            <span key={level} style={{ padding: '6px 16px', background: '#1d4ed8', color: '#fff', borderRadius: 20, fontSize: 14, fontWeight: 500 }}>
              {level}
            </span>
          ))}
        </div>
      </section>

      {/* Sources */}
      <section style={{ maxWidth: 700, margin: '0 auto', padding: '56px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Sources officielles uniquement</h2>
        <p style={{ color: '#6b7280', lineHeight: 1.7, fontSize: 15 }}>
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
