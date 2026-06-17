import React from 'react';
import type { VoteOption } from '@vif/types';

const VOTE_CONFIG: Record<VoteOption, { label: string; color: string }> = {
  POUR: { label: 'Pour', color: '#16a34a' },
  CONTRE: { label: 'Contre', color: '#dc2626' },
  INFO: { label: 'Info', color: '#d97706' },
  BLANC: { label: 'Blanc', color: '#6b7280' },
};

type Props = {
  option: VoteOption;
  count?: number;
  selected?: boolean;
};

export function VoteBadge({ option, count, selected }: Props) {
  const config = VOTE_CONFIG[option];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 10px',
        borderRadius: 9999,
        backgroundColor: selected ? config.color : `${config.color}20`,
        color: selected ? '#fff' : config.color,
        fontWeight: 600,
        fontSize: 13,
        border: `1.5px solid ${config.color}`,
      }}
    >
      {config.label}
      {count !== undefined && (
        <span style={{ fontWeight: 400, opacity: 0.85 }}>{count.toLocaleString('fr-FR')}</span>
      )}
    </span>
  );
}
