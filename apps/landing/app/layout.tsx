import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VoteInfoFrance — Restez informé des décisions politiques',
  description: "Découvrez les propositions législatives à tous les niveaux géographiques et votez.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
