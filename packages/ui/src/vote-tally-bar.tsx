import React from 'react';
import type { VoteTally, VoteOption } from '@vif/types';

const BAR_COLORS: Record<VoteOption, string> = {
  POUR: '#16a34a',
  CONTRE: '#dc2626',
  INFO: '#d97706',
  BLANC: '#6b7280',
};

type Props = {
  tally: VoteTally;
};

export function VoteTallyBar({ tally }: Props) {
  const options: VoteOption[] = ['POUR', 'CONTRE', 'INFO', 'BLANC'];
  const total = tally.total || 1;

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', gap: 1 }}>
        {options.map((opt) => {
          const pct = (tally[opt] / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={opt}
              style={{ width: `${pct}%`, backgroundColor: BAR_COLORS[opt] }}
              title={`${opt}: ${tally[opt].toLocaleString('fr-FR')} (${pct.toFixed(1)}%)`}
            />
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 12 }}>
        {options.map((opt) => (
          <span key={opt} style={{ color: BAR_COLORS[opt] }}>
            {opt} {tally[opt].toLocaleString('fr-FR')}
          </span>
        ))}
        <span style={{ color: '#9ca3af', marginLeft: 'auto' }}>
          {total.toLocaleString('fr-FR')} votes
        </span>
      </div>
    </div>
  );
}
