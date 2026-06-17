import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VoteInfoFrance',
  description: 'L\'information civique pour tous les citoyens français',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
