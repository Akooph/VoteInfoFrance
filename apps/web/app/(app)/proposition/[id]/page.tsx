import PropositionPageClient from './proposition-client';

// Landing build (output: 'export'): generate 0 static pages and disable dynamic
// params so this route is skipped entirely. Regular SSR build keeps dynamicParams=true.
export const dynamicParams = process.env.NEXT_LANDING_ONLY !== 'true';
export function generateStaticParams() { return []; }

export default function PropositionPage({ params }: { params: Promise<{ id: string }> }) {
  return <PropositionPageClient params={params} />;
}
