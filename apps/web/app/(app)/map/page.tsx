'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api-client';
import type { DepartmentVoteTally } from '@vif/types';

const FranceMap = dynamic(() => import('@/components/map/france-map'), { ssr: false });

function MapContent() {
  const searchParams = useSearchParams();
  const propositionId = searchParams.get('propositionId');
  const [mapData, setMapData] = useState<DepartmentVoteTally[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!propositionId) return;
    setLoading(true);
    api.propositions.mapData(propositionId)
      .then(setMapData)
      .finally(() => setLoading(false));
  }, [propositionId]);

  if (!propositionId) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: '#6b7280' }}>
        Sélectionnez une proposition depuis le tableau de bord pour visualiser les résultats.
      </div>
    );
  }

  return (
    <div style={{ height: 'calc(100vh - var(--nav-top-h))', display: 'flex', flexDirection: 'column' }} className="vif-map-fullscreen">
      <div style={{ padding: '12px 16px', background: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: 12, alignItems: 'center' }}>
        <a href={`/proposition/${propositionId}`} style={{ fontSize: 14, color: '#2563eb', textDecoration: 'none' }}>
          ← Retour à la proposition
        </a>
        {loading && <span style={{ fontSize: 13, color: '#6b7280' }}>Chargement des données...</span>}
      </div>
      <div style={{ flex: 1 }}>
        <FranceMap data={mapData} />
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={<div style={{ padding: 32, textAlign: 'center', color: '#6b7280' }}>Chargement...</div>}>
      <MapContent />
    </Suspense>
  );
}
