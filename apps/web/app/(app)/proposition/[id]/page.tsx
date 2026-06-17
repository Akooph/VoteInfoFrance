import PropositionPageClient from './proposition-client';

// output:export requires at least one entry from generateStaticParams.
// Landing build: return a placeholder so the dynamic route compiles as a static
// shell (client component renders its loading state — no API calls made).
// SSR build: return [] so all params are handled at runtime (dynamicParams=true default).
export async function generateStaticParams() {
  if (process.env.NEXT_LANDING_ONLY === 'true') {
    return [{ id: '_' }];
  }
  return [];
}

export default function PropositionPage({ params }: { params: Promise<{ id: string }> }) {
  return <PropositionPageClient params={params} />;
}
