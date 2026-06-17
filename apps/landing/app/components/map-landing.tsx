'use client';

import { useEffect, useRef, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

type Proposition = {
  id: string;
  titre: string;
  institution: string;
  status: string;
  date_depot: string;
};

type Department = { code: string; nom: string };

export default function MapLanding({ basePath }: { basePath: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Department | null>(null);
  const [propositions, setPropositions] = useState<Proposition[]>([]);
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
  );

  useEffect(() => {
    let map: import('maplibre-gl').Map;

    import('maplibre-gl').then(({ default: maplibregl }) => {
      import('maplibre-gl/dist/maplibre-gl.css' as never);

      if (!containerRef.current) return;

      map = new maplibregl.Map({
        container: containerRef.current,
        style: {
          version: 8,
          sources: {},
          layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#dbeafe' } }],
        },
        center: [2.3, 46.5],
        zoom: 4.5,
        attributionControl: false,
      });

      map.on('load', () => {
        map.addSource('depts', {
          type: 'geojson',
          data: `${basePath}/geo/departements.geojson`,
          generateId: true,
        });

        map.addLayer({
          id: 'depts-fill',
          type: 'fill',
          source: 'depts',
          paint: {
            'fill-color': ['case', ['boolean', ['feature-state', 'hover'], false], '#1d4ed8', '#3b82f6'],
            'fill-opacity': 0.65,
          },
        });

        map.addLayer({
          id: 'depts-border',
          type: 'line',
          source: 'depts',
          paint: { 'line-color': '#fff', 'line-width': 0.6 },
        });

        let hoveredId: number | null = null;

        map.on('mousemove', 'depts-fill', (e) => {
          if (!e.features?.length) return;
          if (hoveredId !== null) map.setFeatureState({ source: 'depts', id: hoveredId }, { hover: false });
          hoveredId = e.features[0].id as number;
          map.setFeatureState({ source: 'depts', id: hoveredId }, { hover: true });
          map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'depts-fill', () => {
          if (hoveredId !== null) map.setFeatureState({ source: 'depts', id: hoveredId }, { hover: false });
          hoveredId = null;
          map.getCanvas().style.cursor = '';
        });

        map.on('click', 'depts-fill', (e) => {
          const props = e.features?.[0]?.properties as { code: string; nom: string } | undefined;
          if (props) setSelected({ code: props.code, nom: props.nom });
        });
      });
    });

    return () => map?.remove();
  }, [basePath]);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    setPropositions([]);
    supabase
      .from('propositions')
      .select('id, titre, institution, status, date_depot')
      .or(`geo_code.eq.${selected.code},geo_level.eq.national`)
      .order('date_depot', { ascending: false })
      .limit(8)
      .then(({ data }) => { setPropositions(data ?? []); setLoading(false); });
  }, [selected]);

  return (
    <div style={{ position: 'relative', height: 520, borderRadius: 16, overflow: 'hidden' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {selected && (
        <div style={{
          position: 'absolute', top: 16, right: 16, width: 300,
          background: '#fff', borderRadius: 12, padding: 20,
          boxShadow: '0 4px 24px rgba(0,0,0,0.15)', maxHeight: 460, overflowY: 'auto',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>{selected.nom}</h3>
            <button onClick={() => setSelected(null)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 20, color: '#9ca3af', lineHeight: 1 }}>
              ×
            </button>
          </div>

          {loading && <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>Chargement…</p>}

          {!loading && propositions.length === 0 && (
            <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>Aucune proposition pour ce département.</p>
          )}

          {!loading && propositions.map((p, i) => (
            <div key={p.id} style={{
              paddingBottom: 10, marginBottom: 10,
              borderBottom: i < propositions.length - 1 ? '1px solid #f3f4f6' : 'none',
            }}>
              <p style={{ margin: '0 0 3px', fontSize: 13, fontWeight: 600, color: '#111827', lineHeight: 1.4 }}>{p.titre}</p>
              <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>{p.institution} · {p.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
