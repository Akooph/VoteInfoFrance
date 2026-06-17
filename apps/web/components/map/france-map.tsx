'use client';

import { useEffect, useRef, useState } from 'react';
import MapGL, { Source, Layer, Popup } from 'react-map-gl/maplibre';
import type { MapLayerMouseEvent } from 'react-map-gl/maplibre';
import type { DepartmentVoteTally } from '@vif/types';
import type { FeatureCollection } from 'geojson';
import 'maplibre-gl/dist/maplibre-gl.css';

type Props = {
  data: DepartmentVoteTally[];
};

type HoverInfo = {
  longitude: number;
  latitude: number;
  codeDept: string;
  data: DepartmentVoteTally | null;
};

const MAP_STYLE = process.env['NEXT_PUBLIC_MAP_STYLE'] ?? 'https://demotiles.maplibre.org/style.json';

export default function FranceMap({ data }: Props) {
  const [geojson, setGeojson] = useState<FeatureCollection | null>(null);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);

  useEffect(() => {
    fetch('/geo/departements.geojson')
      .then((r) => r.json())
      .then((raw: FeatureCollection) => {
        const dataMap = new Map(data.map((d) => [d.codeDept, d]));
        const enriched: FeatureCollection = {
          ...raw,
          features: raw.features.map((f) => {
            const code = f.properties?.['code'] as string | undefined;
            const tally = code ? dataMap.get(code) : undefined;
            return {
              ...f,
              properties: {
                ...f.properties,
                pour_ratio: tally && tally.total > 0 ? tally.POUR / tally.total : 0,
                total: tally?.total ?? 0,
                POUR: tally?.POUR ?? 0,
                CONTRE: tally?.CONTRE ?? 0,
                INFO: tally?.INFO ?? 0,
                BLANC: tally?.BLANC ?? 0,
              },
            };
          }),
        };
        setGeojson(enriched);
      });
  }, [data]);

  function onHover(e: MapLayerMouseEvent) {
    const feature = e.features?.[0];
    if (feature) {
      const code = feature.properties?.['code'] as string;
      const tally = data.find((d) => d.codeDept === code) ?? null;
      setHoverInfo({ longitude: e.lngLat.lng, latitude: e.lngLat.lat, codeDept: code, data: tally });
    } else {
      setHoverInfo(null);
    }
  }

  if (!geojson) return null;

  return (
    <MapGL
      initialViewState={{ longitude: 2.5, latitude: 46.5, zoom: 5.2 }}
      style={{ width: '100%', height: '100%' }}
      mapStyle={MAP_STYLE}
      interactiveLayerIds={['departments-fill']}
      onMouseMove={onHover}
      onMouseLeave={() => setHoverInfo(null)}
    >
      <Source id="departments" type="geojson" data={geojson}>
        <Layer
          id="departments-fill"
          type="fill"
          paint={{
            'fill-color': [
              'interpolate', ['linear'],
              ['get', 'pour_ratio'],
              0, '#f7fbff',
              0.25, '#6baed6',
              0.5, '#2171b5',
              0.75, '#08519c',
              1, '#08306b',
            ],
            'fill-opacity': 0.75,
          }}
        />
        <Layer
          id="departments-outline"
          type="line"
          paint={{ 'line-color': '#fff', 'line-width': 1 }}
        />
      </Source>

      {hoverInfo && (
        <Popup longitude={hoverInfo.longitude} latitude={hoverInfo.latitude} closeButton={false} anchor="bottom">
          <div style={{ padding: 8, fontSize: 13, minWidth: 160 }}>
            <strong>Département {hoverInfo.codeDept}</strong>
            {hoverInfo.data ? (
              <div style={{ marginTop: 6, lineHeight: 1.6 }}>
                <div style={{ color: '#16a34a' }}>Pour : {hoverInfo.data.POUR.toLocaleString('fr-FR')}</div>
                <div style={{ color: '#dc2626' }}>Contre : {hoverInfo.data.CONTRE.toLocaleString('fr-FR')}</div>
                <div style={{ color: '#d97706' }}>Info : {hoverInfo.data.INFO.toLocaleString('fr-FR')}</div>
                <div style={{ color: '#6b7280' }}>Blanc : {hoverInfo.data.BLANC.toLocaleString('fr-FR')}</div>
                <div style={{ marginTop: 4, color: '#374151' }}>Total : {hoverInfo.data.total.toLocaleString('fr-FR')}</div>
              </div>
            ) : (
              <div style={{ marginTop: 6, color: '#9ca3af' }}>Aucun vote</div>
            )}
          </div>
        </Popup>
      )}
    </MapGL>
  );
}
