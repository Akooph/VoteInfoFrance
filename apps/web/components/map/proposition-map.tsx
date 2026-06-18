'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase';

type MapRow = { code_dept: string; pour: number; contre: number; info: number; blanc: number; total: number };
type GeoFeature = { type: string; properties: Record<string, unknown>; geometry: unknown };
type GeoCollection = { type: string; features: GeoFeature[] };

export default function PropositionMap({ propositionId }: { propositionId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapData, setMapData] = useState<MapRow[] | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase
      .rpc('get_proposition_map_data', { p_id: propositionId })
      .then(({ data }) => setMapData((data as MapRow[]) ?? []));
  }, [propositionId]);

  useEffect(() => {
    if (mapData === null) return;
    let map: import('maplibre-gl').Map;

    const byDept: Record<string, MapRow> = {};
    mapData.forEach((r) => { byDept[r.code_dept] = r; });

    import('maplibre-gl').then(async ({ default: maplibregl }) => {
      await import('maplibre-gl/dist/maplibre-gl.css' as never);
      if (!containerRef.current) return;

      map = new maplibregl.Map({
        container: containerRef.current,
        style: { version: 8, sources: {}, layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#dbeafe' } }] },
        center: [2.3, 46.5],
        zoom: 4.5,
        attributionControl: false,
      });

      map.on('load', () => {
        fetch('/geo/departements.geojson')
          .then((r) => r.json())
          .then((geojson: GeoCollection) => {
            const enriched: GeoCollection = {
              ...geojson,
              features: geojson.features.map((f) => {
                const code = f.properties['code'] as string;
                const row = byDept[code];
                return {
                  ...f,
                  properties: {
                    ...f.properties,
                    pour_ratio: row && row.total > 0 ? row.pour / row.total : -1,
                    _row: row ?? null,
                  },
                };
              }),
            };

            map.addSource('depts', { type: 'geojson', data: enriched as Parameters<typeof map.addSource>[1] extends { data: infer D } ? D : never, generateId: true });

            map.addLayer({
              id: 'depts-fill', type: 'fill', source: 'depts',
              paint: {
                'fill-color': [
                  'case',
                  ['<', ['get', 'pour_ratio'], 0],
                  '#d1d5db',
                  [
                    'interpolate', ['linear'], ['get', 'pour_ratio'],
                    0, '#fca5a5',
                    0.5, '#fef9c3',
                    1, '#86efac',
                  ],
                ],
                'fill-opacity': 0.85,
              },
            });

            map.addLayer({ id: 'depts-border', type: 'line', source: 'depts', paint: { 'line-color': '#fff', 'line-width': 0.6 } });

            const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, maxWidth: '220px' });

            map.on('mousemove', 'depts-fill', (e) => {
              if (!e.features?.length) return;
              const props = e.features[0].properties as { nom: string; code: string };
              const row = byDept[props.code];
              const html = row
                ? `<strong>${props.nom}</strong><br><span style="color:#16a34a">POUR ${row.pour}</span> · <span style="color:#dc2626">CONTRE ${row.contre}</span><br><span style="color:#d97706">INFO ${row.info}</span> · <span style="color:#6b7280">BLANC ${row.blanc}</span>`
                : `<strong>${props.nom}</strong><br><span style="color:#9ca3af">Aucun vote</span>`;
              popup.setLngLat(e.lngLat).setHTML(html).addTo(map);
              map.getCanvas().style.cursor = 'pointer';
            });

            map.on('mouseleave', 'depts-fill', () => {
              popup.remove();
              map.getCanvas().style.cursor = '';
            });
          });
      });
    });

    return () => { map?.remove(); };
  }, [mapData]);

  if (mapData === null) {
    return (
      <div style={{ height: 420, background: '#f3f4f6', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 14 }}>
        Chargement de la carte…
      </div>
    );
  }

  if (mapData.length === 0) {
    return (
      <div style={{ height: 420, background: '#f9fafb', borderRadius: 12, border: '1px dashed #e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <div style={{ fontSize: 32 }}>🗺️</div>
        <div style={{ color: '#6b7280', fontWeight: 600, fontSize: 14 }}>Pas encore de données</div>
        <div style={{ color: '#9ca3af', fontSize: 13 }}>La carte se remplira au fur et à mesure des votes.</div>
      </div>
    );
  }

  return (
    <div>
      <div ref={containerRef} style={{ height: 420, borderRadius: 12, overflow: 'hidden' }} />
      <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 12, color: '#6b7280', justifyContent: 'center', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 12, background: '#86efac', borderRadius: 2, display: 'inline-block' }} />100% Pour</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 12, background: '#fef9c3', borderRadius: 2, display: 'inline-block' }} />50/50</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 12, background: '#fca5a5', borderRadius: 2, display: 'inline-block' }} />100% Contre</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 12, background: '#d1d5db', borderRadius: 2, display: 'inline-block' }} />Aucun vote</span>
      </div>
    </div>
  );
}
