import React from 'react';
import type { GeoLevel } from '@vif/types';

const LEVEL_CONFIG: Record<GeoLevel, { label: string; color: string }> = {
  commune: { label: 'Commune', color: '#7c3aed' },
  departement: { label: 'Département', color: '#0284c7' },
  region: { label: 'Région', color: '#0891b2' },
  national: { label: 'National', color: '#1d4ed8' },
  europeen: { label: 'Européen', color: '#1e40af' },
};

type Props = {
  level: GeoLevel;
};

export function GeoLevelBadge({ level }: Props) {
  const config = LEVEL_CONFIG[level];
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '1px 8px',
        borderRadius: 4,
        backgroundColor: `${config.color}15`,
        color: config.color,
        fontWeight: 500,
        fontSize: 12,
        border: `1px solid ${config.color}40`,
      }}
    >
      {config.label}
    </span>
  );
}
