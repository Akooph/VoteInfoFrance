import PropositionPageClient from './proposition-client';

// Static export (landing build): returning [] means 0 pages are generated and
// the route is skipped in the output. SSR build: dynamicParams defaults to true
// so the route is handled at runtime as normal.
export function generateStaticParams() { return []; }

export default function PropositionPage({ params }: { params: Promise<{ id: string }> }) {
  return <PropositionPageClient params={params} />;
}
