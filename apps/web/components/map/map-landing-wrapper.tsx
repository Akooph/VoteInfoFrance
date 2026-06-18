'use client';

import dynamic from 'next/dynamic';

const MapLanding = dynamic(() => import('./map-landing'), { ssr: false });

export default function MapLandingWrapper() {
  return <MapLanding />;
}
